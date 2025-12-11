import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  History, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Portfolio = () => {
  const { summary, positions, tradeHistory, isLoading, error } = usePortfolio();

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="p-8 text-center">
            <CardTitle className="text-destructive mb-2">Erro ao carregar portfólio</CardTitle>
            <CardDescription>
              Certifique-se de que a API local está rodando em localhost:3000
            </CardDescription>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portfólio</h1>
          <p className="text-muted-foreground">
            Acompanhe suas posições e performance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(summary?.balance || 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(summary?.totalInvested || 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
              {(summary?.totalProfitLoss || 0) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(summary?.currentValue || 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">P&L Total</CardTitle>
              {(summary?.totalProfitLoss || 0) >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className={cn(
                    "text-2xl font-bold",
                    (summary?.totalProfitLoss || 0) >= 0 ? "text-emerald-500" : "text-destructive"
                  )}>
                    {formatCurrency(summary?.totalProfitLoss || 0)}
                  </div>
                  <p className={cn(
                    "text-xs",
                    (summary?.profitLossPercentage || 0) >= 0 ? "text-emerald-500" : "text-destructive"
                  )}>
                    {formatPercent(summary?.profitLossPercentage || 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Positions and History */}
        <Tabs defaultValue="positions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="positions">
              <PieChart className="h-4 w-4 mr-2" />
              Posições Atuais
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Histórico de Transações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : positions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Nenhuma posição aberta</h3>
                  <p className="text-muted-foreground">
                    Execute ordens de compra para começar a construir seu portfólio.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {positions.map((position) => (
                  <Card key={position.stockSymbol}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{position.stockSymbol}</CardTitle>
                        <Badge variant={(position.profitLoss || 0) >= 0 ? "default" : "destructive"}>
                          {formatPercent(position.profitLossPercentage)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantidade</span>
                        <span className="font-medium">{position.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Preço Médio</span>
                        <span className="font-medium">{formatCurrency(position.averagePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Investido</span>
                        <span className="font-medium">{formatCurrency(position.totalInvested)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor Atual</span>
                        <span className="font-medium">
                          {position.currentValue ? formatCurrency(position.currentValue) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-muted-foreground">P&L</span>
                        <span className={cn(
                          "font-bold",
                          (position.profitLoss || 0) >= 0 ? "text-emerald-500" : "text-destructive"
                        )}>
                          {position.profitLoss !== null ? formatCurrency(position.profitLoss) : '-'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : tradeHistory.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Nenhuma transação executada</h3>
                  <p className="text-muted-foreground">
                    Suas transações executadas aparecerão aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {tradeHistory.map((group) => (
                  <Card key={group.date}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {new Date(group.date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {group.trades.map((trade) => (
                        <div
                          key={trade.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant={trade.type === 'BUY' ? 'default' : 'secondary'}>
                              {trade.type === 'BUY' ? 'COMPRA' : 'VENDA'}
                            </Badge>
                            <div>
                              <p className="font-medium">{trade.stockSymbol}</p>
                              <p className="text-sm text-muted-foreground">
                                {trade.quantity} ações @ {formatCurrency(trade.price)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-bold",
                              trade.type === 'BUY' ? "text-destructive" : "text-emerald-500"
                            )}>
                              {trade.type === 'BUY' ? '-' : '+'}{formatCurrency(trade.total)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
