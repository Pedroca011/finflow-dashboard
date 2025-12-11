import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Types
export interface PortfolioSummary {
  balance: number;
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
  positionsCount: number;
}

export interface PortfolioPosition {
  stockSymbol: string;
  quantity: number;
  averagePrice: number;
  totalInvested: number;
  currentValue: number | null;
  profitLoss: number | null;
  profitLossPercentage: number | null;
}

export interface TradeHistoryItem {
  id: string;
  stockSymbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  executedAt: string | null;
}

export interface PortfolioResponse {
  summary: PortfolioSummary;
  positions: PortfolioPosition[];
  tradeHistory: { date: string; trades: TradeHistoryItem[] }[];
}

export interface Order {
  id: string;
  ticker: string;
  orderType: string;
  price: number;
  quantity: number;
  status: string;
  createdAt: string;
  executedAt: string | null;
}

export interface CreateOrderInput {
  ticker: string;
  orderType: 'BUY' | 'SELL';
  price: number;
  quantity: number;
}

// API Functions
export const portfolioApi = {
  getPortfolio: async (): Promise<PortfolioResponse> => {
    const response = await apiClient.get('/simulator/portfolio');
    return response.data;
  },
};

export const ordersApi = {
  getOrders: async (): Promise<{ orders: Order[] }> => {
    const response = await apiClient.get('/simulator/orders');
    return response.data;
  },

  createOrder: async (input: CreateOrderInput): Promise<{ success: boolean; order: Order }> => {
    const response = await apiClient.post('/simulator/orders', input);
    return response.data;
  },

  executeOrder: async (orderId: string): Promise<{ success: boolean; order: Order }> => {
    const response = await apiClient.put(`/simulator/orders/${orderId}/execute`);
    return response.data;
  },

  cancelOrder: async (orderId: string): Promise<{ success: boolean; order: Order }> => {
    const response = await apiClient.put(`/simulator/orders/${orderId}/cancel`);
    return response.data;
  },

  deleteOrder: async (orderId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/simulator/orders/${orderId}`);
    return response.data;
  },
};

export default apiClient;
