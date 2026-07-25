"use client";

import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Package, 
  ShoppingCart, 
  CheckCircle, 
  ChevronRight, 
  RefreshCw,
  MapPin,
  ArrowRight,
  Store
} from "lucide-react";

interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  location: string;
  qty: number;
  minRequired: number;
  unitPrice: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

interface Order {
  id: string;
  retailer: string;
  location: string;
  date: string;
  items: string;
  qty: number;
  total: number;
  status: "Pending" | "Processing" | "In Transit" | "Delivered" | "Cancelled";
  carrier: string;
  trackingNum: string;
  eta: string;
}

interface DashboardViewProps {
  inventory: InventoryItem[];
  orders: Order[];
  onOpenRestockModal: () => void;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ inventory, orders, onOpenRestockModal, onNavigate }: DashboardViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 850);
  };

  // Compute dynamic metrics via useMemo
  const metrics = useMemo(() => {
    const activeShipments = orders.filter(o => o.status === "In Transit").length.toString();
    const stockAlertItems = inventory.filter(item => item.status !== "In Stock").length;
    const pendingOrdersCount = orders.filter(o => o.status === "Pending" || o.status === "Processing").length.toString();
    
    // Calculate fulfillment rate based on delivered vs total orders (excluding cancelled)
    const activeOrders = orders.filter(o => o.status !== "Cancelled");
    const deliveredCount = orders.filter(o => o.status === "Delivered").length;
    const fulfillmentRate = activeOrders.length > 0 
      ? ((deliveredCount / activeOrders.length) * 100).toFixed(1) + "%"
      : "100%";

    return {
      activeShipments,
      stockAlertItems,
      pendingOrdersCount,
      fulfillmentRate
    };
  }, [inventory, orders]);

  // Alert stock items listing
  const alertItems = useMemo(() => {
    return inventory
      .filter(item => item.status !== "In Stock")
      .slice(0, 4); // limit to 4 alerts on dashboard
  }, [inventory]);

  // Recent shipments table listing
  const recentShipments = useMemo(() => {
    return orders.slice(0, 5); // show last 5 orders
  }, [orders]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Supply Chain Command Center</h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Real-time operations dashboard, logistics coordination, and predictive inventory analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Updates
          </span>
          <button 
            onClick={triggerRefresh}
            className="flex items-center gap-2 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Shipments Card */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden shadow-lg shadow-indigo-600/5">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Active Shipments</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-black/30">
              <Truck className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{metrics.activeShipments}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              +12.4%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">vs last week</div>
        </div>

        {/* Stock Alert Items Card */}
        <div 
          onClick={() => onNavigate("Inventory")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden cursor-pointer shadow-lg shadow-rose-600/5"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Stock Alert Items</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-black/30">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{metrics.stockAlertItems}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              metrics.stockAlertItems === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            }`}>
              {metrics.stockAlertItems === 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {metrics.stockAlertItems === 0 ? "Optimal" : `+${metrics.stockAlertItems} items`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">since yesterday</div>
        </div>

        {/* Orders Pending Card */}
        <div 
          onClick={() => onNavigate("Orders")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden cursor-pointer shadow-lg shadow-amber-600/5"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Orders Pending</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-black/30">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{metrics.pendingOrdersCount}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              +18.2%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">vs last month</div>
        </div>

        {/* Fulfillment Rate Card */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden shadow-lg shadow-emerald-600/5">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Fulfillment Rate</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-black/30">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{metrics.fulfillmentRate}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              +0.4%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">vs average</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Animated Map Widget */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-400" />
                Active Distribution Routes
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status of critical freight corridors</p>
            </div>
            <button 
              onClick={() => onNavigate("Route Tracking")} 
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors focus:outline-none"
            >
              Expand Map
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          
          <div className="flex-1 w-full bg-slate-950/45 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center p-4">
            <svg 
              className="w-full h-full max-h-[300px]"
              viewBox="0 0 500 250" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background dots styling */}
              <circle cx="100" cy="50" r="3" fill="rgba(255,255,255,0.08)" />
              <circle cx="120" cy="70" r="3" fill="rgba(255,255,255,0.08)" />
              <circle cx="140" cy="90" r="3" fill="rgba(255,255,255,0.08)" />
              <circle cx="200" cy="130" r="3" fill="rgba(255,255,255,0.08)" />
              <circle cx="250" cy="110" r="3" fill="rgba(255,255,255,0.08)" />
              <circle cx="320" cy="80" r="3" fill="rgba(255,255,255,0.08)" />
              
              {/* Route Alpha */}
              <path d="M 60,180 Q 150,90 280,110 T 440,70" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="3" strokeLinecap="round" />
              <path d="M 60,180 Q 150,90 280,110 T 440,70" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" strokeLinecap="round" className="animate-dash-line" />

              {/* Route Beta */}
              <path d="M 60,180 Q 180,210 320,160 T 420,180" stroke="rgba(236, 72, 153, 0.15)" strokeWidth="3" strokeLinecap="round" />
              <path d="M 60,180 Q 180,210 320,160 T 420,180" stroke="rgba(236, 72, 153, 0.5)" strokeWidth="2" strokeLinecap="round" className="animate-dash-line" />

              {/* Nodes */}
              <circle cx="60" cy="180" r="8" fill="#4f46e5" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
              <text x="50" y="200" fill="#a5b4fc" fontSize="8" fontWeight="bold">Central Hub</text>

              <circle cx="280" cy="110" r="6" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
              <circle cx="320" cy="160" r="6" fill="#1e1b4b" stroke="#ec4899" strokeWidth="2" />

              <circle cx="440" cy="70" r="6" fill="#10b981" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <text x="410" y="60" fill="#34d399" fontSize="8" fontWeight="bold">Walmart East</text>

              <circle cx="420" cy="180" r="6" fill="#f59e0b" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <text x="400" y="195" fill="#fbbf24" fontSize="8" fontWeight="bold">Target Dist</text>

              {/* Truck pulses */}
              <g transform="translate(195, 114)">
                <circle cx="0" cy="0" r="8" fill="#6366f1" className="animate-pulse-dot opacity-40" />
                <circle cx="0" cy="0" r="4" fill="#818cf8" />
              </g>
              <g transform="translate(260, 180)">
                <circle cx="0" cy="0" r="8" fill="#ec4899" className="animate-pulse-dot opacity-40" />
                <circle cx="0" cy="0" r="4" fill="#f472b6" />
              </g>
            </svg>
            
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2.5 bg-slate-900/80 border border-white/5 px-2 py-1 rounded-lg text-[9px] text-slate-350">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Route Alpha</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-pink-500"></span> Route Beta</span>
            </div>
          </div>
        </div>

        {/* Stock Alert Summary Panel */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-rose-400" />
                Inventory Alerts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Items currently below critical levels</p>
            </div>
            <button 
              onClick={() => onNavigate("Inventory")}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors focus:outline-none"
            >
              Manage Stock
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {alertItems.length > 0 ? (
              alertItems.map((item) => (
                <div 
                  key={item.sku} 
                  className={`p-3 border rounded-xl flex items-center justify-between ${
                    item.status === "Out of Stock" 
                      ? "bg-rose-500/10 border-rose-500/20" 
                      : "bg-amber-500/10 border-amber-500/20"
                  }`}
                >
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{item.sku}</h3>
                    <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">{item.name}</p>
                    <p className={`text-xs mt-1 ${item.status === "Out of Stock" ? "text-rose-400" : "text-amber-400"}`}>
                      Stock: {item.qty} units | Min Req: {item.minRequired}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                    item.status === "Out of Stock"
                      ? "bg-rose-500/20 text-rose-350 border-rose-500/30"
                      : "bg-amber-500/20 text-amber-350 border-amber-500/30"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                <CheckCircle className="h-8 w-8 text-emerald-500/40 mb-2" />
                <p className="text-xs font-bold">All stock levels are optimal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Shipments & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Shipments Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-400" />
                Active Freight Movements
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest shipments and their transit updates</p>
            </div>
            <button 
              onClick={() => onNavigate("Orders")}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors focus:outline-none"
            >
              View All Orders
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Shipment ID</th>
                  <th className="pb-3 px-4">Destination</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentShipments.map((s) => (
                  <tr key={s.id} className="group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onNavigate("Orders")}>
                    <td className="py-3.5 pr-4 font-bold text-white tracking-wider text-xs">
                      {s.id}
                      <span className="block font-medium text-[10px] text-indigo-400 mt-0.5">{s.carrier}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-semibold">{s.retailer}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        s.status === "Delivered" 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : s.status === "In Transit"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : s.status === "Processing"
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          : s.status === "Cancelled"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right text-slate-350 font-medium">{s.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <RefreshCw className="h-5 w-5 text-indigo-400" />
              Quick Operations
            </h2>
            <p className="text-xs text-slate-400">Trigger actions across the supply chain network</p>

            <div className="mt-6 space-y-3.5">
              {/* Log Restock Action */}
              <button
                onClick={onOpenRestockModal}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300 group text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/25 rounded-lg text-indigo-400">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Log Restock Order</p>
                    <p className="text-[10px] text-slate-400">Initiate supply replenishment</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigate("Route Tracking")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300 group text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 border border-pink-500/25 rounded-lg text-pink-400">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Dispatch Logistics Fleet</p>
                    <p className="text-[10px] text-slate-400">Assign drivers & define routes</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigate("Retailers")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300 group text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-400">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Audit Partner Network</p>
                    <p className="text-[10px] text-slate-400">Review retailer agreements</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 bg-slate-950/20 p-3 rounded-xl border border-white/5">
            <div>
              <span className="font-semibold text-white block">System Status: Optimal</span>
              <span className="text-[10px] text-indigo-400 font-medium">All APIs & Database online</span>
            </div>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 animate-pulse"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
