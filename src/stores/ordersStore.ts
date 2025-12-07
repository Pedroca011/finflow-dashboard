import { create } from "zustand";
import { Order } from "@/types";

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  removeOrder: (id: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  isLoading: false,
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, ...updates } : order
      ),
    })),
  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    })),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
