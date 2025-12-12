import { DashboardLayout } from "@/components/DashboardLayout";
import { StockDetailChart } from "@/components/StockDetailChart";
import { useOrders } from "@/hooks/useOrders";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, ShoppingCart, TrendingUp, AlertTriangle, Crown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";


const orderSchema = z.object({
  ticker: z.string().min(1, "Ticker obrigatório").max(10),
  order_type: z.enum(["buy", "sell"]),
  price: z.number().min(0.01, "Preço mínimo R$ 0,01"),
  quantity: z.number().int().min(1, "Quantidade mínima 1"),
});

type OrderFormData = z.infer<typeof orderSchema>;

const Orders = () => {
  const { createOrder, maxOrders, openOrdersCount } = useOrders();
  const { isSubscribed, currentPlan } = useSubscription();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { ticker: "", order_type: "buy", price: 0, quantity: 1 },
  });

  const tickerValue = watch("ticker");
  const priceValue = watch("price");
  const quantityValue = watch("quantity");
  const orderType = watch("order_type");

  const totalValue = (priceValue || 0) * (quantityValue || 0);
  const canCreateOrder = openOrdersCount < maxOrders;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const onSubmitOrder = async (data: OrderFormData) => {
    setIsSubmitting(true);
    await createOrder({
      ticker: data.ticker.toUpperCase(),
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
        <div>
          <h1 className="text-3xl font-bold">Nova Ordem</h1>
          <p className="text-muted-foreground">
            Crie ordens de compra ou venda. Suas ordens serão executadas automaticamente quando o preço de mercado atingir seu preço alvo.
          </p>
        </div>

        {/* Order Limit Warning */}
        {!canCreateOrder && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">Limite de ordens atingido</p>
                  <p className="text-sm text-muted-foreground">
                    Você tem {openOrdersCount} de {maxOrders === Infinity ? "∞" : maxOrders} ordens abertas permitidas no seu plano.
                  </p>
                </div>
              </div>
              <Button asChild size="sm">
                <Link to="/billing">
                  <Crown className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Order Limit Info */}
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className={cn(
            canCreateOrder ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          )}>
            {openOrdersCount} / {maxOrders === Infinity ? "∞" : maxOrders} ordens abertas
          </Badge>
          <span className="text-muted-foreground">
            Plano: {isSubscribed ? (currentPlan === "pro" ? "Pro" : "Basic") : "Gratuito"}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulário de criação de ordem */}
          <Card className={cn(!canCreateOrder && "opacity-60")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Ordem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitOrder)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticker">Ticker da Ação</Label>
                  <Input 
                    id="ticker"
                    placeholder="Ex: PETR4, VALE3, ITUB4" 
                    {...register("ticker")} 
                    className="uppercase"
                    disabled={!canCreateOrder}
                  />
                  {errors.ticker && (
                    <p className="text-xs text-destructive">{errors.ticker.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Ordem</Label>
                  <Controller
                    name="order_type"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!canCreateOrder}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4 text-success" />
                              Compra
                            </div>
                          </SelectItem>
                          <SelectItem value="sell">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-destructive" />
                              Venda
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço Alvo (R$)</Label>
                    <Input 
                      id="price"
                      type="number" 
                      step="0.01" 
                      {...register("price", { valueAsNumber: true })} 
                      disabled={!canCreateOrder}
                    />
                    {errors.price && (
                      <p className="text-xs text-destructive">{errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input 
                      id="quantity"
                      type="number" 
                      {...register("quantity", { valueAsNumber: true })} 
                      disabled={!canCreateOrder}
                    />
                    {errors.quantity && (
                      <p className="text-xs text-destructive">{errors.quantity.message}</p>
                    )}
                  </div>
                </div>

                {/* Resumo da ordem */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className={orderType === "buy" ? "text-success" : "text-destructive"}>
                      {orderType === "buy" ? "Compra" : "Venda"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor Total:</span>
                    <span className="font-mono font-semibold">{formatCurrency(totalValue)}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={isSubmitting || !canCreateOrder}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Criar Ordem
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Gráfico e detalhes da ação */}
          <StockDetailChart ticker={tickerValue} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
