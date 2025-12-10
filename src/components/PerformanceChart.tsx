import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types";
import { useMemo } from "react";
import { format, parseISO, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PerformanceChartProps {
  orders: Order[];
  initialBalance: number;
  currentBalance: number;
}

export const PerformanceChart = ({ orders, initialBalance, currentBalance }: PerformanceChartProps) => {
  const chartData = useMemo(() => {
    // Get executed orders sorted by date
    const executedOrders = orders
      .filter((o) => o.status === "executed" && o.executed_at)
      .sort((a, b) => new Date(a.executed_at!).getTime() - new Date(b.executed_at!).getTime());

    // Create data for the last 7 days
    const today = new Date();
    const days: { date: Date; label: string }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      days.push({
        date: startOfDay(date),
        label: format(date, "dd/MM", { locale: ptBR }),
      });
    }

    // Calculate cumulative balance for each day
    let runningBalance = initialBalance;
    let runningProfit = 0;

    const dataPoints = days.map((day) => {
      // Find orders executed on or before this day
      const ordersUpToDay = executedOrders.filter(
        (o) => startOfDay(parseISO(o.executed_at!)) <= day.date
      );

      // Calculate balance and profit up to this day
      let balanceChange = 0;
      ordersUpToDay.forEach((order) => {
        const orderValue = order.price * order.quantity;
        if (order.order_type === "sell") {
          balanceChange += orderValue;
        } else {
          balanceChange -= orderValue;
        }
      });

      const balance = initialBalance + balanceChange;
      const profit = balanceChange;

      return {
        name: day.label,
        saldo: Math.round(balance),
        lucro: Math.round(profit),
      };
    });

    // If no executed orders, show flat line
    if (executedOrders.length === 0) {
      return dataPoints.map((d) => ({
        ...d,
        saldo: initialBalance,
        lucro: 0,
      }));
    }

    return dataPoints;
  }, [orders, initialBalance]);

  const hasProfit = chartData.length > 0 && chartData[chartData.length - 1].lucro >= 0;

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Performance da Carteira</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={hasProfit ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={hasProfit ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
              <YAxis 
                className="text-xs fill-muted-foreground" 
                tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => [
                  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                  name === "saldo" ? "Saldo" : "Lucro/Prejuízo"
                ]}
              />
              <Area
                type="monotone"
                dataKey="saldo"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSaldo)"
                name="saldo"
              />
              <Area
                type="monotone"
                dataKey="lucro"
                stroke={hasProfit ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLucro)"
                name="lucro"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};