import { billingApi } from "@/services/api";
import { toast } from "sonner";

export const createCheckoutSession = async (priceId: string) => {
  try {
    const data = await billingApi.createCheckoutSession(priceId);

    if (data?.url) {
      window.open(data.url, "_blank");
    }

    return data;
  } catch (err: any) {
    const errorMessage = err?.response?.data?.message || err?.message || "Erro ao processar pagamento";
    toast.error(errorMessage);
    console.error(err);
    return null;
  }
};

export const openCustomerPortal = async () => {
  try {
    const data = await billingApi.createCustomerPortalSession();

    if (data?.url) {
      window.open(data.url, "_blank");
    }

    return data;
  } catch (err: any) {
    const errorMessage = err?.response?.data?.message || err?.message || "Erro ao acessar portal";
    toast.error(errorMessage);
    console.error(err);
    return null;
  }
};
