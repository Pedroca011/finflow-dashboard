import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi, PortfolioResponse } from '@/services/api';
import { toast } from 'sonner';

export const usePortfolio = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<PortfolioResponse>({
    queryKey: ['portfolio'],
    queryFn: portfolioApi.getPortfolio,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  const refreshPortfolio = () => {
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
  };

  return {
    portfolio: data,
    summary: data?.summary,
    positions: data?.positions || [],
    tradeHistory: data?.tradeHistory || [],
    isLoading,
    error,
    refetch,
    refreshPortfolio,
  };
};
