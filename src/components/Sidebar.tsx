"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LinkComponent from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Store, 
  MapPin, 
  BarChart3, 
  X,
  Truck,
  Settings,
  Shield,
  User,
  Crown,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubMenuItem {
  name: string;
  href: string;
  tabKey?: string;
  badge?: string;
}

interface NavGroup {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

function SidebarContent({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");
  const { userRole, isAdmin, isSuperAdmin, theme, toggleTheme } = useDashboard();

  const navGroups: NavGroup[] = [
    {
      id: "dashboard",
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      subItems: [
        { name: "Executive Overview", href: "/" }
      ]
    },
    {
      id: "orders",
      name: "Orders & Fulfillment",
      href: "/orders",
      icon: ShoppingCart,
      subItems: [
        { name: "All Orders", href: "/orders" },
        { name: "Shipping Labels", href: "/orders?tab=labels", tabKey: "labels" },
        { name: "Dispatch & Courier", href: "/orders?tab=dispatch", tabKey: "dispatch" }
      ]
    },
    {
      id: "inventory",
      name: "Inventory & SKU Control",
      href: "/inventory",
      icon: Package,
      subItems: [
        { name: "Stock Levels", href: "/inventory" },
        { name: "Warehouses", href: "/inventory?tab=warehouses", tabKey: "warehouses" },
        { name: "Restock Alerts", href: "/inventory?tab=restock", tabKey: "restock", badge: "Low" }
      ]
    },
    {
      id: "retailers",
      name: "Retailer & CRM",
      href: "/retailers",
      icon: Store,
      subItems: [
        { name: "Partner Dealers", href: "/retailers" },
        { name: "Credit Limits", href: "/retailers?tab=credit", tabKey: "credit" },
        { name: "B2B Statements", href: "/retailers?tab=statements", tabKey: "statements" }
      ]
    },
    {
      id: "analytics",
      name: "Analytics & Trends",
      href: "/analytics",
      icon: BarChart3,
      subItems: [
        { name: "Sales Trends", href: "/analytics" },
        { name: "Basket Size Analysis", href: "/analytics?tab=basket", tabKey: "basket" },
        { name: "Courier Performance", href: "/analytics?tab=couriers", tabKey: "couriers" }
      ]
    },
    {
      id: "settings",
      name: "Settings & Integrations",
      href: "/settings",
      icon: Settings,
      subItems: [
        { name: "Courier APIs", href: "/settings?tab=couriers", tabKey: "couriers" },
        { name: "Team Roles", href: "/settings?tab=roles", tabKey: "roles" }
      ]
    }
  ];

  // Accordion open state for groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    orders: true,
    inventory: true,
    retailers: true,
    analytics: true,
    settings: true,
  });

  // Auto-expand group based on current pathname
  useEffect(() => {
    navGroups.forEach(group => {
      if (pathname === group.href || (group.href !== "/" && pathname.startsWith(group.href))) {
        setOpenGroups(prev => ({ ...prev, [group.id]: true }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter groups based on role
  const visibleGroups = navGroups.filter(group => {
    if (isAdmin) return true;
    if (userRole === "retailer" || userRole === "dealer") {
      return group.href === "/orders";
    }
    return false;
  });

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/10 dark:border-white/10 border-slate-200 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 bg-slate-950/90 dark:bg-slate-950/90 bg-white/95 text-slate-900 dark:text-slate-100 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-950/40">
          <LinkComponent 
            href={isAdmin ? "/" : "/route-tracking"} 
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-md shadow-indigo-600/30">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-black text-base text-slate-900 dark:text-white tracking-wide">LOGI</span>
                <span className="font-black text-base text-indigo-600 dark:text-indigo-400 tracking-wide">LINK</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">Nuport Enterprise</p>
            </div>
          </LinkComponent>
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto custom-scrollbar">
          {/* Super Admin Reserved Navigation */}
          {isSuperAdmin && (
            <div className="mb-3">
              <div className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest px-3 mb-1.5 flex items-center gap-1.5">
                <Crown className="h-3 w-3" />
                <span>Super Admin Hub</span>
              </div>
              <LinkComponent
                href="/super-admin"
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 text-xs font-semibold text-left ${
                  pathname === "/super-admin"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-l-4 border-amber-500 font-bold"
                    : "text-amber-600/80 dark:text-amber-300/80 hover:bg-amber-500/10"
                }`}
              >
                <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="truncate">Super Admin Portal</span>
              </LinkComponent>
            </div>
          )}

          {/* User Operations / Field Tracking link for driver/retailer */}
          {(!isAdmin || userRole === "user" || userRole === "driver") && (
            <div className="mb-3">
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-3 mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span>Field Tracking</span>
              </div>
              <LinkComponent
                href="/route-tracking"
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 text-xs font-semibold text-left ${
                  pathname === "/route-tracking"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-l-4 border-emerald-500 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate">Live Route Tracking</span>
              </LinkComponent>
            </div>
          )}

          {/* Enterprise Navigation Sub-Groups */}
          {isAdmin && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2 flex items-center justify-between">
                <span>Enterprise Suite</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  v2.4
                </span>
              </div>

              {visibleGroups.map((group) => {
                const Icon = group.icon;
                const isGroupActive = pathname === group.href || (group.href !== "/" && pathname.startsWith(group.href));
                const isGroupOpen = !!openGroups[group.id];

                return (
                  <div key={group.id} className="rounded-xl overflow-hidden">
                    {/* Group Header Button */}
                    <div
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer text-xs font-semibold select-none ${
                        isGroupActive
                          ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${isGroupActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                        <span className="truncate">{group.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isGroupOpen ? (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>
                    </div>

                    {/* Sub-Items List */}
                    {isGroupOpen && group.subItems && (
                      <div className="ml-3 pl-3 border-l border-slate-200 dark:border-white/10 my-1 space-y-0.5">
                        {group.subItems.map((subItem) => {
                          let isSubActive = false;
                          if (subItem.tabKey) {
                            isSubActive = pathname === group.href && activeTab === subItem.tabKey;
                          } else {
                            isSubActive = pathname === group.href && (!activeTab || activeTab === "");
                          }

                          return (
                            <LinkComponent
                              key={subItem.name}
                              href={subItem.href}
                              onClick={() => {
                                if (isOpen) onClose();
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 ${
                                isSubActive
                                  ? "bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                              }`}
                            >
                              <span className="truncate">{subItem.name}</span>
                              {subItem.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">
                                  {subItem.badge}
                                </span>
                              )}
                            </LinkComponent>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Sidebar Footer: Theme Toggle & User Info */}
        <div className="p-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-950/40 space-y-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
              <span>Theme: <strong className="capitalize">{theme}</strong></span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Toggle
            </span>
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              isSuperAdmin ? "bg-amber-500/25 text-amber-600 dark:text-amber-400" : isAdmin ? "bg-indigo-500/25 text-indigo-600 dark:text-indigo-400" : "bg-emerald-500/25 text-emerald-600 dark:text-emerald-400"
            }`}>
              {isSuperAdmin ? <Crown className="h-3.5 w-3.5" /> : isAdmin ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {isSuperAdmin ? "Rakib (Owner)" : isAdmin ? "Central Hub" : "Field Driver"}
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate uppercase font-semibold">
                {userRole === "super_admin" ? "SUPER ADMIN" : userRole}
              </p>
            </div>
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={null}>
      <SidebarContent {...props} />
    </Suspense>
  );
}
