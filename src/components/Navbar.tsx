"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Search, 
  Menu, 
  Clock,
  Package,
  AlertTriangle,
  CheckCircle,
  Database
} from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { useDashboard } from "@/context/DashboardContext";

interface NavbarProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ onToggleSidebar, searchQuery, setSearchQuery }: NavbarProps) {
  const { isSupabaseLive, isSeeding, seedDatabase } = useDashboard();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notifications = [
    {
      id: 1,
      title: "Delayed Shipment Alert",
      desc: "Route #4 (Truck TX-89) delayed by 45 mins due to construction.",
      time: "10 mins ago",
      type: "delay",
      icon: AlertTriangle,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      id: 2,
      title: "Critical Stock Warning",
      desc: "Industrial Couplers (SKU-892) reached reorder threshold (12 units remaining).",
      time: "1 hour ago",
      type: "stock",
      icon: Package,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
    },
    {
      id: 3,
      title: "Fulfillment Goal Reached",
      desc: "Daily fulfillment rate achieved 99.4% across all retailers.",
      time: "3 hours ago",
      type: "success",
      icon: CheckCircle,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-slate-950/40">
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
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300"
          />
        </div>
      </div>

      {/* Right side: Notifications, Supabase Seed, Profile */}
      <div className="flex items-center gap-3">
        {/* Supabase Status / Seed Button */}
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

        {/* Mobile Search Button (Placeholder for UI completeness) */}
        <button className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 relative ${
              showNotifications ? "bg-white/5 border-white/5 text-white" : ""
            }`}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl shadow-black/80 overflow-hidden border border-white/15 animate-in fade-in slide-in-from-top-3 duration-250">
              <div className="px-5 py-4 border-b border-white/10 bg-slate-950/40 flex justify-between items-center">
                <span className="font-semibold text-white">Notifications</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">3 New</span>
              </div>
              <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                {notifications.map((n) => {
                  const NotifIcon = n.icon;
                  return (
                    <div key={n.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                      <div className={`p-2 rounded-xl border flex-shrink-0 h-10 w-10 flex items-center justify-center ${n.color}`}>
                        <NotifIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white leading-tight">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-1 leading-normal">{n.desc}</p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500 font-medium">
                          <Clock className="h-3 w-3" />
                          <span>{n.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-3 border-t border-white/10 bg-slate-950/40 text-center">
                <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  View all alerts & reports
                </button>
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
