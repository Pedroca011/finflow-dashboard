import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

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
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) setProfile(data);
  };

  const fetchSubscription = async (userId: string) => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setSubscription({
        ...data,
        plan: data.plan as 'basic' | 'pro',
        status: data.status as 'active' | 'inactive' | 'canceled',
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este email já está cadastrado. Tente fazer login.");
      } else {
        toast.error(error.message);
      }
      return { error };
    }

    toast.success("Conta criada com sucesso!");
    return { data };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Credenciais inválidas. Verifique seu email e senha.");
      return { error };
    }

    toast.success("Login realizado com sucesso!");
    return { data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    reset();
    toast.success("Logout realizado com sucesso!");
    navigate("/auth");
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
