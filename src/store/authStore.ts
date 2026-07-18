import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    session: Session | null;
    user: User | null;
    isAuthenticated: boolean;
    isSupabaseConfigured: boolean;
    setSession: (session: Session | null) => void;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    isAuthenticated: !supabase, // If Supabase is not configured, auto-authenticate and run in local-only mode
    isSupabaseConfigured: !!supabase,

    setSession: (session) => set({
        session,
        user: session?.user ?? null,
        isAuthenticated: supabase ? !!session : true,
    }),

    signOut: async () => {
        if (supabase) {
            try {
                await supabase.auth.signOut();
            } catch (err) {
                console.error('Error signing out from Supabase Auth:', err);
            }
        }
        // Wipes all client state to guarantee data isolation
        localStorage.clear();
        window.location.reload();
    }
}));
