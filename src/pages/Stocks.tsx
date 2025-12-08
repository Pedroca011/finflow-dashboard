import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useStocks, useStockQuote } from "@/hooks/useStocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const Stocks = () => {
  const { data: stocks, isLoading, error } = useStocks();
  const [search, setSearch] = useState("");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const { data: quoteData, isLoading: isQuoteLoading } = useStockQuote(
    selectedTicker || "",
    !!selectedTicker
  );

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
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`;
    }
    return value.toString();
  };

  const quote = quoteData?.[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ações</h1>
            <p className="text-muted-foreground">
              Lista de ações disponíveis na B3
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
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
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

        {/* Modal de detalhes da ação */}
        <Dialog
          open={!!selectedTicker}
          onOpenChange={() => setSelectedTicker(null)}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {quote?.logourl && (
                  <img
                    src={quote.logourl}
                    alt={selectedTicker || ""}
                    className="h-8 w-8 rounded"
                  />
                )}
                {selectedTicker} - {quote?.shortName || "Carregando..."}
              </DialogTitle>
            </DialogHeader>
            {isQuoteLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : quote ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {formatCurrency(quote.regularMarketPrice)}
                  </span>
                  <Badge
                    className={cn(
                      "text-lg px-3 py-1",
                      quote.regularMarketChangePercent >= 0
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {quote.regularMarketChangePercent >= 0 ? "+" : ""}
                    {quote.regularMarketChangePercent.toFixed(2)}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Abertura</span>
                      <span className="font-mono">
                        {formatCurrency(quote.regularMarketOpen)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Máxima</span>
                      <span className="font-mono text-success">
                        {formatCurrency(quote.regularMarketDayHigh)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mínima</span>
                      <span className="font-mono text-destructive">
                        {formatCurrency(quote.regularMarketDayLow)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fech. Ant.</span>
                      <span className="font-mono">
                        {formatCurrency(quote.regularMarketPreviousClose)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-mono">
                        {formatVolume(quote.regularMarketVolume)}
                      </span>
                    </div>
                    {quote.marketCap && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Cap</span>
                        <span className="font-mono">
                          {formatVolume(quote.marketCap)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Erro ao carregar dados
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Stocks;
