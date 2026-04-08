'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { Package, Calendar, User, FileText, CheckCircle, Clock, Truck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
    personalization?: {
        name?: string;
        theme?: string;
        color?: string;
        size?: string;
        observations?: string;
    };
}

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalAmount: number;
    createdAt: string;
    deadlineDate: string;
    address: Record<string, any> | null;
    status: 'pendente' | 'pago' | 'em_producao' | 'conferencia' | 'enviado';
    items: OrderItem[];
}

export default function AdminPedidosPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('todos');

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'orders'), orderBy('deadlineDate', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: Order[] = [];
            snapshot.forEach((docSnap) => {
                fetched.push(docSnap.data() as Order);
            });
            setOrders(fetched);
            setLoading(false);
        }, (err) => {
            console.error(err);
            toast.error('Erro ao carregar pedidos.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success('Status atualizado com sucesso!');
        } catch (err) {
            toast.error('Erro ao atualizar status.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pago': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'em_producao': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'conferencia': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
            case 'enviado': return 'bg-slate-100 text-slate-600 border-slate-300';
            default: return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pago': return 'Pago';
            case 'em_producao': return 'Em Produção';
            case 'conferencia': return 'Em Conferência';
            case 'enviado': return 'Enviado';
            default: return 'Pendente';
        }
    };

    const isUrgent = (deadline: string) => {
        const today = new Date();
        const maxDate = new Date(deadline);
        const diffDays = Math.ceil((maxDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays <= 3; // Yellow/Red alert if 3 days or less
    };

    const filteredOrders = filterStatus === 'todos' 
        ? orders 
        : orders.filter(o => o.status === filterStatus);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar Lateral Básica */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 min-h-screen p-4 flex flex-col gap-2">
                <div className="mb-6 px-2">
                    <h1 className="text-xl font-black text-white tracking-widest uppercase">Admin Danis</h1>
                </div>
                
                <Link href="/admin/gestao-fotos" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-bold">Catálogo / Fotos</span>
                </Link>
                <Link href="/admin/pedidos" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-purple-600 text-white shadow-md">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-bold">Pedidos</span>
                </Link>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Gestão de Pedidos</h2>
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-600 rounded-md text-[10px] font-black tracking-widest uppercase animate-pulse">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> AO VIVO
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Acompanhe prazos e emita fichas técnicas automaticamente.</p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2 flex-wrap">
                        {['todos', 'pendente', 'pago', 'em_producao', 'conferencia', 'enviado'].map(st => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                                    filterStatus === st 
                                        ? 'border-purple-600 bg-purple-50 text-purple-700' 
                                        : 'border-transparent bg-white text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {st === 'todos' ? 'Todos' : getStatusLabel(st)}
                            </button>
                        ))}
                    </div>

                    {/* Lista de Pedidos */}
                    {loading ? (
                        <div className="py-20 text-center text-slate-400 font-bold uppercase animate-pulse">
                            Carregando pedidos...
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-sm">Nenhum pedido encontrado</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredOrders.map(order => {
                                const urgent = order.status !== 'enviado' && isUrgent(order.deadlineDate);
                                
                                // Generate Ficha Link using the exact same logic as webhook
                                const fichaDataPayload = JSON.stringify({
                                    items: order.items,
                                    customer: { 
                                        name: order.customerName,
                                        address: order.address,
                                        deadline: order.deadlineDate 
                                    },
                                    orderId: order.id
                                });
                                const base64Data = btoa(unescape(encodeURIComponent(fichaDataPayload)));
                                const fichaUrl = `/ficha?data=${base64Data}`;

                                return (
                                    <div key={order.id} className={`bg-white rounded-2xl border-2 shadow-sm transition-all overflow-hidden flex flex-col md:flex-row ${urgent ? 'border-red-200' : 'border-slate-200 hover:border-slate-300'}`}>
                                        
                                        {/* Status Bar Indicator */}
                                        <div className={`w-full md:w-2 h-2 md:h-auto ${urgent ? 'bg-red-500' : 'bg-slate-200'}`} />

                                        <div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                            
                                            {/* Info Cliente & ID */}
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                                                <p className="font-bold text-slate-800 text-lg">{order.customerName}</p>
                                                <p className="text-xs text-slate-500">{order.customerEmail}</p>
                                            </div>

                                            {/* Datas */}
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Compra</p>
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(order.createdAt).toLocaleDateString() || 'N/A'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${urgent ? 'text-red-500' : 'text-slate-400'}`}>Prazo Envio (Max)</p>
                                                    <div className={`flex items-center gap-1.5 text-sm font-black ${urgent ? 'text-red-600' : 'text-emerald-600'}`}>
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(order.deadlineDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total e Quantidade */}
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Recebido</p>
                                                <p className="font-black text-slate-800 text-lg mb-1">R$ {order.totalAmount.toFixed(2)}</p>
                                                <Badge variant="outline" className="text-[10px] font-bold">
                                                    {order.items.reduce((acc, i) => acc + i.quantity, 0)} itens pendentes
                                                </Badge>
                                            </div>

                                            {/* Ações */}
                                            <div className="flex flex-col gap-2 justify-center">
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value as any)}
                                                    className={`p-2 rounded-lg text-xs font-bold uppercase border-2 outline-none cursor-pointer ${getStatusColor(order.status)}`}
                                                >
                                                    <option value="pendente">Pendente</option>
                                                    <option value="pago">Pago</option>
                                                    <option value="em_producao">Em Produção</option>
                                                    <option value="conferencia">Conferência</option>
                                                    <option value="enviado">Enviado</option>
                                                </select>

                                                <Link href={fichaUrl} target="_blank" className="flex items-center justify-center gap-2 p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase transition-colors">
                                                    <FileText className="w-3.5 h-3.5" /> Ver Ficha Técnica
                                                </Link>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
