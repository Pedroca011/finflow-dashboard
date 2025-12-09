import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STRIPE_PLANS } from "@/lib/stripe-config";
import { useSubscription } from "@/hooks/useSubscription";
import { createCheckoutSession, openCustomerPortal } from "@/services/billing";
import { Check, Zap, Loader2, Settings, RefreshCw, Crown, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Billing = () => {
  const { subscription, checkSubscription, isSubscribed, currentPlan, planLimits } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh subscription on page load
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const handleSubscribe = async (priceId: string, planId: string) => {
    setLoadingPlan(planId);
    await createCheckoutSession(priceId);
    setLoadingPlan(null);
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    await openCustomerPortal();
    setLoadingPortal(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkSubscription();
    toast.success("Status da assinatura atualizado!");
    setIsRefreshing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Assinatura</h1>
            <p className="text-muted-foreground">Gerencie seu plano e aproveite todos os recursos</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Atualizar
            </Button>
            {isSubscribed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
                disabled={loadingPortal}
              >
                {loadingPortal ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Gerenciar Assinatura
              </Button>
            )}
          </div>
        </div>

        {/* Current Plan Status */}
        <Card className={cn(
          "border-2",
          isSubscribed ? "border-success bg-success/5" : "border-muted"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isSubscribed ? (
                  <div className="p-2 rounded-full bg-success/10">
                    <Crown className="h-6 w-6 text-success" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-muted">
                    <Shield className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <CardTitle>
                    {isSubscribed 
                      ? `Plano ${currentPlan === "pro" ? "Pro" : "Basic"} Ativo`
                      : "Sem Assinatura Ativa"}
                  </CardTitle>
                  <CardDescription>
                    {isSubscribed 
                      ? "Você tem acesso a todos os recursos do seu plano"
                      : "Assine um plano para desbloquear mais recursos"}
                  </CardDescription>
                </div>
              </div>
              {isSubscribed && (
                <Badge variant="outline" className="bg-success/10 text-success border-success">
                  Ativo
                </Badge>
              )}
            </div>
          </CardHeader>
          {isSubscribed && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Ordens Simultâneas:</span>
                  <p className="font-semibold">
                    {planLimits.maxOrders === Infinity ? "Ilimitadas" : planLimits.maxOrders}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gráficos Avançados:</span>
                  <p className="font-semibold">
                    {planLimits.hasAdvancedCharts ? "✓ Sim" : "✗ Não"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Relatórios em Tempo Real:</span>
                  <p className="font-semibold">
                    {planLimits.hasRealtimeReports ? "✓ Sim" : "✗ Não"}
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          {Object.values(STRIPE_PLANS).map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isActive = isSubscribed && isCurrentPlan;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative transition-all",
                  plan.popular && "border-primary shadow-lg shadow-primary/10",
                  isActive && "ring-2 ring-success"
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    <Zap className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}
                {isActive && (
                  <Badge 
                    variant="outline" 
                    className="absolute -top-3 right-4 bg-success/10 text-success border-success"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Seu Plano
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {plan.id === "pro" ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    )}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-4xl font-bold text-foreground">
                      R$ {plan.price}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {isActive ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleManageSubscription}
                      disabled={loadingPortal}
                    >
                      {loadingPortal ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Settings className="h-4 w-4 mr-2" />
                      )}
                      Gerenciar Plano
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.priceId, plan.id)}
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      {isSubscribed && currentPlan !== plan.id ? "Trocar para este plano" : "Assinar Agora"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Posso cancelar a qualquer momento?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento através do portal de gerenciamento.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Como funciona a cobrança?</h4>
              <p className="text-sm text-muted-foreground">
                A cobrança é mensal e recorrente. Você será cobrado automaticamente todo mês.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Posso trocar de plano?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
