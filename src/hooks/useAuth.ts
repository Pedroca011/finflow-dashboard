import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { authApi, userApi } from "@/services/api";

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    session,
    profile,
    subscription,
    isLoading,
    setUser,
    setSession,
    setProfile,
    setSubscription,
    setIsLoading,
    reset,
  } = useAuthStore();

  useEffect(() => {
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchSubscription(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setSubscription(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchSubscription(session.user.id);
      }
      setIsLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const data = await userApi.getProfile();
      if (data) setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchSubscription = async (userId: string) => {
    try {
      const data = await userApi.getSubscription();
      if (data) {
        setSubscription({
          ...data,
          plan: data.plan as 'basic' | 'pro',
          status: data.status as 'active' | 'inactive' | 'canceled',
        });
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const data = await authApi.signUp(email, password, fullName);
      
      // Update store with session data
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        
        // Fetch profile and subscription
        if (data.user) {
          setTimeout(() => {
            fetchProfile(data.user.id);
            fetchSubscription(data.user.id);
          }, 0);
        }
      }

      toast.success("Conta criada com sucesso!");
      return { data };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro ao criar conta";
      if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
        toast.error("Este email já está cadastrado. Tente fazer login.");
      } else {
        toast.error(errorMessage);
      }
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authApi.signIn(email, password);
      
      // Update store with session data
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        
        // Fetch profile and subscription
        if (data.user) {
          setTimeout(() => {
            fetchProfile(data.user.id);
            fetchSubscription(data.user.id);
          }, 0);
        }
      }

      toast.success("Login realizado com sucesso!");
      return { data };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Credenciais inválidas";
      toast.error(errorMessage);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
      await supabase.auth.signOut(); // Also sign out from Supabase client
      reset();
      toast.success("Logout realizado com sucesso!");
      navigate("/auth");
    } catch (error) {
      // Even if API call fails, sign out locally
      await supabase.auth.signOut();
      reset();
      toast.success("Logout realizado com sucesso!");
      navigate("/auth");
    }
  };

  return {
    user,
    session,
    profile,
    subscription,
    isLoading,
    signUp,
    signIn,
    signOut,
    fetchSubscription,
  };
};
