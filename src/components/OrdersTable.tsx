import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Clock, Check, X, Play, Trash2 } from "lucide-react";
import { useStocks } from "@/hooks/useStocks";
import { BrapiStock } from "@/services/brapi";

interface OrdersTableProps {
  orders: Order[];
  onExecute?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  limit?: number;
}

export const OrdersTable = ({
  orders,
  onExecute,
  onCancel,
  onDelete,
  showActions = false,
  limit,
}: OrdersTableProps) => {
  const { data: stocks } = useStocks();
  const displayOrders = limit ? orders.slice(0, limit) : orders;

  const getMarketPrice = (ticker: string): number | null => {
    const stock = stocks?.find((s: BrapiStock) => s.stock === ticker);
    return stock?.close ?? null;
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Aberta
          </Badge>
        );
      case "executed":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <Check className="h-3 w-3 mr-1" />
            Executada
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            <X className="h-3 w-3 mr-1" />
            Cancelada
          </Badge>
        );
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (displayOrders.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Nenhuma ordem encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {limit ? "Últimas Ordens" : "Todas as Ordens"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Ticker
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Tipo
                </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                  Preço Alvo
                </th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                  Preço Mercado
                </th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                  Qtd
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                  Data
                </th>
                {showActions && (
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <span className="font-medium">{order.ticker}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-sm font-medium",
                        order.order_type === "buy" ? "text-success" : "text-destructive"
                      )}
                    >
                      {order.order_type === "buy" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {order.order_type === "buy" ? "Compra" : "Venda"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    {formatCurrency(order.price)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    {(() => {
                      const marketPrice = getMarketPrice(order.ticker);
                      if (marketPrice === null) return <span className="text-muted-foreground">-</span>;
                      const isAbove = marketPrice > order.price;
                      const isBuy = order.order_type === "buy";
                      const colorClass = isBuy 
                        ? (isAbove ? "text-destructive" : "text-success")
                        : (isAbove ? "text-success" : "text-destructive");
                      return <span className={colorClass}>{formatCurrency(marketPrice)}</span>;
                    })()}
                  </td>
                  <td className="py-3 px-2 text-right">{order.quantity}</td>
                  <td className="py-3 px-2 text-center">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </td>
                  {showActions && (
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {order.status === "open" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                              onClick={() => onExecute?.(order.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onCancel?.(order.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDelete?.(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
