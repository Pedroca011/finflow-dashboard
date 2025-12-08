import { useQuery } from "@tanstack/react-query";
import { brapiService, BrapiStock, BrapiQuote } from "@/services/brapi";

export const useStocks = () => {
  return useQuery<BrapiStock[], Error>({
    queryKey: ["stocks"],
    queryFn: () => brapiService.listStocks(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useStockQuote = (ticker: string, enabled = true) => {
  return useQuery<BrapiQuote[], Error>({
    queryKey: ["quote", ticker],
    queryFn: () => brapiService.getQuote(ticker),
    enabled: enabled && !!ticker,
    staleTime: 1000 * 60, // 1 minuto
  });
};
