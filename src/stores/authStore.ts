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
  fetchProfile: (userId: string) => Promise<void>;
  fetchSubscription: (userId: string) => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      set({ profile: data as Profile });
    }
  },

  fetchSubscription: async (userId: string) => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      set({ subscription: data as Subscription });
    }
  },

  initialize: async () => {
    const { data } = await supabase.auth.getSession();

    const user = data.session?.user ?? null;
    set({
      user,
      session: data.session ?? null,
      isLoading: false,
    });

    // Fetch profile and subscription if user is logged in
    if (user) {
      get().fetchProfile(user.id);
      get().fetchSubscription(user.id);
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      set({
        user: newUser,
        session: session ?? null,
        isLoading: false,
      });

      if (newUser) {
        get().fetchProfile(newUser.id);
        get().fetchSubscription(newUser.id);
      } else {
        set({ profile: null, subscription: null });
      }
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
