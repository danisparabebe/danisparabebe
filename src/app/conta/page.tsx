'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Package, Heart, User as UserIcon, MapPin, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { TopBar } from '@/components/homepage/top-bar';
import { Header } from '@/components/homepage/header';
import { Footer } from '@/components/homepage/footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { useFavoritesStore } from '@/store/favorites-store';
import { productControl } from '@/data/product-control';
import { saveUserAddress, deleteUserAddress } from '@/lib/user-db';
import { toast } from 'sonner';

function ContaContent() {
    const { user, isLoading, logout } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('aba') || 'pedidos';

    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    
    // Form state para novo endereço
    const [addressForm, setAddressForm] = useState({
        cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
    });

    const { items: favoriteIds } = useFavoritesStore();

    // Redireciona sutilmente para home se forçarem acesso deslogado
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);


    // Carregar Pedidos Assinconamente do Firestore assim que bater a Auth do Google
    useEffect(() => {
        async function fetchMyOrders() {
            if (!user?.email) return;
            setLoadingOrders(true);
            try {
                const q = query(
                    collection(db, 'orders'),
                    where('customer.email', '==', user.email),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(fetched);
            } catch (e) {
                console.error("Falha ao puxar histórico de pedidos", e);
            }
            setLoadingOrders(false);
        }

        if (user) {
            fetchMyOrders();
            // Carregar endereços do perfil doc
            const fetchProfile = async () => {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    setAddresses(snap.data().addresses || []);
                }
            };
            fetchProfile();
        }
    }, [user]);

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSavingAddress(true);
        const updated = await saveUserAddress(user.uid, addressForm);
        if (updated) {
            setAddresses(updated);
            setShowAddressForm(false);
            setAddressForm({ cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' });
            toast.success("Endereço salvo com sucesso!");
        }
        setIsSavingAddress(false);
    };

    const handleDeleteAddress = async (id: string) => {
        if (!user) return;
        const updated = await deleteUserAddress(user.uid, id);
        if (updated) {
            setAddresses(updated);
            toast.success("Endereço removido.");
        }
    };

    const handleCepLookup = async (cep: string) => {
        const raw = cep.replace(/\D/g, '');
        if (raw.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setAddressForm(prev => ({
                        ...prev,
                        cep,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }));
                }
            } catch (e) {}
        } else {
            setAddressForm(prev => ({ ...prev, cep }));
        }
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-warm-stone/20">
                <Loader2 className="w-8 h-8 text-sage-green animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: 'pedidos', label: 'Meus Pedidos', icon: Package },
        { id: 'favoritos', label: 'Favoritos', icon: Heart },
        { id: 'perfil', label: 'Meu Perfil', icon: UserIcon },
    ];

    // Mapear os Favoritos da nuvem e extrair os Objetos Reais cruzando com Banco de Mockado Local
    const favoriteProducts = favoriteIds.map(id => productControl.find(p => p.id === id)).filter(Boolean);

    return (
        <div className="min-h-screen bg-surface-white flex flex-col">
            <TopBar />
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* ─── SIDEBAR ─── */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        {/* Perfil Header */}
                        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-line mb-6 flex flex-col items-center text-center">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Foto de Perfil" className="w-20 h-20 rounded-full border-4 border-sage-green/10 mb-4" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-sage-green text-white flex items-center justify-center text-2xl font-bold font-heading mb-4">
                                    {user.displayName?.charAt(0) || 'U'}
                                </div>
                            )}
                            <h2 className="font-heading font-black text-charcoal text-lg mb-1">{user.displayName}</h2>
                            <p className="text-xs text-slate truncate w-full">{user.email}</p>
                            
                            <button onClick={() => { logout(); router.push('/'); }} className="w-full mt-6 py-2 rounded-full border border-line text-xs font-bold text-charcoal hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors uppercase tracking-wider">
                                Sair da Conta
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <nav className="flex flex-col gap-2">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => router.push(`/conta?aba=${tab.id}`, { scroll: false })}
                                        className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300
                                            ${isActive ? 'bg-charcoal text-white shadow-md' : 'bg-white text-slate hover:bg-sage-green/10 hover:text-charcoal border border-line'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 font-semibold text-sm">
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-sage-green' : ''}`} />
                                            {tab.label}
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4 text-sage-green" />}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* ─── MAIN CONTENT PANEL ─── */}
                    <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-black/5 p-6 sm:p-10 min-h-[500px]">
                        
                        {/* Tab: PEDIDOS */}
                        {activeTab === 'pedidos' && (
                            <div className="animate-fadeIn">
                                <h1 className="text-2xl sm:text-3xl font-black font-heading text-charcoal mb-2">Meus Pedidos</h1>
                                <p className="text-slate text-sm mb-8">Todos os envios e personalizações registrados pelo seu e-mail.</p>
                                
                                {loadingOrders ? (
                                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-sage-green animate-spin" /></div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-16 bg-warm-stone/20 rounded-3xl border border-line/50 border-dashed">
                                        <Package className="w-12 h-12 text-slate/40 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-charcoal mb-2">Nenhum pedido ainda</h3>
                                        <p className="text-slate text-sm max-w-sm mx-auto mb-6">Você ainda não finalizou nenhum kit pelo nosso site usando essa conta de email.</p>
                                        <Link href="/" className="inline-block bg-sage-green hover:bg-sage-green-dark text-white font-bold px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-colors">
                                           Começar a Comprar
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        {orders.map((order: any) => (
                                            <div key={order.id} className="border border-line rounded-2xl p-5 sm:p-6 hover:shadow-md transition-shadow">
                                                <div className="flex flex-wrap gap-4 items-center justify-between mb-4 pb-4 border-b border-line/50">
                                                    <div>
                                                        <p className="text-xs text-slate uppercase font-bold tracking-wider mb-1">Pedido #{order.id.slice(-6)}</p>
                                                        <p className="text-sm font-semibold text-charcoal">Feito em {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                    <div className="px-4 py-1.5 rounded-full bg-sage-green/10 text-sage-green-dark font-bold text-xs uppercase tracking-wider">
                                                        {order.status === 'pago_aprovado' ? 'Pagamento Aprovado' : 
                                                         order.status === 'enviado' ? 'Enviado' : 
                                                         order.status === 'cancelado' ? 'Cancelado' : 
                                                         'Pendente'}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col gap-3">
                                                    {order.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-4">
                                                            <div className="w-16 h-16 rounded-xl bg-warm-stone/30 overflow-hidden relative border border-black/5 flex-shrink-0">
                                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-charcoal text-sm truncate">{item.name}</p>
                                                                <p className="text-xs text-slate truncate">Qtd: {item.quantity}</p>
                                                            </div>
                                                            <div className="font-bold text-sm text-charcoal">
                                                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: FAVORITOS */}
                        {activeTab === 'favoritos' && (
                            <div className="animate-fadeIn">
                                <h1 className="text-2xl sm:text-3xl font-black font-heading text-charcoal mb-2">Meus Favoritos</h1>
                                <p className="text-slate text-sm mb-8">Todos os itens e modelinhos que você curtiu guardados com carinho.</p>
                                
                                {favoriteProducts.length === 0 ? (
                                    <div className="text-center py-16 bg-dusty-rose/5 rounded-3xl border border-dusty-rose/10 border-dashed">
                                        <Heart className="w-12 h-12 text-dusty-rose/40 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-charcoal mb-2">Lista vazia</h3>
                                        <p className="text-slate text-sm max-w-sm mx-auto mb-6">Você ainda não marcou nenhum modelinho como favorito usando o coraçãozinho.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                        {favoriteProducts.map((p: any) => (
                                            <Link key={p.id} href={`/produto/${p.shortCode || p.id}`} className="group relative border border-line rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                                <div className="aspect-square relative w-full bg-warm-stone/20">
                                                    <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-sm text-charcoal line-clamp-1 mb-1">{p.name}</h4>
                                                    <p className="text-xs font-semibold text-sage-green-dark">R$ {p.price?.toFixed(2).replace('.',',') || 'Sob Consulta'}</p>
                                                </div>
                                                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center">
                                                    <Heart className="w-4 h-4 fill-dusty-rose text-dusty-rose" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: PERFIL */}
                        {activeTab === 'perfil' && (
                            <div className="animate-fadeIn">
                                <h1 className="text-2xl sm:text-3xl font-black font-heading text-charcoal mb-2">Meu Perfil</h1>
                                <p className="text-slate text-sm mb-8">Gerencie suas informações pessoais do Google abaixo.</p>
                                
                                <div className="space-y-6 max-w-2xl">
                                    <div className="bg-warm-stone/20 p-6 rounded-2xl border border-line">
                                        <div className="flex items-center gap-4 mb-4">
                                            <UserIcon className="w-5 h-5 text-charcoal" />
                                            <h3 className="font-bold text-charcoal">Dados de Acesso (Google)</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate uppercase tracking-wider mb-1 block">E-mail Vinculado</label>
                                                <input disabled type="text" value={user.email || ''} className="w-full bg-white border border-line rounded-lg px-4 py-2.5 text-charcoal text-sm opacity-70 cursor-not-allowed font-medium" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate uppercase tracking-wider mb-1 block">Nome de Perfil</label>
                                                <input disabled type="text" value={user.displayName || ''} className="w-full bg-white border border-line rounded-lg px-4 py-2.5 text-charcoal text-sm opacity-70 cursor-not-allowed font-medium" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-warm-stone/20 p-6 rounded-2xl border border-line">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <MapPin className="w-5 h-5 text-charcoal" />
                                                <h3 className="font-bold text-charcoal">Meus Endereços</h3>
                                            </div>
                                            {!showAddressForm && (
                                                <button 
                                                    onClick={() => setShowAddressForm(true)}
                                                    className="text-xs font-bold text-sage-green-dark hover:text-sage-green uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                >
                                                    + Adicionar Novo
                                                </button>
                                            )}
                                        </div>

                                        {showAddressForm ? (
                                            <form onSubmit={handleSaveAddress} className="space-y-4 bg-white p-6 rounded-xl border border-line animate-fadeIn">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate uppercase tracking-wider mb-1 block">CEP</label>
                                                        <input required type="text" placeholder="00000-000" value={addressForm.cep} onChange={(e) => handleCepLookup(e.target.value)} className="w-full border border-line rounded-lg px-4 py-2 text-sm focus:border-sage-green outline-none" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate uppercase tracking-wider mb-1 block">Rua / Logradouro</label>
                                                        <input required type="text" value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} className="w-full border border-line rounded-lg px-4 py-2 text-sm focus:border-sage-green outline-none" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate uppercase tracking-wider mb-1 block">Número</label>
                                                        <input required type="text" value={addressForm.number} onChange={(e) => setAddressForm({...addressForm, number: e.target.value})} className="w-full border border-line rounded-lg px-4 py-2 text-sm focus:border-sage-green outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-slate uppercase tracking-wider mb-1 block">Complemento</label>
                                                        <input type="text" value={addressForm.complement} onChange={(e) => setAddressForm({...addressForm, complement: e.target.value})} className="w-full border border-line rounded-lg px-4 py-2 text-sm focus:border-sage-green outline-none" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate uppercase tracking-wider mb-1 block">Bairro</label>
                                                        <input required type="text" value={addressForm.neighborhood} onChange={(e) => setAddressForm({...addressForm, neighborhood: e.target.value})} className="w-full border border-line rounded-lg px-4 py-2 text-sm focus:border-sage-green outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-slate uppercase tracking-wider mb-1 block">Cidade/UF</label>
                                                        <div className="flex gap-2">
                                                            <input required type="text" value={addressForm.city} className="flex-1 border border-line rounded-lg px-4 py-2 text-sm bg-warm-stone/10" readOnly />
                                                            <input required type="text" value={addressForm.state} className="w-12 border border-line rounded-lg px-2 text-sm text-center bg-warm-stone/10" readOnly />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 mt-6">
                                                    <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 py-2.5 rounded-full border border-line text-xs font-bold uppercase tracking-widest text-slate hover:bg-slate-50 transition-colors">Cancelar</button>
                                                    <button disabled={isSavingAddress} type="submit" className="flex-1 py-2.5 rounded-full bg-sage-green text-white text-xs font-bold uppercase tracking-widest hover:bg-sage-green-dark transition-colors disabled:opacity-50">
                                                        {isSavingAddress ? 'Salvando...' : 'Salvar Endereço'}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : addresses.length === 0 ? (
                                            <div className="text-center py-8 opacity-60">
                                                <p className="text-sm text-slate">Nenhum endereço salvo ainda.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4">
                                                {addresses.map((addr: any) => (
                                                    <div key={addr.id} className="bg-white p-4 rounded-xl border border-line flex justify-between items-start group">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-charcoal text-sm">{addr.street}, {addr.number}</span>
                                                                {addr.complement && <span className="text-[10px] bg-warm-stone/30 px-1.5 py-0.5 rounded text-slate uppercase font-bold">{addr.complement}</span>}
                                                            </div>
                                                            <p className="text-xs text-slate">{addr.neighborhood} — {addr.city}/{addr.state}</p>
                                                            <p className="text-[10px] text-slate/50 mt-1 font-mono">{addr.cep}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeleteAddress(addr.id)}
                                                            className="text-xs font-bold text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function ContaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-warm-stone/20 flex items-center justify-center"><Loader2 className="w-10 h-10 text-sage-green animate-spin"/></div>}>
            <ContaContent />
        </Suspense>
    );
}
