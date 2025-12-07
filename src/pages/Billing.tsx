import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STRIPE_PLANS } from "@/lib/stripe-config";
import { useAuthStore } from "@/stores/authStore";
import { createCheckoutSession } from "@/services/billing";
import { Check, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Billing = () => {
  const { subscription } = useAuthStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planId: string) => {
    setLoadingPlan(planId);
    await createCheckoutSession(priceId);
    setLoadingPlan(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assinatura</h1>
          <p className="text-muted-foreground">Gerencie seu plano</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          {Object.values(STRIPE_PLANS).map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const isActive = subscription?.status === "active";

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative",
                  plan.popular && "border-primary shadow-lg shadow-primary/10"
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Zap className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrentPlan && isActive && (
                      <Badge variant="secondary">Seu plano</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      R$ {plan.price}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "premium" : "outline"}
                    disabled={isCurrentPlan && isActive}
                    onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  >
                    {loadingPlan === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrentPlan && isActive ? (
                      "Plano Atual"
                    ) : (
                      "Assinar"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
