import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { OrdersTable } from "@/components/OrdersTable";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/authStore";
import { Wallet, TrendingUp, TrendingDown, FileText, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

const INITIAL_BALANCE = 10000;

const Dashboard = () => {
  const { orders } = useOrders();
  const { subscription, profile } = useAuthStore();

  const openOrders = orders.filter((o) => o.status === "open").length;
  const executedOrders = orders.filter((o) => o.status === "executed").length;

  // Calculate profit/loss based on executed orders
  const { totalProfit, profitPercentage } = useMemo(() => {
    const executedOrdersList = orders.filter((o) => o.status === "executed");
    
    let profit = 0;
    executedOrdersList.forEach((order) => {
      const orderValue = order.price * order.quantity;
      if (order.order_type === "sell") {
        profit += orderValue;
      } else {
        profit -= orderValue;
      }
    });

    const percentage = INITIAL_BALANCE > 0 
      ? ((profit / INITIAL_BALANCE) * 100) 
      : 0;

    return { 
      totalProfit: profit, 
      profitPercentage: percentage 
    };
  }, [orders]);

  const currentBalance = profile?.balance ?? INITIAL_BALANCE;
  const balanceChange = currentBalance - INITIAL_BALANCE;
  const balanceChangePercent = ((balanceChange / INITIAL_BALANCE) * 100);

  const isProfit = totalProfit >= 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral da sua carteira</p>
          </div>
          {subscription && (
            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
              Plano {subscription.plan.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Saldo Disponível"
            value={`R$ ${currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            description="Saldo atual"
            icon={Wallet}
            trend={balanceChange !== 0 ? { 
              value: Math.abs(balanceChangePercent), 
              positive: balanceChange >= 0 
            } : undefined}
          />
          <StatsCard
            title={isProfit ? "Lucro Total" : "Prejuízo Total"}
            value={`R$ ${Math.abs(totalProfit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            description="Baseado em ordens executadas"
            icon={isProfit ? TrendingUp : TrendingDown}
            trend={{ 
              value: Math.abs(profitPercentage), 
              positive: isProfit 
            }}
          />
          <StatsCard
            title="Ordens Abertas"
            value={openOrders}
            description="Aguardando execução"
            icon={FileText}
          />
          <StatsCard
            title="Ordens Executadas"
            value={executedOrders}
            description="Total executado"
            icon={Target}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <PerformanceChart orders={orders} initialBalance={INITIAL_BALANCE} currentBalance={currentBalance} />
          <div className="lg:col-span-1">
            <OrdersTable orders={orders} limit={5} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;