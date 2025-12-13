import { useQuery, useQueryClient } from '@tanstack/react-query';
import { portfolioApi, PortfolioResponse } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export const usePortfolio = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery<PortfolioResponse>({
    queryKey: ['portfolio'],
    queryFn: portfolioApi.getPortfolio,
    staleTime: 30000,
    retry: 1,
    enabled: !!user, // Only fetch when user is logged in
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
