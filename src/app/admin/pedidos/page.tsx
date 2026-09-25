'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
    Package, 
    Calendar, 
    User, 
    FileText, 
    CheckCircle, 
    Clock, 
    Truck, 
    RefreshCw, 
    Phone, 
    ExternalLink, 
    AlertCircle, 
    ChevronRight,
    ShoppingBag,
    Tag,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
    id: string;
    productId?: string;
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
    requestedMethod?: string;
    shippingAmount?: number;
}

export default function AdminPedidosPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('todos');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchOrders = useCallback(async (isInitial = false) => {
        if (isInitial) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }
        setErrorMsg(null);

        try {
            const res = await fetch('/api/admin/pedidos', { cache: 'no-store' });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Erro HTTP ${res.status}`);
            }
            const data = await res.json();
            if (data.ok && Array.isArray(data.orders)) {
                setOrders(data.orders);
                setLastUpdated(new Date());
            } else {
                throw new Error(data.error || 'Formato de resposta inválido');
            }
        } catch (err: any) {
            console.error('Falha ao sincronizar pedidos:', err);
            if (isInitial) {
                setErrorMsg(err.message || 'Erro ao carregar pedidos.');
            }
            toast.error(err.message || 'Erro ao carregar pedidos.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(true);
        // Polling automático a cada 15 segundos para manter status ao vivo
        const interval = setInterval(() => {
            fetchOrders(false);
        }, 15000);

        return () => clearInterval(interval);
    }, [fetchOrders]);

    const updateStatus = async (orderId: string, newStatus: Order['status']) => {
        const previousOrders = [...orders];
        // Atualização otimista na tela
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        try {
            const res = await fetch('/api/admin/pedidos', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Erro ao atualizar no servidor');
            }

            toast.success('Status atualizado com sucesso!');
        } catch (err: any) {
            console.error(err);
            toast.error('Erro ao atualizar status. Revertendo...');
            setOrders(previousOrders);
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

    const isUrgent = (deadline?: string) => {
        if (!deadline) return false;
        const today = new Date();
        const maxDate = new Date(deadline);
        if (isNaN(maxDate.getTime())) return false;
        const diffDays = Math.ceil((maxDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays <= 3; // Alerta se faltam 3 dias ou menos
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('pt-BR');
    };

    const getCleanPhone = (phone?: string) => {
        if (!phone) return '';
        const raw = phone.replace(/\D/g, '');
        if (!raw) return '';
        return raw.startsWith('55') ? raw : `55${raw}`;
    };

    const filteredOrders = filterStatus === 'todos' 
        ? orders 
        : orders.filter(o => o.status === filterStatus);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar Lateral */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 min-h-screen p-4 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                    <div className="mb-6 px-2">
                        <h1 className="text-xl font-black text-white tracking-widest uppercase">Admin Danis</h1>
                        <p className="text-[11px] text-slate-500 font-medium">Painel de Controle</p>
                    </div>
                    
                    <nav className="flex flex-col gap-1">
                        <Link 
                            href="/admin/gestao-fotos" 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-slate-400"
                        >
                            <ImageIcon className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold">Catálogo / Fotos</span>
                        </Link>
                        
                        <Link 
                            href="/admin/pedidos" 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-purple-600 text-white shadow-md"
                        >
                            <Package className="w-4 h-4" />
                            <span className="text-sm font-bold">Pedidos & Prazos</span>
                        </Link>

                        <Link 
                            href="/admin/gestao-tags" 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-slate-400"
                        >
                            <Tag className="w-4 h-4 text-pink-400" />
                            <span className="text-sm font-bold">Coleções</span>
                        </Link>

                        <Link 
                            href="/admin/gestao-bordados" 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-slate-400"
                        >
                            <FileText className="w-4 h-4 text-fuchsia-400" />
                            <span className="text-sm font-bold">Bordados</span>
                        </Link>
                    </nav>
                </div>

                <div className="pt-4 border-t border-slate-800">
                    <Link 
                        href="/" 
                        target="_blank"
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <span>Ver Loja</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    {/* Top Header Card */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Gestão de Pedidos</h2>
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-black tracking-widest uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> AO VIVO
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                                Acompanhe prazos e emita fichas técnicas de produção automaticamente.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {lastUpdated && (
                                <span className="text-xs text-slate-400 font-medium">
                                    Atualizado às {lastUpdated.toLocaleTimeString('pt-BR')}
                                </span>
                            )}
                            <button
                                onClick={() => fetchOrders(false)}
                                disabled={refreshing || loading}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                title="Atualizar lista agora"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshing ? 'Sincronizando...' : 'Atualizar'}
                            </button>
                        </div>
                    </div>

                    {/* Filtros de Status com contadores */}
                    <div className="flex gap-2 flex-wrap">
                        {['todos', 'pendente', 'pago', 'em_producao', 'conferencia', 'enviado'].map(st => {
                            const count = st === 'todos' 
                                ? orders.length 
                                : orders.filter(o => o.status === st).length;

                            return (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 flex items-center gap-2 ${
                                        filterStatus === st 
                                            ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm' 
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <span>{st === 'todos' ? 'Todos' : getStatusLabel(st)}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                                        filterStatus === st ? 'bg-purple-200 text-purple-800' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Mensagem de Erro (se houver) */}
                    {errorMsg && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-700">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-semibold">{errorMsg}</span>
                            </div>
                            <button
                                onClick={() => fetchOrders(true)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    )}

                    {/* Lista de Pedidos */}
                    {loading ? (
                        <div className="py-20 text-center text-slate-400 font-bold uppercase flex flex-col items-center justify-center gap-3">
                            <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                            <p className="tracking-widest text-xs">Sincronizando banco de dados...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-sm">Nenhum pedido encontrado</p>
                            <p className="text-xs text-slate-400 mt-1">Os pedidos efetuados aparecerão aqui em tempo real.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredOrders.map(order => {
                                const urgent = order.status !== 'enviado' && isUrgent(order.deadlineDate);
                                
                                // Ficha Técnica Link (LGPD safe)
                                const firstName = order.customerName ? order.customerName.split(' ')[0] : 'Cliente';
                                const fichaDataPayload = JSON.stringify({
                                    items: order.items || [],
                                    customer: { 
                                        name: firstName,
                                        deadline: order.deadlineDate 
                                    },
                                    orderId: order.id
                                });
                                const base64Data = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(fichaDataPayload))) : '';
                                const fichaUrl = `/ficha?data=${base64Data}`;

                                const cleanPhone = getCleanPhone(order.customerPhone);
                                const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
                                const itemsCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);

                                return (
                                    <div 
                                        key={order.id} 
                                        className={`bg-white rounded-2xl border-2 shadow-sm transition-all overflow-hidden flex flex-col md:flex-row ${
                                            urgent ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Status Bar Indicator */}
                                        <div className={`w-full md:w-2.5 h-2.5 md:h-auto ${urgent ? 'bg-red-500' : order.status === 'pago' ? 'bg-emerald-500' : 'bg-slate-300'}`} />

                                        <div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                            
                                            {/* Info Cliente & ID */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        #{order.id.slice(-6).toUpperCase()}
                                                    </p>
                                                    {urgent && (
                                                        <span className="text-[9px] font-black bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase">
                                                            Prazo Crítico
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-bold text-slate-800 text-base leading-snug">{order.customerName}</p>
                                                {order.customerEmail && (
                                                    <p className="text-xs text-slate-500 truncate" title={order.customerEmail}>
                                                        {order.customerEmail}
                                                    </p>
                                                )}
                                                {cleanPhone && (
                                                    <a 
                                                        href={waUrl!} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold mt-1"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        <span>{order.customerPhone}</span>
                                                    </a>
                                                )}
                                            </div>

                                            {/* Datas */}
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Data da Compra</p>
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${urgent ? 'text-red-500' : 'text-slate-400'}`}>
                                                        Prazo Máximo de Envio
                                                    </p>
                                                    <div className={`flex items-center gap-1.5 text-sm font-black ${urgent ? 'text-red-600' : 'text-emerald-700'}`}>
                                                        <Clock className="w-4 h-4" />
                                                        {formatDate(order.deadlineDate)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total e Quantidade */}
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Recebido</p>
                                                <p className="font-black text-slate-800 text-lg mb-1">
                                                    R$ {(order.totalAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-600">
                                                    {itemsCount} {itemsCount === 1 ? 'item' : 'itens'} no pedido
                                                </Badge>
                                            </div>

                                            {/* Ações */}
                                            <div className="flex flex-col gap-2 justify-center">
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value as any)}
                                                    className={`p-2 rounded-xl text-xs font-bold uppercase border-2 outline-none cursor-pointer transition-colors ${getStatusColor(order.status)}`}
                                                >
                                                    <option value="pendente">Pendente</option>
                                                    <option value="pago">Pago</option>
                                                    <option value="em_producao">Em Produção</option>
                                                    <option value="conferencia">Conferência</option>
                                                    <option value="enviado">Enviado</option>
                                                </select>

                                                <Link 
                                                    href={fichaUrl} 
                                                    target="_blank" 
                                                    className="flex items-center justify-center gap-2 p-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-sm"
                                                >
                                                    <FileText className="w-3.5 h-3.5" /> 
                                                    Ver Ficha Técnica
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
