import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { OrdersTable } from "@/components/OrdersTable";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/authStore";
import { Wallet, TrendingUp, FileText, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { orders } = useOrders();
  const { subscription } = useAuthStore();

  const openOrders = orders.filter((o) => o.status === "open").length;
  const executedOrders = orders.filter((o) => o.status === "executed").length;

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
            value="R$ 50.000,00"
            description="Saldo fictício"
            icon={Wallet}
            trend={{ value: 12.5, positive: true }}
          />
          <StatsCard
            title="Lucro Total"
            value="R$ 8.450,00"
            description="Este mês"
            icon={TrendingUp}
            trend={{ value: 8.2, positive: true }}
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
          <PerformanceChart />
          <div className="lg:col-span-1">
            <OrdersTable orders={orders} limit={5} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
