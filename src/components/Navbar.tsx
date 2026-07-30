"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Search, 
  Menu, 
  Clock,
  Package,
  ShoppingCart,
  Database,
  Shield,
  User,
  Crown,
  ChevronDown,
  Calendar,
  Sun,
  Moon
} from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { useDashboard, UserRole } from "@/context/DashboardContext";

interface NavbarProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ onToggleSidebar, searchQuery, setSearchQuery }: NavbarProps) {
  const { 
    isSupabaseLive, 
    isSeeding, 
    seedDatabase, 
    userRole, 
    isAdmin, 
    isSuperAdmin, 
    setUserRole,
    activityLogs,
    unreadNotificationsCount,
    markNotificationsAsRead,
    dateRange,
    setDateRange,
    theme,
    toggleTheme
  } = useDashboard();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState && unreadNotificationsCount > 0) {
      markNotificationsAsRead();
    }
  };
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRoleSelect = async (role: UserRole) => {
    await setUserRole(role);
    setShowRoleDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-white/10 dark:border-white/10 border-slate-200 flex items-center justify-between px-4 sm:px-6 bg-slate-950/40 dark:bg-slate-950/40 bg-white/90 transition-colors">
      {/* Left side: Hamburger and Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Input */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search shipments, inventory, retailers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/60 dark:bg-slate-900/60 bg-slate-100 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300"
          />
        </div>
      </div>

      {/* Right side: Master Date Filter, Role Switcher, Supabase Seed, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        
        {/* Master Date Range Filter Pill */}
        <div className="relative hidden md:block" ref={dateRef}>
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-200 shadow-sm"
          >
            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
            <span>Range: <strong className="font-bold">{dateRange === "7d" ? "Last 7 Days" : dateRange === "30d" ? "Last 30 Days" : "Custom Range"}</strong></span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl shadow-xl border border-slate-200 dark:border-white/15 overflow-hidden bg-white dark:bg-slate-950/95 z-50 animate-in fade-in duration-150 text-slate-900 dark:text-slate-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Master Date Filter
              </div>
              <button
                onClick={() => { setDateRange("7d"); setShowDateDropdown(false); }}
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors ${
                  dateRange === "7d" ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <span>Last 7 Days</span>
                {dateRange === "7d" && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
              </button>
              <button
                onClick={() => { setDateRange("30d"); setShowDateDropdown(false); }}
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors ${
                  dateRange === "30d" ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <span>Last 30 Days</span>
                {dateRange === "30d" && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
              </button>
              <button
                onClick={() => { setDateRange("custom"); setShowDateDropdown(false); }}
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors ${
                  dateRange === "custom" ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <span>Custom Range</span>
                {dateRange === "custom" && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
              </button>
            </div>
          )}
        </div>
        
        {/* Role Switcher Pill */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
              isSuperAdmin
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                : isAdmin 
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20" 
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
            }`}
          >
            {isSuperAdmin ? <Crown className="h-3.5 w-3.5" /> : isAdmin ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            <span>Role: <strong className="uppercase">{userRole === "super_admin" ? "Super Admin" : userRole}</strong></span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-52 glass-panel rounded-xl shadow-xl border border-white/15 overflow-hidden bg-slate-950/95 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase">
                Select Active User Role
              </div>

              <button
                onClick={() => handleRoleSelect("super_admin")}
                className={`w-full px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-colors ${
                  userRole === "super_admin" ? "bg-amber-600/20 text-amber-200 font-bold" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  <span>Super Admin (Owner)</span>
                </div>
                {userRole === "super_admin" && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
              </button>

              <button
                onClick={() => handleRoleSelect("admin")}
                className={`w-full px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-colors ${
                  userRole === "admin" ? "bg-indigo-600/20 text-white font-bold" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Client Admin</span>
                </div>
                {userRole === "admin" && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />}
              </button>

              <button
                onClick={() => handleRoleSelect("user")}
                className={`w-full px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-colors ${
                  userRole === "user" ? "bg-emerald-600/20 text-white font-bold" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Normal User</span>
                </div>
                {userRole === "user" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Supabase Status / Seed Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={seedDatabase}
            disabled={isSeeding}
            title="Click to seed sample inventory, orders, and retailers into Supabase"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-300 ${
              isSupabaseLive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20"
            }`}
          >
            <Database className={`h-3.5 w-3.5 ${isSeeding ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSeeding ? "Seeding..." : isSupabaseLive ? "Supabase Live" : "Seed Supabase"}</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-all duration-200"
        >
          {theme === "dark" ? (
            <Sun className="h-4.5 w-4.5 text-amber-400" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-indigo-600" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotifications}
            className={`p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 relative ${
              showNotifications ? "bg-white/5 border-white/5 text-white" : ""
            }`}
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md shadow-rose-500/30">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl shadow-black/80 overflow-hidden border border-white/15 animate-in fade-in slide-in-from-top-3 duration-250 z-50">
              <div className="px-5 py-4 border-b border-white/10 bg-slate-950/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-400" />
                  <span className="font-semibold text-white text-sm">Real-time Notification Center</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {userRole === "super_admin" ? "SaaS Owner" : isAdmin ? "Hub Admin" : "User Ops"}
                  </span>
                  {unreadNotificationsCount > 0 ? (
                    <span className="text-[10px] bg-rose-500/20 text-rose-350 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                      {unreadNotificationsCount} New
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                      All Read
                    </span>
                  )}
                </div>
              </div>

              <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => {
                    const getIconConfig = (type: string) => {
                      switch (type) {
                        case "inventory":
                          return { icon: Package, label: "Inventory", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
                        case "order":
                          return { icon: ShoppingCart, label: "Order Ops", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
                        case "retailer":
                          return { icon: Database, label: "Tenant / Network", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
                        default:
                          return { icon: Bell, label: "System", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
                      }
                    };

                    const config = getIconConfig(log.type);
                    const IconComp = config.icon;

                    return (
                      <div key={log.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                        <div className={`p-2.5 rounded-xl border flex-shrink-0 h-9 w-9 flex items-center justify-center ${config.color}`}>
                          <IconComp className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-white leading-tight truncate">{log.title}</p>
                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded shrink-0">
                              {config.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{log.description}</p>
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-500 font-medium">
                            <Clock className="h-3 w-3" />
                            <span>{log.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">No notifications recorded.</p>
                )}
              </div>

              <div className="px-5 py-3 border-t border-white/10 bg-slate-950/40 flex justify-between items-center text-xs">
                <button 
                  onClick={markNotificationsAsRead}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors text-[11px] cursor-pointer"
                >
                  Mark all as read
                </button>
                <span className="text-[10px] text-slate-500 font-medium">Supabase Realtime Feed</span>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-white/10" />

        {/* Clerk Auth Controls */}
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 rounded-xl border border-indigo-500/30 shadow-md shadow-indigo-500/20",
              },
            }}
          />
        </Show>
        <Show when="signed-out">
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl transition-all duration-300 shadow-md shadow-indigo-500/20">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </Show>
      </div>
    </header>
  );
}

