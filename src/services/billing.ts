import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createCheckoutSession = async (priceId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
    });

    if (error) {
      toast.error("Erro ao criar sessão de checkout");
      console.error(error);
      return null;
    }

    if (data?.url) {
      window.open(data.url, "_blank");
    }

    return data;
  } catch (err) {
    console.error(err);
    toast.error("Erro ao processar pagamento");
    return null;
  }
};

export const openCustomerPortal = async () => {
  try {
    const { data, error } = await supabase.functions.invoke("customer-portal");

    if (error) {
      toast.error("Erro ao abrir portal de gerenciamento");
      console.error(error);
      return null;
    }

    if (data?.url) {
      window.open(data.url, "_blank");
    }

    return data;
  } catch (err) {
    console.error(err);
    toast.error("Erro ao acessar portal");
    return null;
  }
};
