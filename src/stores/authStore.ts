import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Profile, Subscription } from "@/types";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setIsLoading: (value: boolean) => void;

  initialize: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  subscription: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setSubscription: (subscription) => set({ subscription }),
  setIsLoading: (value) => set({ isLoading: value }),

  // 🚀 Inicializa o estado de autenticação
  initialize: async () => {
    const { data } = await supabase.auth.getSession();

    set({
      user: data.session?.user ?? null,
      session: data.session ?? null,
      isLoading: false,
    });

    // Escuta login/logout automaticamente
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        session: session ?? null,
        isLoading: false,
      });
    });
  },

  reset: () =>
    set({
      user: null,
      session: null,
      profile: null,
      subscription: null,
      isLoading: false,
    }),
}));
