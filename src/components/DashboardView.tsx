"use client";

import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Truck, 
  Package, 
  ShoppingCart, 
  CheckCircle, 
  ChevronRight, 
  RefreshCw,
  MapPin,
  Store,
  Clock,
  Activity,
  BarChart3
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useDashboard } from "@/context/DashboardContext";

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

export default function DashboardView({ onOpenRestockModal, onNavigate }: DashboardViewProps) {
  const { inventory, orders, retailers, activityLogs } = useDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 850);
  };

  // 1. Real-Time Summary Cards derived directly from live Supabase tables
  const metrics = useMemo(() => {
    // Total Inventory Volume: sum of qty across all inventory items
    const totalInventoryVolume = inventory.reduce((sum, item) => sum + item.qty, 0);
    
    // Low Stock Items count: qty <= minRequired or status !== "In Stock"
    const lowStockCount = inventory.filter(item => item.qty <= item.minRequired || item.status !== "In Stock").length;
    
    // Pending Shipments count: status === "Pending" || "Processing"
    const pendingOrdersCount = orders.filter(o => o.status === "Pending" || o.status === "Processing").length;
    
    // Active Retailers count: status === "Active"
    const activeRetailersCount = retailers.filter(r => r.status === "Active").length;

    return {
      totalInventoryVolume,
      lowStockCount,
      pendingOrdersCount,
      activeRetailersCount,
    };
  }, [inventory, orders, retailers]);

  // 2. Calculate Order Trends Chart Data from Real Order Dates & Total Values
  const orderTrendsData = useMemo(() => {
    const dateMap: Record<string, { date: string; revenue: number; ordersCount: number }> = {};
    
    orders.forEach(o => {
      const dateKey = o.date || new Date().toISOString().split("T")[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey, revenue: 0, ordersCount: 0 };
      }
      dateMap[dateKey].revenue += o.total;
      dateMap[dateKey].ordersCount += 1;
    });

    const sortedData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
    
    // Format date for chart axis label (e.g. "Jul 24")
    return sortedData.map(d => {
      const parts = d.date.split("-");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate = parts.length === 3 
        ? `${monthNames[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`
        : d.date;
      return {
        ...d,
        displayDate: formattedDate,
      };
    });
  }, [orders]);

  // Alert stock items listing
  const alertItems = useMemo(() => {
    return inventory
      .filter(item => item.qty <= item.minRequired || item.status !== "In Stock")
      .slice(0, 4);
  }, [inventory]);

  // Recent shipments table listing
  const recentShipments = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Supply Chain Command Center</h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Real-time operations dashboard, live Supabase telemetry metrics, and sales trend analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-900/80 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Supabase Live Sync
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

      {/* 1. Real-Time Summary Cards Grid (Calculated directly from Supabase Tables) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Inventory Volume */}
        <div 
          onClick={() => onNavigate("Inventory")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden cursor-pointer shadow-lg shadow-indigo-600/5 border border-white/10"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Inventory Volume</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-black/30">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{metrics.totalInventoryVolume.toLocaleString()}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              Units
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">Across {inventory.length} active SKUs</div>
        </div>

        {/* Low Stock Items Count (< min_required) */}
        <div 
          onClick={() => onNavigate("Inventory")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden cursor-pointer shadow-lg shadow-rose-600/5 border border-white/10"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Low Stock Items</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-black/30">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{metrics.lowStockCount}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              metrics.lowStockCount === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            }`}>
              {metrics.lowStockCount === 0 ? <CheckCircle className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {metrics.lowStockCount === 0 ? "Optimal" : `&lt; min_req`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">Requires replenishment</div>
        </div>

        {/* Pending Shipments Count */}
        <div 
          onClick={() => onNavigate("Orders")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden cursor-pointer shadow-lg shadow-amber-600/5 border border-white/10"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Pending Shipments</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-black/30">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{metrics.pendingOrdersCount}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-amber-500/10 text-amber-400">
              <Clock className="h-3 w-3" />
              In Queue
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">Pending or processing status</div>
        </div>

        {/* Active Retailers Count */}
        <div 
          onClick={() => onNavigate("Retailers")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden cursor-pointer shadow-lg shadow-emerald-600/5 border border-white/10"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Active Retailers</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-black/30">
              <Store className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{metrics.activeRetailersCount}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-3 w-3" />
              Verified
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">Out of {retailers.length} total partner hubs</div>
        </div>

      </div>

      {/* 2. Interactive Order Trends Chart (Calculated from Real Order Dates & Totals) */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl bg-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              Live Sales & Order Revenue Trends
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real order volumes and dollar values queried directly from Supabase <code className="text-indigo-300">orders</code> table
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              {orders.length} Total Orders Logged
            </span>
          </div>
        </div>

        <div className="w-full h-[280px]">
          {orderTrendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderTrendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="displayDate" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`$${Number(value ?? 0).toLocaleString()}`, "Order Volume"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Sales Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No sales orders recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid: Map & Stock Alerts */}
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

      {/* Bottom Grid: Recent Shipments & Live Recent Activity Log */}
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

        {/* 3. Live Recent Activity Log Feed */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  Recent Activity Log
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time audit log of inventory & freight events</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="mt-4 space-y-3 max-h-[290px] overflow-y-auto pr-1">
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => {
                  const getLogStyle = (type: string) => {
                    switch (type) {
                      case "inventory":
                        return { icon: Package, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
                      case "order":
                        return { icon: ShoppingCart, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
                      case "retailer":
                        return { icon: Store, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
                      default:
                        return { icon: Activity, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
                    }
                  };

                  const logConfig = getLogStyle(log.type);
                  const LogIcon = logConfig.icon;

                  return (
                    <div 
                      key={log.id} 
                      className="p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all flex items-start gap-3"
                    >
                      <div className={`p-2 rounded-lg border flex-shrink-0 mt-0.5 ${logConfig.color}`}>
                        <LogIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-xs font-bold text-white truncate">{log.title}</h3>
                          <span className="text-[9px] font-semibold text-slate-500 flex items-center gap-1 flex-shrink-0">
                            <Clock className="h-2.5 w-2.5" />
                            {log.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{log.description}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">No recent activity logged.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
            <div>
              <span className="font-semibold text-white block">Supabase Realtime Feed</span>
              <span className="text-[10px] text-indigo-400 font-medium">Listening to postgres_changes</span>
            </div>
            <button
              onClick={onOpenRestockModal}
              className="text-[10px] font-bold text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition-all"
            >
              + Quick Restock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

