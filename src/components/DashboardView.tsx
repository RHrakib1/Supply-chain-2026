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
  Layers,
  Truck,
  ShoppingBag
} from "lucide-react";
import { 
  ComposedChart, 
  Bar, 
  Line, 
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
    setIsModalOpen,
    dateRange,
    setDateRange
  } = useDashboard();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeClient = clients[0] || { name: "Apex Logistics", plan: "Professional" };
  const remainingDays = 5;

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 850);
  };

  // Timeframe Multiplier based on Master Date Range Filter
  const timeframeMultiplier = useMemo(() => {
    if (dateRange === "7d") return 0.35;
    if (dateRange === "custom") return 1.5;
    return 1.0;
  }, [dateRange]);

  // --- CLIENT ADMIN METRICS ---
  const clientAdminMetrics = useMemo(() => {
    const totalInventoryVolume = inventory.reduce((sum, item) => sum + item.qty, 0);
    const lowStockCount = inventory.filter(item => item.qty <= item.minRequired || item.status !== "In Stock").length;
    const pendingOrdersCount = orders.filter(o => o.status === "Pending" || o.status === "Processing").length;
    const activeRetailersCount = retailers.filter(r => r.status === "Active").length;
    const baseRevenue = orders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0);
    const totalRevenue = Math.round(baseRevenue * timeframeMultiplier);
    const totalOrdersCount = Math.round((orders.length > 0 ? orders.length : 142) * timeframeMultiplier);

    return {
      totalInventoryVolume,
      lowStockCount,
      pendingOrdersCount,
      activeRetailersCount,
      totalRevenue,
      totalOrdersCount
    };
  }, [inventory, orders, retailers, timeframeMultiplier]);

  // --- SUPER ADMIN SAAS METRICS ---
  const saasMetrics = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === "Active").length;
    const totalMrr = clients.filter(c => c.status === "Active").reduce((sum, c) => sum + c.mrr, 0);
    const totalSeats = clients.reduce((sum, c) => sum + c.maxUsers, 0);
    return { totalClients, activeClients, totalMrr, totalSeats };
  }, [clients]);

  // --- DUAL TREND CHART DATA (Daily Order Volume & Sales Revenue in BDT) ---
  const orderTrendsData = useMemo(() => {
    const dateMap: Record<string, { date: string; revenue: number; ordersCount: number }> = {};
    
    orders.forEach(o => {
      const dateKey = o.date || new Date().toISOString().split("T")[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey, revenue: 0, ordersCount: 0 };
      }
      dateMap[dateKey].revenue += o.total * timeframeMultiplier;
      dateMap[dateKey].ordersCount += 1;
    });

    // Fill sample daily data points if orders are few
    if (Object.keys(dateMap).length < 5) {
      const dates = ["2026-07-20", "2026-07-21", "2026-07-22", "2026-07-23", "2026-07-24", "2026-07-25", "2026-07-26"];
      dates.forEach((d, idx) => {
        if (!dateMap[d]) {
          dateMap[d] = {
            date: d,
            revenue: Math.round((28000 + idx * 7500) * timeframeMultiplier),
            ordersCount: Math.round((12 + idx * 3) * timeframeMultiplier)
          };
        }
      });
    }

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
  }, [orders, timeframeMultiplier]);

  // --- AVERAGE BASKET ANALYSIS METRICS ---
  const basketAnalysis = useMemo(() => {
    const totalOrders = clientAdminMetrics.totalOrdersCount || 1;
    const totalUnitsSold = orders.reduce((sum, o) => sum + (o.qty || 8), 0) * timeframeMultiplier;
    const avgUnitsPerOrder = Number((totalUnitsSold / totalOrders).toFixed(1));
    const avgOrderValue = Math.round(clientAdminMetrics.totalRevenue / totalOrders);

    const smallBasket = Math.round(totalOrders * 0.24);
    const mediumBasket = Math.round(totalOrders * 0.54);
    const bulkBasket = Math.round(totalOrders * 0.22);

    return {
      avgUnitsPerOrder,
      avgOrderValue,
      smallBasket,
      mediumBasket,
      bulkBasket
    };
  }, [orders, clientAdminMetrics, timeframeMultiplier]);

  // --- FULFILLMENT BREAKDOWN METRICS ---
  const fulfillmentBreakdown = useMemo(() => {
    const total = orders.length || 1;
    const pending = orders.filter(o => o.status === "Pending").length;
    const processing = orders.filter(o => o.status === "Processing" || o.status === "In Transit").length;
    const delivered = orders.filter(o => o.status === "Delivered").length;
    const cancelled = orders.filter(o => o.status === "Cancelled").length;

    const pPending = Math.round((pending / total) * 100);
    const pProcessing = Math.round((processing / total) * 100);
    const pDelivered = Math.round((delivered / total) * 100);
    const pCancelled = Math.round((cancelled / total) * 100);

    return {
      pending,
      processing,
      delivered,
      cancelled,
      pPending,
      pProcessing,
      pDelivered,
      pCancelled,
      total
    };
  }, [orders]);

  const alertItems = useMemo(() => {
    return inventory
      .filter(item => item.qty <= item.minRequired || item.status !== "In Stock")
      .slice(0, 4);
  }, [inventory]);

  // =========================================================================
  // VIEW 1: SUPER ADMIN SAAS GROWTH COMMAND CENTER
  // =========================================================================
  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        {/* Super Admin Welcome Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 shadow-2xl relative overflow-hidden text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-2">
                <Crown className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>SaaS Governance & Executive Command Hub</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                LogiLink Platform Control Center
              </h1>
              <p className="text-slate-400 mt-2 text-xs sm:text-sm max-w-2xl">
                Global multi-tenant platform metrics, MRR revenue growth analytics, and tenant business provisioning.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate("Analytics")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-xs hover:bg-amber-500/20 transition-all cursor-pointer"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>SaaS Monthly Revenue</span>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">৳ {saasMetrics.totalMrr.toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-500">/mo</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-400">Active subscription MRR</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>Active Tenant Clients</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{saasMetrics.totalClients}</span>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{saasMetrics.activeClients} Active</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-400">Provisioned SaaS businesses</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>Provisioned Seats</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{saasMetrics.totalSeats} Seats</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-400">Multi-tenant team capacity</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>System Health</span>
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-500">99.98%</span>
              <span className="text-xs font-bold text-emerald-500">Uptime</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-400">Supabase live telemetry</div>
          </div>
        </div>

        {/* Tenant Table */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            <span>Active SaaS Client Tenants</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider bg-slate-100/50 dark:bg-slate-950/30">
                  <th className="py-3 px-4">Tenant ID & Name</th>
                  <th className="py-3 px-4">Owner Email</th>
                  <th className="py-3 px-4">Subscription Plan</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">MRR (BDT)</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono">{c.id} • {c.name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.ownerEmail}</td>
                    <td className="py-3 px-4 text-amber-500 font-extrabold">{c.plan}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{c.activeUsers} / {c.maxUsers}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-500">৳ {c.mrr.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black">
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
  // VIEW 2: WAREHOUSE MANAGER OPERATIONAL VIEW
  // =========================================================================
  if (userRole === "warehouse") {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-950 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                <Layers className="h-4 w-4" />
                <span>Warehouse Logistics Station</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1">Pack & Stock Fulfillment Queue</h1>
              <p className="text-xs text-slate-400 mt-1">Tenant ID: {activeTenantId || "CLI-101"} • Warehouse Operations</p>
            </div>

            <button
              onClick={() => onNavigate("Inventory")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              <Package className="h-4 w-4" />
              <span>Full Inventory Table</span>
            </button>
          </div>
        </div>

        {/* Warehouse Operational Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Pending Dispatch Orders</span>
            <span className="text-3xl font-black text-amber-500 dark:text-amber-300 mt-2 block">{clientAdminMetrics.pendingOrdersCount}</span>
            <p className="text-xs text-slate-400 mt-1">Awaiting packing & invoice attachment</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Low Stock SKU Warnings</span>
            <span className="text-3xl font-black text-rose-500 dark:text-rose-400 mt-2 block">{clientAdminMetrics.lowStockCount}</span>
            <p className="text-xs text-slate-400 mt-1">Requires immediate supplier purchase order</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Active Stock Catalog</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{inventory.length} SKUs</span>
            <p className="text-xs text-slate-400 mt-1">{clientAdminMetrics.totalInventoryVolume.toLocaleString()} total units</p>
          </div>
        </div>

        {/* Low Stock Items List */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-rose-500" />
            <span>Low Stock Reorder Alerts</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertItems.map(item => (
              <div key={item.sku} className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.sku}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{item.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.qty} | Safety Min: {item.minRequired}</p>
                </div>
                <button
                  onClick={onOpenRestockModal}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md cursor-pointer"
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
  // VIEW 3: RETAILER / WHOLESALER PORTAL
  // =========================================================================
  if (userRole === "retailer") {
    const retailerOrders = orders.slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-950 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                <Store className="h-4 w-4" />
                <span>B2B Retailer Order Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1">Purchasing & Credit Dashboard</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Purchased Volume</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">৳ {clientAdminMetrics.totalRevenue.toLocaleString()}</span>
            <p className="text-xs text-emerald-500 font-bold mt-1">Active Partnership Account</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Assigned Credit Limit</span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2 block">৳ 1,50,000</span>
            <p className="text-xs text-slate-400 mt-1">Net 30 Payment Terms</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Active Orders in Transit</span>
            <span className="text-3xl font-black text-blue-500 dark:text-blue-400 mt-2 block">
              {orders.filter(o => o.status === "In Transit").length}
            </span>
            <p className="text-xs text-slate-400 mt-1">Steadfast / Pathao Telemetry</p>
          </div>
        </div>

        {/* Retailer Recent Orders */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-500" />
            <span>My Recent Purchase Orders</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider bg-slate-100/50 dark:bg-slate-950/30">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Courier Carrier</th>
                  <th className="py-3 px-4 text-right">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {retailerOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono">{o.id} <span className="block text-[10px] text-slate-400">{o.date}</span></td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-200">{o.items}</td>
                    <td className="py-3 px-4 font-black text-indigo-600 dark:text-indigo-400">৳ {o.total.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{o.carrier} ({o.trackingNum})</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 font-bold">
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
  // VIEW 4: DEFAULT CLIENT ADMIN COMMERCIAL COMMAND CENTER (NUPORT LEVEL)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Expiry Warning Banner */}
      {remainingDays <= 7 && (
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex-shrink-0">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 dark:text-amber-300">
                Subscription Expiry Warning
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
                Your <strong className="text-slate-900 dark:text-white">{activeClient.plan || "Professional"} Plan</strong> subscription expires in <strong className="text-amber-500 dark:text-amber-400 font-bold">{remainingDays} days</strong>.
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

      {/* Top Header & Global Master Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Executive Operations Command</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase">
              Nuport Dense UI
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
            Omnichannel logistics telemetry, high-density metric cards, and B2B fulfillment control.
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Master Date Range Filter Buttons */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 rounded-xl text-xs">
            <button
              onClick={() => setDateRange("7d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRange === "7d"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange("30d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRange === "30d"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange("custom")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRange === "custom"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Custom
            </button>
          </div>

          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Process Order</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-extrabold bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-500" />
            <span>Add SKU</span>
          </button>

          <button 
            onClick={triggerRefresh}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/10 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. COMPACT DENSE DUAL-METRIC CARDS (NUPORT ENTERPRISE LEVEL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Dual Card 1: Order Count vs Sales Amount (BDT) */}
        <div 
          onClick={() => onNavigate("Orders")}
          className="glass-panel glass-panel-hover rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm border border-slate-200 dark:border-white/10 relative group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5 text-indigo-500" />
              Order Volume & Revenue
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              Dual Metric
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Order Count</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{clientAdminMetrics.totalOrdersCount}</span>
              <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="h-2.5 w-2.5" /> +14.2%
              </div>
            </div>

            <div className="border-l border-slate-200 dark:border-white/10 pl-2">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Sales Amount</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tight">৳ {(clientAdminMetrics.totalRevenue / 1000).toFixed(0)}k</span>
              <div className="text-[10px] font-bold text-indigo-500 flex items-center gap-0.5 mt-0.5">
                BDT Value
              </div>
            </div>
          </div>
        </div>

        {/* Dual Card 2: SKUs in Stock vs Total Inventory Volume */}
        <div 
          onClick={() => onNavigate("Inventory")}
          className="glass-panel glass-panel-hover rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm border border-slate-200 dark:border-white/10 relative group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-blue-500" />
              Stock SKUs & Volume
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Inventory
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Catalog SKUs</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{inventory.length} Lines</span>
              <div className={`text-[10px] font-bold flex items-center gap-0.5 mt-0.5 ${
                clientAdminMetrics.lowStockCount > 0 ? "text-rose-500" : "text-emerald-500"
              }`}>
                {clientAdminMetrics.lowStockCount} Reorders
              </div>
            </div>

            <div className="border-l border-slate-200 dark:border-white/10 pl-2">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Total Volume</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400 tracking-tight">
                {clientAdminMetrics.totalInventoryVolume.toLocaleString()}
              </span>
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 mt-0.5">
                Units On-Hand
              </div>
            </div>
          </div>
        </div>

        {/* Dual Card 3: Active Dealers vs Credit Line */}
        <div 
          onClick={() => onNavigate("Retailers")}
          className="glass-panel glass-panel-hover rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm border border-slate-200 dark:border-white/10 relative group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-emerald-500" />
              Dealer CRM & Credit
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Partners
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Active Network</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{clientAdminMetrics.activeRetailersCount} Hubs</span>
              <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                98.1% Active
              </div>
            </div>

            <div className="border-l border-slate-200 dark:border-white/10 pl-2">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Credit Sanctioned</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">৳ 12.5L</span>
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 mt-0.5">
                Net 30 Terms
              </div>
            </div>
          </div>
        </div>

        {/* Dual Card 4: Fulfillment Efficiency & Lead Time */}
        <div 
          onClick={() => onNavigate("Orders")}
          className="glass-panel glass-panel-hover rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm border border-slate-200 dark:border-white/10 relative group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-purple-500" />
              Fulfillment SLA
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
              Courier SLA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Fulfillment</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">96.4%</span>
              <div className="text-[10px] font-bold text-purple-500 flex items-center gap-0.5 mt-0.5">
                SLA Met
              </div>
            </div>

            <div className="border-l border-slate-200 dark:border-white/10 pl-2">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">On-Time Dispatch</span>
              <span className="text-lg font-black text-purple-600 dark:text-purple-400 tracking-tight">98.1%</span>
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 mt-0.5">
                1.2d Avg Lead
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* INTERACTIVE DUAL-TREND CHART (ORDER VOLUME & SALES REVENUE TREND) */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm bg-white dark:bg-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-indigo-500" />
              Dual Velocity Trend: Daily Order Volume & Revenue (BDT)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily order counts (Bars) synchronized with gross sales revenue in BDT (Line) over {dateRange === "7d" ? "last 7 days" : "last 30 days"}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Revenue (BDT)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
              <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" /> Orders Volume
            </span>
          </div>
        </div>

        {/* Chart with Fixed Bound (Zero CLS) */}
        <div className="w-full h-[300px] min-h-[300px]">
          {orderTrendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={orderTrendsData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="displayDate" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis 
                  yAxisId="left" 
                  stroke="#6366f1" 
                  tick={{ fontSize: 11 }} 
                  tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#06b6d4" 
                  tick={{ fontSize: 11 }} 
                  tickFormatter={(val) => `${val} ord`} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, name: any) => {
                    if (name === "Sales Revenue") return [`৳ ${Number(value).toLocaleString()} BDT`, "Revenue"];
                    return [`${value} Orders`, "Volume"];
                  }}
                />
                <Bar yAxisId="right" dataKey="ordersCount" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={20} name="Order Volume" />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="Sales Revenue" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No daily sales data available.
            </div>
          )}
        </div>
      </div>

      {/* 3. ADVANCED METRIC MODULES: AVERAGE BASKET ANALYSIS & FULFILLMENT BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Widget 1: Average Basket Analysis */}
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm bg-white dark:bg-slate-950/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-indigo-500" />
              Average Basket Analysis
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Cart Intelligence
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100/70 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Avg Units per Order</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">{basketAnalysis.avgUnitsPerOrder} Units</span>
              <span className="text-[10px] text-emerald-500 font-bold">+0.8 units vs last month</span>
            </div>
            <div className="border-l border-slate-200 dark:border-white/10 pl-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Average Order Value (AOV)</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">৳ {basketAnalysis.avgOrderValue.toLocaleString()} BDT</span>
              <span className="text-[10px] text-indigo-500 font-bold">Optimal Basket Size</span>
            </div>
          </div>

          {/* Basket Size Distribution Progress Bars */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Order Volume Mix by Basket Size:</span>
            
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                <span>Small Cart (1 - 3 Items)</span>
                <span>24% ({basketAnalysis.smallBasket} orders)</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "24%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                <span>Standard Cart (4 - 10 Items)</span>
                <span>54% ({basketAnalysis.mediumBasket} orders)</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "54%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                <span>Bulk Enterprise Cart (11+ Items)</span>
                <span>22% ({basketAnalysis.bulkBasket} orders)</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "22%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: Fulfillment Breakdown Card */}
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm bg-white dark:bg-slate-950/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-blue-500" />
              Fulfillment Status Breakdown
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Pipeline Status
            </span>
          </div>

          {/* Segmented Multi-Color Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Fulfillment Queue</span>
              <span>{fulfillmentBreakdown.total} Total Orders</span>
            </div>
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${fulfillmentBreakdown.pPending}%` }} title="Pending" />
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${fulfillmentBreakdown.pProcessing}%` }} title="In-Transit" />
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${fulfillmentBreakdown.pDelivered}%` }} title="Delivered" />
              <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${fulfillmentBreakdown.pCancelled}%` }} title="Returned / Cancelled" />
            </div>
          </div>

          {/* 4 Status Chips Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">Pending</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{fulfillmentBreakdown.pending} Orders</span>
              </div>
              <span className="text-xs font-black text-amber-500">{fulfillmentBreakdown.pPending}%</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 block">In-Transit</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{fulfillmentBreakdown.processing} Orders</span>
              </div>
              <span className="text-xs font-black text-indigo-500">{fulfillmentBreakdown.pProcessing}%</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Delivered</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{fulfillmentBreakdown.delivered} Orders</span>
              </div>
              <span className="text-xs font-black text-emerald-500">{fulfillmentBreakdown.pDelivered}%</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 block">Returned</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{fulfillmentBreakdown.cancelled} Orders</span>
              </div>
              <span className="text-xs font-black text-rose-500">{fulfillmentBreakdown.pCancelled}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Freight Routes & Stock Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex flex-col h-[360px] bg-white dark:bg-slate-950/40 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-indigo-500" />
                Live Freight Distribution Corridors
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time status of delivery logistics</p>
            </div>
            <button 
              onClick={() => onNavigate("Route Tracking")} 
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Expand Map <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          
          <div className="flex-1 w-full bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center p-4">
            <svg className="w-full h-full max-h-[260px]" viewBox="0 0 500 250" fill="none">
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
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex flex-col h-[360px] bg-white dark:bg-slate-950/40 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="h-4.5 w-4.5 text-rose-500" />
                Inventory Alerts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Critical stock reorder warnings</p>
            </div>
            <button 
              onClick={() => onNavigate("Inventory")}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage Stock <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {alertItems.length > 0 ? (
              alertItems.map((item) => (
                <div key={item.sku} className="p-3 border border-rose-500/20 bg-rose-500/10 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">{item.sku}</h3>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Stock: {item.qty} units | Min: {item.minRequired}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 uppercase">
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <CheckCircle className="h-8 w-8 text-emerald-500/40 mb-2" />
                <p className="text-xs font-bold">All stock levels optimal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-5 bg-white dark:bg-slate-950/40 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Activity className="h-4.5 w-4.5 text-indigo-500" />
          Recent Activity & Telemetry Feed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {activityLogs.map(log => (
            <div key={log.id} className="p-3 bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[10px]">
                <span className="uppercase font-bold text-indigo-600 dark:text-indigo-400">{log.type}</span>
                <span>{log.timestamp}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{log.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-tight">{log.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
