"use client";

import { useState, useMemo } from "react";
import { 
  DollarSign, 
  ShoppingCart, 
  Store, 
  AlertTriangle,
  TrendingUp, 
  Calendar,
  PieChart as PieIcon,
  BarChart3
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { useDashboard } from "@/context/DashboardContext";

// Static module-level constant – avoids react-hooks/exhaustive-deps warning
const SALES_BY_CATEGORY = [
  { name: "Hardware", value: 38500, color: "#6366f1" },
  { name: "Fluid Power", value: 24200, color: "#ec4899" },
  { name: "Electronics", value: 29800, color: "#3b82f6" },
  { name: "Suspension", value: 18400, color: "#10b981" },
  { name: "Electrical", value: 12500, color: "#f59e0b" },
  { name: "Chemicals", value: 8900, color: "#8b5cf6" },
];

interface AnalyticsViewProps {
  searchQuery: string;
}

export default function AnalyticsView({ searchQuery }: AnalyticsViewProps) {
  const { orders, retailers, inventory } = useDashboard();
  const [timeframe, setTimeframe] = useState("Last 30 Days");

  // Dynamic calculations from DashboardContext
  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return inventory.filter(i => i.status === "Low Stock" || i.status === "Out of Stock").length;
  }, [inventory]);

  const totalMonthlySalesValue = useMemo(() => {
    const ordersSum = orders.reduce((acc, curr) => acc + curr.total, 0);
    return 112000 + ordersSum;
  }, [orders]);

  // Mock historical data for Recharts Bar Chart (Monthly Revenue)
  const monthlyRevenueData = [
    { month: "Jan", revenue: 45000, target: 40000 },
    { month: "Feb", revenue: 52000, target: 45000 },
    { month: "Mar", revenue: 61000, target: 50000 },
    { month: "Apr", revenue: 58000, target: 52000 },
    { month: "May", revenue: 74000, target: 60000 },
    { month: "Jun", revenue: 89000, target: 70000 },
    { month: "Jul", revenue: totalMonthlySalesValue, target: 85000 },
  ];

  // Filtered sales by category based on navbar search query
  const salesByCategoryData = useMemo(() => {
    if (!searchQuery) return SALES_BY_CATEGORY;
    return SALES_BY_CATEGORY.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // KPI Summary Cards Metadata
  const kpiCards = [
    {
      title: "Total Monthly Sales",
      value: `৳ ${totalMonthlySalesValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+12.4%",
      isPositive: true,
      subtitle: "vs prior month",
      icon: DollarSign,
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    {
      title: "Active Orders",
      value: activeOrdersCount.toString(),
      change: `${orders.length} total`,
      isPositive: true,
      subtitle: "in fulfillment pipeline",
      icon: ShoppingCart,
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
    },
    {
      title: "Total Retailers",
      value: retailers.length.toString(),
      change: "+2 new",
      isPositive: true,
      subtitle: "active B2B accounts",
      icon: Store,
      iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    },
    {
      title: "Low Stock Alerts",
      value: lowStockCount.toString(),
      change: lowStockCount > 0 ? "Attention required" : "Optimal levels",
      isPositive: lowStockCount === 0,
      subtitle: "SKUs below minimum",
      icon: AlertTriangle,
      iconBg: lowStockCount > 0 
        ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse" 
        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Executive Analytics & Revenue
            <span className="text-xs font-bold uppercase bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/30">
              Recharts Analytics Engine
            </span>
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Track key performance indicators, revenue growth trajectories, and product category distribution.
          </p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 px-4 py-2 rounded-xl self-start md:self-auto shadow-md">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 border-none outline-none cursor-pointer"
          >
            <option value="Last 30 Days" className="bg-slate-950">Last 30 Days</option>
            <option value="Last 7 Days" className="bg-slate-950">Last 7 Days</option>
            <option value="Last Quarter" className="bg-slate-950">Last Quarter</option>
            <option value="Year to Date" className="bg-slate-950">Year to Date</option>
          </select>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-white/10 hover:border-indigo-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />
              <span className="text-xs font-semibold text-slate-400">{kpi.title}</span>
              
              <div className="mt-3 flex items-center justify-between">
                <span className="text-2xl font-extrabold text-white tracking-tight">{kpi.value}</span>
                <div className={`p-2.5 rounded-xl border ${kpi.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  kpi.isPositive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {kpi.isPositive ? <TrendingUp className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {kpi.change}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">{kpi.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bar Chart Card: Monthly Revenue (Takes 2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 p-6 flex flex-col justify-between shadow-xl shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
                Monthly Revenue Performance
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Historical revenue breakdown vs monthly target goals ($)</p>
            </div>
            <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              Recharts Bar
            </span>
          </div>

          <div className="w-full h-[320px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(val) => `৳ ${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#090d16", 
                    borderColor: "rgba(255, 255, 255, 0.15)", 
                    borderRadius: "12px", 
                    color: "#fff",
                    fontSize: "12px"
                  }} 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`৳ ${Number(value ?? 0).toLocaleString()}`, "Amount"]}
                />
                <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="Actual Revenue (৳)" />
                <Bar dataKey="target" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Target Revenue (৳)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Card: Sales by Product Category (Takes 1 Column) */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col justify-between shadow-xl shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <PieIcon className="h-5 w-5 text-pink-400" />
                Sales by Category
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Product category revenue allocation</p>
            </div>
            <span className="text-[10px] font-extrabold bg-pink-500/10 text-pink-400 px-2.5 py-1 rounded-lg border border-pink-500/20">
              Recharts Pie
            </span>
          </div>

          <div className="w-full h-[320px] relative flex items-center justify-center">
            {salesByCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {salesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#090d16", 
                      borderColor: "rgba(255, 255, 255, 0.15)", 
                      borderRadius: "12px", 
                      color: "#fff",
                      fontSize: "12px"
                    }} 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`$${Number(value ?? 0).toLocaleString()}`, "Sales"]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "8px", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-xs font-semibold text-center">No categories match search query.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
