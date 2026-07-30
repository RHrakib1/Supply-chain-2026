"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Trash2,
  AlertTriangle, 
  Download,
  Upload,
  Package,
  DollarSign,
  Building2,
  SlidersHorizontal,
  Archive,
  RefreshCw
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboard, InventoryItem as ContextInventoryItem } from "@/context/DashboardContext";
import StockAdjustmentModal, { StockMovementLog } from "./StockAdjustmentModal";
import BulkInventoryImportModal, { ParsedSKUItem } from "./BulkInventoryImportModal";

interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  location: string;
  qty: number;
  minRequired: number;
  unitPrice: number;
  costPrice?: number;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Overstocked";
}

interface InventoryViewProps {
  inventory: InventoryItem[];
  searchQuery: string;
  onRestock?: (sku: string) => void;
  onOpenAddSkuModal: () => void;
}

export default function InventoryView({ inventory, searchQuery, onOpenAddSkuModal }: InventoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "all_skus";

  const { isAdmin, activeTenantId, deleteSku, addToast, setInventory } = useDashboard();
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Stock Adjustment & Movement Logs Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<InventoryItem | null>(null);
  const [movementLogs, setMovementLogs] = useState<StockMovementLog[]>([
    {
      id: "LOG-101",
      sku: "SKU-1001",
      changeQty: 50,
      newQty: 150,
      reason: "Restock Delivery / Warehouse Receipt",
      timestamp: "2026-07-29 14:30",
      user: "Warehouse Manager"
    },
    {
      id: "LOG-102",
      sku: "SKU-1002",
      changeQty: -5,
      newQty: 12,
      reason: "Order Fulfillment / Sales Dispatch",
      timestamp: "2026-07-29 11:15",
      user: "Logistics Admin"
    }
  ]);

  // Bulk CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // --- DERIVED / ENRICHED INVENTORY ITEMS ---
  const enrichedInventory = useMemo(() => {
    return inventory.map(item => {
      let status: InventoryItem["status"] = item.status;
      if (item.qty === 0) status = "Out of Stock";
      else if (item.qty <= item.minRequired) status = "Low Stock";
      else if (item.qty >= item.minRequired * 3) status = "Overstocked";
      else status = "In Stock";

      const costPrice = item.costPrice || Math.round(item.unitPrice * 0.65);
      return {
        ...item,
        costPrice,
        status
      };
    });
  }, [inventory]);

  // --- FILTERED ITEMS ---
  const filteredItems = useMemo(() => {
    return enrichedInventory.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === "low_stock" || activeTab === "restock") matchesTab = item.status === "Low Stock";
      else if (activeTab === "out_of_stock") matchesTab = item.status === "Out of Stock";
      else if (statusFilter !== "All") matchesTab = item.status === statusFilter;

      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesTab && matchesCategory;
    });
  }, [enrichedInventory, searchQuery, statusFilter, categoryFilter, activeTab]);

  // --- COMMERCIAL KPI CALCULATIONS ---
  const totalSkuCount = enrichedInventory.length;

  const totalCostValuation = useMemo(() => {
    return enrichedInventory.reduce((acc, curr) => acc + (curr.qty * (curr.costPrice || curr.unitPrice * 0.65)), 0);
  }, [enrichedInventory]);

  const totalSalesValuation = useMemo(() => {
    return enrichedInventory.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
  }, [enrichedInventory]);

  const warningCount = useMemo(() => {
    return enrichedInventory.filter(item => item.status === "Low Stock" || item.status === "Out of Stock").length;
  }, [enrichedInventory]);

  const overstockedCount = useMemo(() => {
    return enrichedInventory.filter(item => item.status === "Overstocked").length;
  }, [enrichedInventory]);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(enrichedInventory.map(item => item.category)))];
  }, [enrichedInventory]);

  // --- HANDLERS ---
  const handleSaveStockAdjustment = (sku: string, adjustmentQty: number, reason: string) => {
    let updatedQty = 0;
    setInventory((prev: ContextInventoryItem[]) =>
      prev.map((item: ContextInventoryItem) => {
        if (item.sku === sku) {
          const newQty = Math.max(0, item.qty + adjustmentQty);
          updatedQty = newQty;
          let newStatus: InventoryItem["status"] = "In Stock";
          if (newQty === 0) newStatus = "Out of Stock";
          else if (newQty <= item.minRequired) newStatus = "Low Stock";
          else if (newQty >= item.minRequired * 3) newStatus = "Overstocked";

          return {
            ...item,
            qty: newQty,
            status: newStatus as ContextInventoryItem["status"]
          };
        }
        return item;
      })
    );

    // Record Stock Movement Log
    const newLog: StockMovementLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      sku,
      changeQty: adjustmentQty,
      newQty: updatedQty,
      reason,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      user: isAdmin ? "Client Admin" : "Warehouse Manager"
    };

    setMovementLogs(prev => [newLog, ...prev]);
    addToast("success", "Stock Level Adjusted", `Updated SKU ${sku} by ${adjustmentQty > 0 ? `+${adjustmentQty}` : adjustmentQty} units.`);
  };

  const handleBulkImportCommit = (importedItems: ParsedSKUItem[]) => {
    setInventory((prev: ContextInventoryItem[]) => {
      const map = new Map<string, ContextInventoryItem>();
      prev.forEach(i => map.set(i.sku, i));
      importedItems.forEach(i => map.set(i.sku, {
        sku: i.sku,
        name: i.name,
        category: i.category,
        location: i.location,
        qty: i.qty,
        minRequired: i.minRequired,
        unitPrice: i.unitPrice,
        status: i.status as ContextInventoryItem["status"]
      }));
      return Array.from(map.values());
    });
    addToast("success", "Bulk Import Completed", `Batch inserted ${importedItems.length} SKUs into inventory catalog.`);
  };

  const handleExportCSVReport = () => {
    const headers = "SKU,Product Name,Category,Warehouse Location,In-Stock Qty,Min Required,Cost Price (BDT),Selling Price (BDT),Stock Status\n";
    const rows = enrichedInventory.map(i => 
      `"${i.sku}","${i.name}","${i.category}","${i.location}",${i.qty},${i.minRequired},${i.costPrice || 0},${i.unitPrice},"${i.status}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LogiLink_Inventory_Valuation_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    addToast("info", "Report Exported", "Downloaded CSV Stock Valuation Report.");
  };

  const getStatusBadge = (status: InventoryItem["status"]) => {
    switch (status) {
      case "In Stock":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "Low Stock":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "Out of Stock":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "Overstocked":
        return "bg-purple-500/10 border-purple-500/30 text-purple-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 rounded-3xl border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-1">
            <Package className="h-4 w-4" />
            <span>Multi-Warehouse SKU & Stock Control Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Inventory Logistics & Predictive Stock
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Track multi-depot stock balances, audit movement logs, set predictive low-stock warnings, and bulk import SKU catalogs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-extrabold text-indigo-300">
            <Building2 className="h-4 w-4" />
            <span>Tenant: {activeTenantId || "CLI-101"}</span>
          </div>

          <button
            onClick={handleExportCSVReport}
            className="flex items-center gap-2 text-xs font-extrabold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 px-3.5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Valuation
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 text-xs font-extrabold bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white px-3.5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </button>

              <button 
                onClick={onOpenAddSkuModal}
                className="flex items-center gap-2 text-xs font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add New SKU
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Sub-Navigation Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/10 rounded-2xl overflow-x-auto custom-scrollbar text-xs font-bold">
        <button
          onClick={() => router.push("/inventory?tab=all_skus")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "all_skus" || activeTab === "all"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5"
          }`}
        >
          All Catalog SKUs ({enrichedInventory.length})
        </button>

        <button
          onClick={() => router.push("/inventory?tab=low_stock")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "low_stock" || activeTab === "restock"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5"
          }`}
        >
          Low Stock Reorders ({enrichedInventory.filter(i => i.status === "Low Stock").length})
        </button>

        <button
          onClick={() => router.push("/inventory?tab=out_of_stock")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "out_of_stock"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5"
          }`}
        >
          Out of Stock ({enrichedInventory.filter(i => i.status === "Out of Stock").length})
        </button>

        <button
          onClick={() => router.push("/inventory?tab=warehouse_locations")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "warehouse_locations" || activeTab === "warehouses"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5"
          }`}
        >
          Warehouse Locations Breakdown
        </button>
      </div>

      {/* 4 Commercial Stock Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* SKU Count */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Unique SKUs</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalSkuCount}</span>
            <span className="text-xs font-bold text-slate-400">active catalog lines</span>
          </div>
          <div className="mt-2 text-xs text-indigo-400 font-semibold">Multi-warehouse catalog</div>
        </div>

        {/* Asset Valuation */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Inventory Asset Valuation</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">৳ {totalSalesValuation.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Cost: ৳ {totalCostValuation.toLocaleString()}</span>
            <span className="text-emerald-400 font-bold">Margin: +{Math.round(((totalSalesValuation - totalCostValuation) / (totalCostValuation || 1)) * 100)}%</span>
          </div>
        </div>

        {/* Predictive Low Stock / Out of Stock Warnings */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Low / Out of Stock Warnings</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300">{warningCount}</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Requires Restock</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">Below safety threshold</div>
        </div>

        {/* Overstocked / Dead Stock Ratio */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Overstocked Ratio</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-300">{overstockedCount}</span>
            <span className="text-xs font-bold text-slate-400">
              ({totalSkuCount > 0 ? Math.round((overstockedCount / totalSkuCount) * 100) : 0}% of catalog)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">&gt; 3x safety capacity</div>
        </div>
      </div>

      {/* TAB SECTION: WAREHOUSE LOCATIONS BREAKDOWN */}
      {(activeTab === "warehouse_locations" || activeTab === "warehouses") && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-500" />
                Multi-Warehouse Hub Locations & Storage Capacity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time bin occupancy, storage utilization, and aisle inventory distribution across hubs</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              3 Active Fulfillment Centers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hub 1 */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Dhaka Central Hub</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Location: Tejgaon Industrial Zone</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  88% Capacity
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-bold">
                  <span>Occupied Pallets / Bins</span>
                  <span>1,420 / 1,600</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "88%" }} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Assigned SKUs:</span><strong className="text-slate-900 dark:text-white">412 SKUs</strong></div>
                <div className="flex justify-between"><span>Active Pickers:</span><strong className="text-indigo-500">14 Staff</strong></div>
              </div>
            </div>

            {/* Hub 2 */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Chittagong Port Depot</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Location: Agrabad Export Zone</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  64% Capacity
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-bold">
                  <span>Occupied Pallets / Bins</span>
                  <span>760 / 1,200</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "64%" }} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Assigned SKUs:</span><strong className="text-slate-900 dark:text-white">198 SKUs</strong></div>
                <div className="flex justify-between"><span>Active Pickers:</span><strong className="text-indigo-500">8 Staff</strong></div>
              </div>
            </div>

            {/* Hub 3 */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Bogura North Hub</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Location: Banani Bypass Area</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  42% Capacity
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-bold">
                  <span>Occupied Pallets / Bins</span>
                  <span>420 / 1,000</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Assigned SKUs:</span><strong className="text-slate-900 dark:text-white">115 SKUs</strong></div>
                <div className="flex justify-between"><span>Active Pickers:</span><strong className="text-indigo-500">5 Staff</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Dynamic Status Tabs Filter */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Search className="h-4 w-4 text-indigo-400" />
          {searchQuery ? (
            <span className="text-xs">Filtering inventory: &quot;<strong className="text-indigo-400">{searchQuery}</strong>&quot; ({filteredItems.length} SKUs)</span>
          ) : (
            <span className="text-xs text-slate-400">Search by SKU Code, Product Name, Category, or Hub Location</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex gap-1 overflow-x-auto p-1 bg-slate-900 rounded-xl border border-white/10">
            {["All", "Low Stock", "Out of Stock", "Overstocked", "In Stock"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === st 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-slate-950">{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory SKU Directory Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider bg-slate-950/30 text-[10px]">
                <th className="py-4 px-5">SKU Code &amp; Category</th>
                <th className="py-4 px-5">Product Name</th>
                <th className="py-4 px-5">Warehouse Location / Bin</th>
                <th className="py-4 px-5">Cost Price</th>
                <th className="py-4 px-5">Selling Price</th>
                <th className="py-4 px-5">In-Stock Quantity</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Stock Adjust &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.sku} className="group hover:bg-white/5 transition-all duration-200">
                    <td className="py-4 px-5 font-black text-white font-mono text-xs">
                      {item.sku}
                      <span className="block font-medium text-indigo-400 text-[10px] mt-0.5">{item.category}</span>
                    </td>

                    <td className="py-4 px-5 font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {item.name}
                    </td>

                    <td className="py-4 px-5 text-slate-300 font-semibold">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-slate-500" />
                        {item.location}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-slate-400 font-semibold">
                      ৳ {(item.costPrice || 0).toLocaleString()}
                    </td>

                    <td className="py-4 px-5 font-bold text-indigo-400">
                      ৳ {item.unitPrice.toLocaleString()}
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-black text-white text-sm">{item.qty} units</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Min Safety: {item.minRequired}</span>
                    </td>

                    <td className="py-4 px-5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick Stock Adjustment Trigger Modal */}
                        <button
                          onClick={() => {
                            setSelectedAdjustItem(item);
                            setIsAdjustModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20 text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          <SlidersHorizontal className="h-3 w-3" />
                          <span>Adjust Stock</span>
                        </button>

                        {/* Quick Restock +50 Button */}
                        <button
                          onClick={() => {
                            handleSaveStockAdjustment(item.sku, 50, "Restock Delivery");
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Quick Restock +50 units"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete SKU ${item.sku}?`)) {
                                deleteSku(item.sku);
                                addToast("info", "SKU Deleted", `Removed ${item.sku}`);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            title="Delete SKU"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-semibold text-xs">
                    No inventory SKUs found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        item={selectedAdjustItem}
        onSaveAdjustment={handleSaveStockAdjustment}
        movementLogs={movementLogs}
      />

      {/* Bulk CSV Import Modal */}
      <BulkInventoryImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportItems={handleBulkImportCommit}
      />
    </div>
  );
}
