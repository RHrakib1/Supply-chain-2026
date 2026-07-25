"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Download
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

interface InventoryViewProps {
  inventory: InventoryItem[];
  searchQuery: string;
  onRestock: (sku: string) => void;
  onOpenAddSkuModal: () => void;
}

export default function InventoryView({ inventory, searchQuery, onRestock, onOpenAddSkuModal }: InventoryViewProps) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // useMemo to dynamically search and filter rows in real-time
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      // 1. Search Query Match
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Status Match
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      
      // 3. Category Match
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [inventory, searchQuery, statusFilter, categoryFilter]);

  // Aggregate Stats (Real-Time)
  const totalSkuCount = inventory.length;
  const totalStockQuantity = useMemo(() => {
    return inventory.reduce((acc, curr) => acc + curr.qty, 0);
  }, [inventory]);
  
  const totalAssetValue = useMemo(() => {
    return inventory.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
  }, [inventory]);
  
  const alertCount = useMemo(() => {
    return inventory.filter(item => item.status !== "In Stock").length;
  }, [inventory]);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(inventory.map(item => item.category)))];
  }, [inventory]);

  const getStatusStyle = (status: "In Stock" | "Low Stock" | "Out of Stock") => {
    switch (status) {
      case "In Stock":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "Low Stock":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "Out of Stock":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
    }
  };

  const getStatusIcon = (status: "In Stock" | "Low Stock" | "Out of Stock") => {
    switch (status) {
      case "In Stock": return CheckCircle2;
      case "Low Stock": return AlertTriangle;
      case "Out of Stock": return XCircle;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Inventory Logistics</h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Track, query, and replenish critical supplies across global fulfillment hubs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all duration-300">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          {/* Add SKU Button */}
          <button 
            onClick={onOpenAddSkuModal}
            className="flex items-center gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="h-4 w-4" />
            Add New SKU
          </button>
        </div>
      </div>

      {/* Aggregate Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-400">Total Unique SKUs</span>
          <span className="block text-2xl font-extrabold text-white mt-1">{totalSkuCount}</span>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-400">Total Stock Quantity</span>
          <span className="block text-2xl font-extrabold text-white mt-1">
            {totalStockQuantity.toLocaleString()}
          </span>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs font-medium text-slate-400">Total Asset Value</span>
          <span className="block text-2xl font-extrabold text-indigo-400 mt-1">
            ${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="glass-panel p-4 rounded-xl border-l-4 border-rose-500">
          <span className="text-xs font-medium text-slate-400">Critical Alerts</span>
          <span className="block text-2xl font-extrabold text-rose-400 mt-1">{alertCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Real-time search indicator status */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Search className="h-4 w-4 text-slate-500" />
          {searchQuery ? (
            <span>Filtering by query: &quot;<strong className="text-indigo-400">{searchQuery}</strong>&quot; ({filteredItems.length} results)</span>
          ) : (
            <span>Type in navbar search to filter items</span>
          )}
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 px-3 py-1.5 rounded-xl">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 border-none outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-950">All Statuses</option>
              <option value="In Stock" className="bg-slate-950">In Stock</option>
              <option value="Low Stock" className="bg-slate-950">Low Stock</option>
              <option value="Out of Stock" className="bg-slate-950">Out of Stock</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 border-none outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-950">{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory SKU Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/35">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/20">
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6">SKU</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Warehouse Location</th>
                <th className="py-4 px-6">Current Stock</th>
                <th className="py-4 px-6">Unit Price</th>
                <th className="py-4 px-6">Total Value</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const StatusIcon = getStatusIcon(item.status);
                  return (
                    <tr key={item.sku} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </td>
                      <td className="py-4 px-6 font-bold text-white tracking-wider text-xs">
                        {item.sku}
                      </td>
                      <td className="py-4 px-6 text-slate-400">{item.category}</td>
                      <td className="py-4 px-6 text-slate-300">{item.location}</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-200">{item.qty}</span>
                        <span className="text-[10px] text-slate-500 block">Min req: {item.minRequired}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-4 px-6 text-slate-200 font-medium">
                        ${(item.qty * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(item.status)}`}>
                          <StatusIcon className="h-3 w-3" />
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onRestock(item.sku)}
                            className="text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500 hover:text-white border border-indigo-500/25 text-indigo-400 px-3 py-1.5 rounded-lg transition-all duration-300"
                          >
                            Restock (+50)
                          </button>
                          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    No SKU items found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
