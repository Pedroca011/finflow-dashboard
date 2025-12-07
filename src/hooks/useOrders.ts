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
  const { user } = useAuthStore();

  const fetchOrders = async () => {
    console.log("User vindo do useAuthStore:", user);
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
  };
};
