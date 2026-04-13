import { create } from 'zustand';
import { auth, googleProvider, facebookProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { syncUserFromCloud } from '@/lib/user-db';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    
    login: async () => {
        try {
            console.log("🚀 Iniciando Login com Google...", {
                apiKey: auth.config.apiKey?.slice(0, 5) + "...",
                authDomain: auth.config.authDomain
            });
            await signInWithPopup(auth, googleProvider);
        } catch (e: any) {
            // Firebase errors are objects, console.error needs detail
            console.error('❌ ERRO CRÍTICO NO LOGIN:', e);
            console.error('Código do Erro:', e?.code);
            console.error('Mensagem:', e?.message);
            
            // Alerta visual para facilitar o debug pelo usuário
            if (typeof window !== 'undefined') {
                const domain = window.location.hostname;
                alert(`Erro de Login: ${e?.code}\n\nMensagem: ${e?.message}\n\nVerifique se o domínio "${domain}" está autorizado no Console do Firebase.`);
            }
            
            if (e?.code === 'auth/internal-error' || e?.code === 'auth/unauthorized-domain') {
                console.warn("⚠️ Dica: Verifique se o Google está ATIVADO no console do Firebase e se o domínio atual está em 'Authorized Domains'.");
            }
        }
    },
    
    logout: async () => {
        try {
            await signOut(auth);
            set({ user: null });
        } catch (e) {
            console.error('Logout failed', e);
        }
    }
}));

// Global Engine Initiator called by RootLayout client context
let isAuthListenerInitialized = false;
export function initAuthListener() {
    if (typeof window === 'undefined' || isAuthListenerInitialized) return;
    isAuthListenerInitialized = true;
    
    onAuthStateChanged(auth, async (user) => {
        useAuthStore.setState({ user, isLoading: false });
        if (user) {
            await syncUserFromCloud(user);
        }
    });
}
