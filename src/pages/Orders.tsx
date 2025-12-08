import { DashboardLayout } from "@/components/DashboardLayout";
import { OrdersTable } from "@/components/OrdersTable";
import { StockMiniChart } from "@/components/StockMiniChart";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";

const orderSchema = z.object({
  ticker: z.string().min(1, "Ticker obrigatório").max(10),
  order_type: z.enum(["buy", "sell"]),
  price: z.number().min(0.01, "Preço mínimo R$ 0,01"),
  quantity: z.number().int().min(1, "Quantidade mínima 1"),
});

type OrderFormData = z.infer<typeof orderSchema>;

const Orders = () => {
  const { orders, createOrder, executeOrder, cancelOrder, deleteOrder, isLoading } = useOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { ticker: "", order_type: "buy", price: 10, quantity: 1 },
  });

  const tickerValue = watch("ticker");

  const onSubmitOrder = async (data: OrderFormData) => {
    setIsSubmitting(true);
    await createOrder({
      ticker: data.ticker,
      order_type: data.order_type,
      price: data.price,
      quantity: data.quantity,
    });
    reset();
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Ordens</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nova Ordem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitOrder)} className="grid gap-4 md:grid-cols-5">
                <div>
                  <Label>Ticker</Label>
                  <Input placeholder="PETR4" {...register("ticker")} />
                  {errors.ticker && <p className="text-xs text-destructive mt-1">{errors.ticker.message}</p>}
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Controller
                    name="order_type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Compra</SelectItem>
                          <SelectItem value="sell">Venda</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label>Preço (R$)</Label>
                  <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
                  {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input type="number" {...register("quantity", { valueAsNumber: true })} />
                  {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity.message}</p>}
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Ordem"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Mini gráfico da ação selecionada */}
          <div className="lg:col-span-1">
            {tickerValue && tickerValue.length >= 4 ? (
              <StockMiniChart ticker={tickerValue} />
            ) : (
              <Card className="border-dashed h-full">
                <CardContent className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Digite o ticker de uma ação para ver o gráfico
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

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

export default Orders;
