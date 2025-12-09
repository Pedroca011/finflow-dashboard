import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { getPlanByProductId, STRIPE_PLANS } from "@/lib/stripe-config";

interface SubscriptionData {
  subscribed: boolean;
  plan: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user, setSubscription, subscription } = useAuthStore();

  const checkSubscription = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke<SubscriptionData>("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }

      if (data) {
        setSubscription({
          id: "",
          user_id: user.id,
          plan: (data.plan as "basic" | "pro") || "basic",
          status: data.subscribed ? "active" : "inactive",
          stripe_customer_id: null,
          stripe_subscription_id: null,
          created_at: "",
          updated_at: "",
        });
      }
    } catch (err) {
      console.error("Failed to check subscription:", err);
    }
  }, [user, setSubscription]);

  // Check subscription on mount and when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  // Refresh subscription periodically (every 60 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  // Get current plan limits
  const getPlanLimits = () => {
    const isActive = subscription?.status === "active";
    const plan = subscription?.plan || "basic";
    
    if (!isActive) {
      return {
        maxOrders: 3,
        hasAdvancedCharts: false,
        hasRealtimeReports: false,
        hasPrioritySupport: false,
        hasApiAccess: false,
        hasAiAnalysis: false,
      };
    }

    if (plan === "pro") {
      return {
        maxOrders: Infinity,
        hasAdvancedCharts: true,
        hasRealtimeReports: true,
        hasPrioritySupport: true,
        hasApiAccess: true,
        hasAiAnalysis: true,
      };
    }

    // Basic plan
    return {
      maxOrders: 5,
      hasAdvancedCharts: false,
      hasRealtimeReports: false,
      hasPrioritySupport: false,
      hasApiAccess: false,
      hasAiAnalysis: false,
    };
  };

  return {
    subscription,
    checkSubscription,
    isSubscribed: subscription?.status === "active",
    currentPlan: subscription?.plan || null,
    planLimits: getPlanLimits(),
  };
};
