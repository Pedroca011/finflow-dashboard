import { PlanInfo } from "@/types";

export const STRIPE_PLANS: Record<string, PlanInfo> = {
  basic: {
    id: "basic",
    name: "Basic",
    price: 29,
    priceId: "price_1Sbq8AGiNtxulPbmYNuteDyW",
    productId: "prod_TYy4RkjOEnP18w",
    features: [
      "5 ordens simultâneas",
      "Gráficos básicos",
      "Relatórios mensais",
      "Suporte por email",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 99,
    priceId: "price_1Sbq8RGiNtxulPbmLx0PRmIG",
    productId: "prod_TYy4gUfrXrQPR4",
    features: [
      "Ordens ilimitadas",
      "Gráficos avançados",
      "Relatórios em tempo real",
      "Suporte prioritário 24/7",
      "API de integração",
      "Análise de mercado AI",
    ],
    popular: true,
  },
};

export const getPlanByProductId = (productId: string): PlanInfo | undefined => {
  return Object.values(STRIPE_PLANS).find((plan) => plan.productId === productId);
};

export const getPlanByPriceId = (priceId: string): PlanInfo | undefined => {
  return Object.values(STRIPE_PLANS).find((plan) => plan.priceId === priceId);
};
