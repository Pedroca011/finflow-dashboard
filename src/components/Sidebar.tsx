import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Ordens", path: "/orders" },
  { icon: CreditCard, label: "Assinatura", path: "/billing" },
];

export const Sidebar = () => {
  const location = useLocation();
  const { profile, subscription } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
          <div className="p-2 bg-primary rounded-lg shrink-0">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-lg">TradeSim</span>}
        </div>

        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-16 h-6 w-6 rounded-full border bg-background shadow-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {!collapsed && profile && (
            <div className="px-2 py-3 rounded-lg bg-sidebar-accent/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
              {subscription && (
                <div className="mt-2 pt-2 border-t border-border">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      subscription.status === "active"
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {subscription.plan.toUpperCase()} •{" "}
                    {subscription.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                </div>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
              collapsed && "justify-center px-2"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};
