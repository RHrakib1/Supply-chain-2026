"use client";

import { usePathname } from "next/navigation";
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
  Crown
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { userRole, isAdmin, isSuperAdmin } = useDashboard();

  const allMenuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, adminOnly: true },
    { name: "Inventory", href: "/inventory", icon: Package, adminOnly: true },
    { name: "Orders", href: "/orders", icon: ShoppingCart, adminOnly: true },
    { name: "Retailers", href: "/retailers", icon: Store, adminOnly: true },
    { name: "Route Tracking", href: "/route-tracking", icon: MapPin, adminOnly: false },
    { name: "Analytics", href: "/analytics", icon: BarChart3, adminOnly: true },
  ];

  // Filter menu items based on user role
  const visibleMenuItems = allMenuItems.filter(item => {
    if (isAdmin) return true;
    if (userRole === "retailer" || userRole === "dealer") {
      return item.href === "/orders" || item.href === "/route-tracking";
    }
    return item.href === "/route-tracking";
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
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/10 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-slate-950/20">
          <LinkComponent 
            href={isAdmin ? "/" : "/route-tracking"} 
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-500 transition-colors duration-300 shadow-lg shadow-indigo-600/30">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-wider">LOGI</span>
              <span className="font-bold text-lg text-indigo-400 tracking-wider">LINK</span>
            </div>
          </LinkComponent>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {/* Super Admin Reserved Navigation */}
          {isSuperAdmin && (
            <div className="mb-6">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                <Crown className="h-3 w-3" />
                <span>Super Admin Hub</span>
              </div>
              <LinkComponent
                href="/super-admin"
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative text-left ${
                  pathname === "/super-admin"
                    ? "bg-amber-500/20 text-amber-200 border-l-4 border-amber-400 font-bold shadow-lg shadow-amber-500/10"
                    : "text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10 border-l-4 border-transparent"
                }`}
              >
                <Crown className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Super Admin Portal</span>
                {pathname === "/super-admin" && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
                )}
              </LinkComponent>
            </div>
          )}

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3 flex items-center justify-between">
            <span>Core Operations</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
              isSuperAdmin ? "bg-amber-500/20 text-amber-400" : isAdmin ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {userRole === "super_admin" ? "SUPER ADMIN" : userRole}
            </span>
          </div>
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <LinkComponent
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative text-left ${
                  isActive
                    ? "bg-indigo-600/25 text-white border-l-4 border-indigo-500 font-medium"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                }`} />
                <span>{item.name}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50" />
                )}
              </LinkComponent>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/20 space-y-2">
          {isAdmin && (
            <LinkComponent
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
            >
              <Settings className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
              <span>Settings</span>
            </LinkComponent>
          )}
          <LinkComponent
            href={isSuperAdmin ? "/super-admin" : isAdmin ? "/settings" : "/route-tracking"}
            onClick={() => {
              if (isOpen) onClose();
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group cursor-pointer"
          >
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm border ${
              isSuperAdmin ? "bg-amber-500/25 text-amber-400 border-amber-500/20" : isAdmin ? "bg-indigo-500/25 text-indigo-400 border-indigo-500/20" : "bg-emerald-500/25 text-emerald-400 border-emerald-500/20"
            }`}>
              {isSuperAdmin ? <Crown className="h-4 w-4" /> : isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                {isSuperAdmin ? "Rakib (SaaS Owner)" : isAdmin ? "Central Hub" : "Field Operations"}
              </p>
              <p className="text-[10px] text-slate-400 truncate uppercase font-bold">
                {isSuperAdmin ? "Master Super Admin" : isAdmin ? "Admin Terminal" : "Driver/Retailer Portal"}
              </p>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </LinkComponent>
        </div>
      </aside>
    </>
  );
}

