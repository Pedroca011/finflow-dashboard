import { useQuery } from "@tanstack/react-query";
import { brapiService, BrapiStock } from "@/services/brapi";

export const useStocks = () => {
  return useQuery<BrapiStock[], Error>({
    queryKey: ["stocks"],
    queryFn: () => brapiService.listStocks(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
