import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrdersStore } from "@/stores/ordersStore";
import { useAuthStore } from "@/stores/authStore";
import { CreateOrderInput, Order } from "@/types";
import { toast } from "sonner";

export const useOrders = () => {
  const {
    orders,
    isLoading,
    setOrders,
    addOrder,
    updateOrder,
    removeOrder,
    setIsLoading,
  } = useOrdersStore();
  const { user, subscription } = useAuthStore();

  // Get order limits based on subscription
  const getOrderLimits = () => {
    const isActive = subscription?.status === "active";
    const plan = subscription?.plan || "basic";
    
    if (!isActive) return 3; // Free tier
    if (plan === "pro") return Infinity;
    return 5; // Basic plan
  };

  const fetchOrders = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar ordens");
      console.error(error);
    } else {
      setOrders(data as Order[]);
    }
    setIsLoading(false);
  };

  const createOrder = async (input: CreateOrderInput) => {
    if (!user) {
      toast.error("Você precisa estar logado para criar uma ordem");
      return { error: new Error("Not authenticated") };
    }

    // Check order limits
    const maxOrders = getOrderLimits();
    const openOrders = orders.filter(o => o.status === "open").length;
    
    if (openOrders >= maxOrders) {
      const planName = subscription?.status === "active" 
        ? subscription?.plan === "pro" ? "Pro" : "Basic"
        : "gratuito";
      
      toast.error(
        `Você atingiu o limite de ${maxOrders} ordens abertas do plano ${planName}. ` +
        `Faça upgrade para criar mais ordens.`,
        { duration: 5000 }
      );
      return { error: new Error("Order limit reached") };
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        ticker: input.ticker.toUpperCase(),
        order_type: input.order_type,
        price: input.price,
        quantity: input.quantity,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao criar ordem");
      console.error(error);
      return { error };
    }

    addOrder(data as Order);
    toast.success("Ordem criada com sucesso!");
    return { data };
  };

  const executeOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "executed",
        executed_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Erro ao executar ordem");
      console.error(error);
      return { error };
    }

    updateOrder(orderId, {
      status: "executed",
      executed_at: new Date().toISOString(),
    });
    toast.success("Ordem executada com sucesso!");
    return { success: true };
  };

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "canceled" })
      .eq("id", orderId);

    if (error) {
      toast.error("Erro ao cancelar ordem");
      console.error(error);
      return { error };
    }

    updateOrder(orderId, { status: "canceled" });
    toast.success("Ordem cancelada");
    return { success: true };
  };

  const deleteOrder = async (orderId: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      toast.error("Erro ao deletar ordem");
      console.error(error);
      return { error };
    }

    removeOrder(orderId);
    toast.success("Ordem removida");
    return { success: true };
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return {
    orders,
    isLoading,
    fetchOrders,
    createOrder,
    executeOrder,
    cancelOrder,
    deleteOrder,
    maxOrders: getOrderLimits(),
    openOrdersCount: orders.filter(o => o.status === "open").length,
  };
};
