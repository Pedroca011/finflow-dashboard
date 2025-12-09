import { useStocks } from "@/hooks/useStocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Activity, ArrowUp, ArrowDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from "react";

interface StockDetailChartProps {
  ticker: string;
}

export const StockDetailChart = ({ ticker }: StockDetailChartProps) => {
  const { data: stocks, isLoading } = useStocks();

  const stock = useMemo(() => {
    if (!stocks || !ticker) return null;
    return stocks.find(
      (s) => s.stock.toLowerCase() === ticker.toLowerCase()
    );
  }, [stocks, ticker]);

  // Gera dados simulados para o gráfico baseado no preço atual
  const chartData = useMemo(() => {
    if (!stock) return [];
    const basePrice = stock.close;
    const variation = stock.change / 100;
    
    // Simula pontos do dia (horário de mercado 10h-17h)
    const hours = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    return hours.map((time, i) => {
      const randomVariation = (Math.random() - 0.5) * 0.015;
      const progressVariation = (i / (hours.length - 1)) * variation;
      return {
        time,
        price: basePrice * (1 - variation + progressVariation + randomVariation),
      };
    });
  }, [stock]);

  // Calcula valores simulados de máxima e mínima
  const { high, low, open } = useMemo(() => {
    if (!stock) return { high: 0, low: 0, open: 0 };
    const basePrice = stock.close;
    const volatility = Math.abs(stock.change) / 100 + 0.02;
    return {
      high: basePrice * (1 + volatility * 0.8),
      low: basePrice * (1 - volatility * 0.6),
      open: basePrice * (1 - stock.change / 100),
    };
  }, [stock]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatVolume = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return value.toString();
  };

  if (!ticker) {
    return (
      <Card className="border-dashed h-full">
        <CardContent className="flex flex-col items-center justify-center h-full py-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            Digite o ticker de uma ação para ver os detalhes
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stock) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-12">
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stock.logo && (
              <img
                src={stock.logo}
                alt={stock.stock}
                className="h-10 w-10 rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div>
              <span className="text-xl font-bold">{stock.stock}</span>
              <p className="text-sm text-muted-foreground font-normal">{stock.name}</p>
            </div>
          </div>
          <Badge
            className={cn(
              "font-mono text-base px-3 py-1",
              isPositive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {isPositive ? "+" : ""}
            {stock.change.toFixed(2)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold">
            {formatCurrency(stock.close)}
          </span>
          <span className={cn(
            "text-lg font-medium",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? "+" : ""}{formatCurrency(stock.close - open)}
          </span>
        </div>

        {/* Gráfico */}
        <div className="h-48 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-detail-${stock.stock}`} x1="0" y1="0" x2="0" y2="1">
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
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                formatter={(value: number) => [formatCurrency(value), 'Preço']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                strokeWidth={2}
                fill={`url(#gradient-detail-${stock.stock})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Detalhes do mercado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-success" />
              Máxima
            </div>
            <p className="font-mono font-semibold text-success">{formatCurrency(high)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowDown className="h-3 w-3 text-destructive" />
              Mínima
            </div>
            <p className="font-mono font-semibold text-destructive">{formatCurrency(low)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Abertura
            </div>
            <p className="font-mono font-semibold">{formatCurrency(open)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              Volume
            </div>
            <p className="font-mono font-semibold">{formatVolume(stock.volume)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
