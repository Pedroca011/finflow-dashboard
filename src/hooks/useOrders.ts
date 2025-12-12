import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, CreateOrderInput } from '@/services/api';
import { Order } from '@/types';
import { toast } from 'sonner';
import { useSubscription } from './useSubscription';

// Map API response to frontend Order type
const mapApiOrder = (apiOrder: any): Order => ({
  id: apiOrder.id,
  user_id: apiOrder.userId || '',
  ticker: apiOrder.ticker || apiOrder.stockSymbol,
  order_type: (apiOrder.orderType || apiOrder.type)?.toLowerCase() as 'buy' | 'sell',
  price: Number(apiOrder.price),
  quantity: apiOrder.quantity,
  status: apiOrder.status?.toLowerCase() as 'open' | 'executed' | 'canceled',
  executed_at: apiOrder.executedAt,
  created_at: apiOrder.createdAt,
  updated_at: apiOrder.updatedAt || apiOrder.createdAt,
});

export const useOrders = () => {
  const queryClient = useQueryClient();
  const { isSubscribed, currentPlan } = useSubscription();

  // Calculate max orders based on subscription plan
  const maxOrders = !isSubscribed ? 3 : currentPlan === 'pro' ? Infinity : 5;

  // Fetch orders
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await ordersApi.getOrders();
      return response.orders.map(mapApiOrder);
    },
    staleTime: 30000,
    retry: 1,
  });

  const orders = data || [];
  const openOrdersCount = orders.filter(o => o.status === 'open').length;

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (input: { ticker: string; order_type: 'buy' | 'sell'; price: number; quantity: number }) => {
      const apiInput: CreateOrderInput = {
        ticker: input.ticker,
        orderType: input.order_type.toUpperCase() as 'BUY' | 'SELL',
        price: input.price,
        quantity: input.quantity,
      };
      return ordersApi.createOrder(apiInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Ordem criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar ordem');
    },
  });

  // Execute order mutation
  const executeOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.executeOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Ordem executada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao executar ordem');
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Ordem cancelada!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao cancelar ordem');
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Ordem removida!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover ordem');
    },
  });

  return {
    orders,
    isLoading,
    error,
    refetch,
    maxOrders,
    openOrdersCount,
    createOrder: createOrderMutation.mutateAsync,
    executeOrder: executeOrderMutation.mutate,
    cancelOrder: cancelOrderMutation.mutate,
    deleteOrder: deleteOrderMutation.mutate,
    isCreating: createOrderMutation.isPending,
    isExecuting: executeOrderMutation.isPending,
    isCanceling: cancelOrderMutation.isPending,
  };
};
