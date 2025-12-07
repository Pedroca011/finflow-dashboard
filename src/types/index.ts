export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'basic' | 'pro';
  status: 'active' | 'inactive' | 'canceled';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  ticker: string;
  order_type: 'buy' | 'sell';
  price: number;
  quantity: number;
  status: 'open' | 'executed' | 'canceled';
  executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  ticker: string;
  order_type: 'buy' | 'sell';
  price: number;
  quantity: number;
}

export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  priceId: string;
  productId: string;
  features: string[];
  popular?: boolean;
}
