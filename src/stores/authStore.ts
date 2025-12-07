import { create } from "zustand";
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
  setIsLoading: (isLoading: boolean) => void;
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
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      user: null,
      session: null,
      profile: null,
      subscription: null,
      isLoading: false,
    }),
}));
