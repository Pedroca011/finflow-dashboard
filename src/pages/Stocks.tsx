import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StockDetailChart } from "@/components/StockDetailChart";
import { useStocks } from "@/hooks/useStocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, TrendingUp, TrendingDown, BarChart3, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Stocks = () => {
  const { data: stocks, isLoading, error } = useStocks();
  const [search, setSearch] = useState("");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const filteredStocks = stocks?.filter(
    (stock) =>
      stock.stock.toLowerCase().includes(search.toLowerCase()) ||
      stock.name.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ações</h1>
            <p className="text-muted-foreground">
              Clique em uma ação para ver detalhes e gráfico
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ticker ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cotações em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                Erro ao carregar ações. Tente novamente mais tarde.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Variação</TableHead>
                      <TableHead className="text-right hidden md:table-cell">
                        Volume
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks?.slice(0, 50).map((stock) => (
                      <TableRow
                        key={stock.stock}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedTicker(stock.stock)}
                      >
                        <TableCell>
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
                            <span className="font-medium">{stock.stock}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {stock.name}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(stock.close)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={stock.change >= 0 ? "default" : "destructive"}
                            className={cn(
                              "font-mono",
                              stock.change >= 0
                                ? "bg-success/10 text-success hover:bg-success/20"
                                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            )}
                          >
                            {stock.change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {stock.change >= 0 ? "+" : ""}
                            {stock.change.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell font-mono">
                          {formatVolume(stock.volume)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sheet de detalhes da ação */}
        <Sheet open={!!selectedTicker} onOpenChange={() => setSelectedTicker(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center justify-between">
                <span>Detalhes da Ação</span>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTicker(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </SheetTitle>
            </SheetHeader>
            {selectedTicker && <StockDetailChart ticker={selectedTicker} />}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default Stocks;
