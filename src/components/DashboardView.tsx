"use client";

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  CheckCircle, 
  ChevronRight, 
  RefreshCw,
  MapPin,
  Store,
  Clock,
  Activity,
  BarChart3,
  Crown,
  Building2,
  Users,
  DollarSign,
  Plus,
  ShieldCheck,
  Layers
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
import { useDashboard, Order, InventoryItem } from "@/context/DashboardContext";

interface DashboardViewProps {
  inventory: InventoryItem[];
  orders: Order[];
  onOpenRestockModal: () => void;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ onOpenRestockModal, onNavigate }: DashboardViewProps) {
  const { 
    userRole,
    isSuperAdmin,
    activeTenantId,
    inventory, 
    orders, 
    retailers, 
    activityLogs, 
    clients, 
    triggerUpgradeModal,
    setIsOrderModalOpen,
    setIsModalOpen
  } = useDashboard();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeClient = clients[0] || { name: "Apex Logistics", plan: "Professional" };
  const remainingDays = 5;

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 850);
  };

  // --- CLIENT ADMIN METRICS ---
  const clientAdminMetrics = useMemo(() => {
    const totalInventoryVolume = inventory.reduce((sum, item) => sum + item.qty, 0);
    const lowStockCount = inventory.filter(item => item.qty <= item.minRequired || item.status !== "In Stock").length;
    const pendingOrdersCount = orders.filter(o => o.status === "Pending" || o.status === "Processing").length;
    const activeRetailersCount = retailers.filter(r => r.status === "Active").length;
    const totalRevenue = orders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0);

    return {
      totalInventoryVolume,
      lowStockCount,
      pendingOrdersCount,
      activeRetailersCount,
      totalRevenue
    };
  }, [inventory, orders, retailers]);

  // --- SUPER ADMIN SAAS METRICS ---
  const saasMetrics = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === "Active").length;
    const totalMrr = clients.filter(c => c.status === "Active").reduce((sum, c) => sum + c.mrr, 0);
    const totalSeats = clients.reduce((sum, c) => sum + c.maxUsers, 0);
    return { totalClients, activeClients, totalMrr, totalSeats };
  }, [clients]);

  // --- SALES TREND CHART DATA ---
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

  const alertItems = useMemo(() => {
    return inventory
      .filter(item => item.qty <= item.minRequired || item.status !== "In Stock")
      .slice(0, 4);
  }, [inventory]);

  // =========================================================================
  // VIEW 1: SUPER ADMIN SAAS GROWTH COMMAND CENTER (Rakib)
  // =========================================================================
  if (isSuperAdmin) {
    return (
      <div className="space-y-8">
        {/* Super Admin Welcome Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-2">
                <Crown className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>SaaS Governance &amp; Executive Command Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                LogiLink Platform Control Center
              </h1>
              <p className="text-slate-400 mt-2 text-sm max-w-2xl">
                Global multi-tenant platform metrics, MRR revenue growth analytics, and tenant business provisioning.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate("Analytics")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-xs hover:bg-amber-500/20 transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                <span>MRR Analytics</span>
              </button>

              <button
                onClick={() => onNavigate("Analytics")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Onboard New Tenant</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 SaaS Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>SaaS Monthly Revenue</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">৳ {saasMetrics.totalMrr.toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-400">/mo</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Active subscription MRR</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Active Tenant Clients</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{saasMetrics.totalClients}</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{saasMetrics.activeClients} Active</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Provisioned SaaS businesses</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Provisioned User Seats</span>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{saasMetrics.totalSeats}</span>
              <span className="text-xs font-bold text-slate-400">max capacity</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Across all tenant accounts</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Platform System Uptime</span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">99.98%</span>
            </div>
            <div className="mt-2 text-xs text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Supabase Clusters Healthy
            </div>
          </div>
        </div>

        {/* Tenant Directory Summary Table */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-400" />
              <span>Registered Tenant Businesses</span>
            </h2>
            <button
              onClick={() => onNavigate("Analytics")}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              Full Governance Portal <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider bg-slate-950/30">
                  <th className="py-3 px-4">Tenant ID &amp; Name</th>
                  <th className="py-3 px-4">Owner Email</th>
                  <th className="py-3 px-4">Subscription Plan</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">MRR (BDT)</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-white font-mono">{c.id} • {c.name}</td>
                    <td className="py-3 px-4 text-slate-300">{c.ownerEmail}</td>
                    <td className="py-3 px-4 text-amber-400 font-extrabold">{c.plan}</td>
                    <td className="py-3 px-4 text-slate-400">{c.activeUsers} / {c.maxUsers}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-400">৳ {c.mrr.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: WAREHOUSE MANAGER OPERATIONAL VIEW (role === 'warehouse')
  // =========================================================================
  if (userRole === "warehouse") {
    return (
      <div className="space-y-8">
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-950 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                <Layers className="h-4 w-4" />
                <span>Warehouse Logistics Station</span>
              </div>
              <h1 className="text-3xl font-black text-white mt-1">Pack &amp; Stock Fulfillment Queue</h1>
              <p className="text-xs text-slate-400 mt-1">Tenant ID: {activeTenantId || "CLI-101"} • Warehouse Operations</p>
            </div>

            <button
              onClick={() => onNavigate("Inventory")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
            >
              <Package className="h-4 w-4" />
              <span>Full Inventory Table</span>
            </button>
          </div>
        </div>

        {/* Warehouse Operational Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-bold block">Pending Dispatch Orders</span>
            <span className="text-3xl font-black text-amber-300 mt-2 block">{clientAdminMetrics.pendingOrdersCount}</span>
            <p className="text-xs text-slate-500 mt-1">Awaiting packing &amp; invoice attachment</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-bold block">Low Stock SKU Warnings</span>
            <span className="text-3xl font-black text-rose-400 mt-2 block">{clientAdminMetrics.lowStockCount}</span>
            <p className="text-xs text-slate-500 mt-1">Requires immediate supplier purchase order</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-bold block">Active Stock Catalog</span>
            <span className="text-3xl font-black text-white mt-2 block">{inventory.length} SKUs</span>
            <p className="text-xs text-slate-500 mt-1">{clientAdminMetrics.totalInventoryVolume.toLocaleString()} total units</p>
          </div>
        </div>

        {/* Low Stock Items List */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-rose-400" />
            <span>Low Stock Reorder Alerts</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertItems.map(item => (
              <div key={item.sku} className="p-4 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-400">{item.sku}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{item.name}</h3>
                  <p className="text-xs text-slate-400">Qty: {item.qty} | Safety Min: {item.minRequired}</p>
                </div>
                <button
                  onClick={onOpenRestockModal}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: RETAILER / WHOLESALER PORTAL (role === 'retailer')
  // =========================================================================
  if (userRole === "retailer") {
    const retailerOrders = orders.slice(0, 5);

    return (
      <div className="space-y-8">
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-950 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                <Store className="h-4 w-4" />
                <span>B2B Retailer Order Portal</span>
              </div>
              <h1 className="text-3xl font-black text-white mt-1">Purchasing &amp; Credit Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1">View order history, track shipments, and place re-orders</p>
            </div>

            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Place New Order</span>
            </button>
          </div>
        </div>

        {/* Retailer Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-bold block">Purchased Volume</span>
            <span className="text-3xl font-black text-white mt-2 block">৳ {clientAdminMetrics.totalRevenue.toLocaleString()}</span>
            <p className="text-xs text-emerald-400 font-bold mt-1">Active Partnership Account</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-bold block">Assigned Credit Limit</span>
            <span className="text-3xl font-black text-indigo-400 mt-2 block">৳ 1,50,000</span>
            <p className="text-xs text-slate-500 mt-1">Net 30 Payment Terms</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-400 font-bold block">Active Orders in Transit</span>
            <span className="text-3xl font-black text-blue-400 mt-2 block">
              {orders.filter(o => o.status === "In Transit").length}
            </span>
            <p className="text-xs text-slate-500 mt-1">Steadfast / Pathao Telemetry</p>
          </div>
        </div>

        {/* Retailer Recent Orders */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-400" />
            <span>My Recent Purchase Orders</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider bg-slate-950/30">
                  <th className="py-3 px-4">Order ID &amp; Date</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Courier Carrier</th>
                  <th className="py-3 px-4 text-right">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {retailerOrders.map(o => (
                  <tr key={o.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-white font-mono">{o.id} <span className="block text-[10px] text-slate-500">{o.date}</span></td>
                    <td className="py-3 px-4 text-slate-200">{o.items}</td>
                    <td className="py-3 px-4 font-black text-indigo-400">৳ {o.total.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{o.carrier} ({o.trackingNum})</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: DEFAULT CLIENT ADMIN COMMERCIAL COMMAND CENTER (role === 'admin')
  // =========================================================================
  return (
    <div className="space-y-8">
      {/* Expiry Warning Banner */}
      {remainingDays <= 7 && (
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                Subscription Expiry Warning
              </h4>
              <p className="text-xs text-slate-200 mt-0.5">
                Your <strong className="text-white">{activeClient.plan || "Professional"} Plan</strong> subscription expires in <strong className="text-amber-400 font-bold">{remainingDays} days</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => triggerUpgradeModal("Subscription Renewal Required")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-md hover:scale-[1.02] active:scale-95 transition-all self-start sm:self-auto flex-shrink-0 cursor-pointer"
          >
            Renew Subscription
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Supply Chain Command Center</h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Omnichannel logistics dashboard, live telemetry metrics, and multi-tenant fulfillment control.
          </p>
        </div>

        {/* Controls: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Process Order</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-extrabold bg-white/5 border border-white/10 text-slate-300 hover:text-white px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-indigo-400" />
            <span>Add SKU</span>
          </button>

          <button 
            onClick={triggerRefresh}
            className="flex items-center gap-2 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 px-3.5 py-2.5 rounded-xl transition-all duration-300 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 4 Commercial Client Admin Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Inventory Volume */}
        <div 
          onClick={() => onNavigate("Inventory")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden cursor-pointer shadow-lg border border-white/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Inventory Stock</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-black/30">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{clientAdminMetrics.totalInventoryVolume.toLocaleString()}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-3 w-3" /> Units
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">Across {inventory.length} catalog lines</div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => onNavigate("Inventory")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden cursor-pointer shadow-lg border border-white/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Low Stock Warnings</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-black/30">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{clientAdminMetrics.lowStockCount}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              clientAdminMetrics.lowStockCount === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            }`}>
              {clientAdminMetrics.lowStockCount === 0 ? <CheckCircle className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {clientAdminMetrics.lowStockCount === 0 ? "Optimal" : `Reorder`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">Requires replenishment</div>
        </div>

        {/* Pending Orders */}
        <div 
          onClick={() => onNavigate("Orders")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden cursor-pointer shadow-lg border border-white/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Pending Courier Action</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-black/30">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{clientAdminMetrics.pendingOrdersCount}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-amber-500/10 text-amber-400">
              <Clock className="h-3 w-3" /> In Queue
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">Awaiting courier dispatch</div>
        </div>

        {/* Active Retailers */}
        <div 
          onClick={() => onNavigate("Retailers")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden cursor-pointer shadow-lg border border-white/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Active Dealer Network</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-black/30">
              <Store className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{clientAdminMetrics.activeRetailersCount}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-3 w-3" /> Active
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">Out of {retailers.length} total hubs</div>
        </div>

      </div>

      {/* Interactive Sales Chart */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-xl bg-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              Live Sales &amp; Order Revenue Velocity
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real order volumes and dollar values for tenant <code className="text-indigo-300">{activeTenantId || "CLI-101"}</code>
            </p>
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
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`৳ ${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Sales Revenue (৳)"
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

      {/* Freight Routes & Stock Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-400" />
                Live Freight Distribution Corridors
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status of delivery logistics</p>
            </div>
            <button 
              onClick={() => onNavigate("Route Tracking")} 
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              Expand Map <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          
          <div className="flex-1 w-full bg-slate-950/45 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center p-4">
            <svg className="w-full h-full max-h-[300px]" viewBox="0 0 500 250" fill="none">
              <path d="M 60,180 Q 150,90 280,110 T 440,70" stroke="rgba(99, 102, 241, 0.6)" strokeWidth="2" strokeLinecap="round" className="animate-dash-line" />
              <path d="M 60,180 Q 180,210 320,160 T 420,180" stroke="rgba(236, 72, 153, 0.5)" strokeWidth="2" strokeLinecap="round" className="animate-dash-line" />
              <circle cx="60" cy="180" r="8" fill="#4f46e5" />
              <text x="50" y="200" fill="#a5b4fc" fontSize="8" fontWeight="bold">Central Hub</text>
              <circle cx="440" cy="70" r="6" fill="#10b981" />
              <text x="410" y="60" fill="#34d399" fontSize="8" fontWeight="bold">Walmart East</text>
            </svg>
          </div>
        </div>

        {/* Stock Alert Summary */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-rose-400" />
                Inventory Alerts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Critical stock reorder warnings</p>
            </div>
            <button 
              onClick={() => onNavigate("Inventory")}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              Manage Stock <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {alertItems.length > 0 ? (
              alertItems.map((item) => (
                <div key={item.sku} className="p-3 border border-rose-500/20 bg-rose-500/10 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase">{item.sku}</h3>
                    <p className="text-xs font-semibold text-slate-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-rose-400 mt-0.5">Stock: {item.qty} units | Min: {item.minRequired}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                <CheckCircle className="h-8 w-8 text-emerald-500/40 mb-2" />
                <p className="text-xs font-bold">All stock levels optimal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-indigo-400" />
          Recent Activity &amp; Telemetry Feed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {activityLogs.map(log => (
            <div key={log.id} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-400 text-[10px]">
                <span className="uppercase font-bold text-indigo-400">{log.type}</span>
                <span>{log.timestamp}</span>
              </div>
              <h3 className="font-bold text-white">{log.title}</h3>
              <p className="text-slate-400 text-[11px] leading-tight">{log.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
