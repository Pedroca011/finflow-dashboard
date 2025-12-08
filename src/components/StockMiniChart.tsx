import { useStocks } from "@/hooks/useStocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

interface StockMiniChartProps {
  ticker: string;
}

export const StockMiniChart = ({ ticker }: StockMiniChartProps) => {
  const { data: stocks, isLoading } = useStocks();

  const stock = useMemo(() => {
    if (!stocks || !ticker) return null;
    return stocks.find(
      (s) => s.stock.toLowerCase() === ticker.toLowerCase()
    );
  }, [stocks, ticker]);

  // Gera dados simulados para o gráfico mini baseado no preço atual
  const chartData = useMemo(() => {
    if (!stock) return [];
    const basePrice = stock.close;
    const variation = stock.change / 100;
    
    // Simula pontos do dia
    return Array.from({ length: 20 }, (_, i) => {
      const randomVariation = (Math.random() - 0.5) * 0.02;
      const progressVariation = (i / 19) * variation;
      return {
        time: i,
        price: basePrice * (1 - variation + progressVariation + randomVariation),
      };
    });
  }, [stock]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!ticker) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stock) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-6">
          <p className="text-sm text-muted-foreground">
            Ticker "{ticker.toUpperCase()}" não encontrado
          </p>
        </CardContent>
      </Card>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {stock.logo && (
              <img
                src={stock.logo}
                alt={stock.stock}
                className="h-6 w-6 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span>{stock.stock}</span>
          </div>
          <Badge
            className={cn(
              "font-mono",
              isPositive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {isPositive ? "+" : ""}
            {stock.change.toFixed(2)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {formatCurrency(stock.close)}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {stock.name}
          </span>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${stock.stock}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                strokeWidth={2}
                fill={`url(#gradient-${stock.stock})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
