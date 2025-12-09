import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OrdersTable } from "@/components/OrdersTable";
import { useOrders } from "@/hooks/useOrders";
import { useStocks } from "@/hooks/useStocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle, XCircle, Clock } from "lucide-react";

const MyOrders = () => {
  const { orders, executeOrder, cancelOrder, deleteOrder, isLoading } = useOrders();
  const { data: stocks } = useStocks();

  // Auto-execute orders when market price matches order price
  useEffect(() => {
    if (!orders || !stocks) return;

    const pendingOrders = orders.filter(order => order.status === "open");
    
    pendingOrders.forEach(order => {
      const stock = stocks.find(s => s.stock.toLowerCase() === order.ticker.toLowerCase());
      if (!stock) return;

      const marketPrice = stock.close;
      const orderPrice = order.price;

      // Para ordem de compra: executa se preço de mercado <= preço da ordem
      // Para ordem de venda: executa se preço de mercado >= preço da ordem
      const shouldExecute = 
        (order.order_type === "buy" && marketPrice <= orderPrice) ||
        (order.order_type === "sell" && marketPrice >= orderPrice);

      if (shouldExecute) {
        executeOrder(order.id);
      }
    });
  }, [orders, stocks, executeOrder]);

  // Estatísticas das ordens
  const stats = {
    total: orders.length,
    open: orders.filter(o => o.status === "open").length,
    executed: orders.filter(o => o.status === "executed").length,
    canceled: orders.filter(o => o.status === "canceled").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minhas Ordens</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as suas ordens. Ordens são executadas automaticamente quando o preço de mercado atinge seu preço alvo.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Ordens
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Abertas
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.open}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Executadas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.executed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Canceladas
              </CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.canceled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de ordens */}
        <OrdersTable
          orders={orders}
          showActions
          onExecute={executeOrder}
          onCancel={cancelOrder}
          onDelete={deleteOrder}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyOrders;
