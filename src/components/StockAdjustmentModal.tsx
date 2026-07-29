"use client";

import React, { useState } from "react";
import { X, Plus, Minus, History, Package, Save, User } from "lucide-react";

export interface StockMovementLog {
  id: string;
  sku: string;
  changeQty: number;
  newQty: number;
  reason: string;
  timestamp: string;
  user: string;
}

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

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSaveAdjustment: (sku: string, adjustmentQty: number, reason: string) => void;
  movementLogs: StockMovementLog[];
}

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  item,
  onSaveAdjustment,
  movementLogs
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState<number>(10);
  const [reason, setReason] = useState<string>("Restock Delivery");
  const [customReason, setCustomReason] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"adjust" | "history">("adjust");

  if (!isOpen || !item) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQty = adjustmentType === "add" ? amount : -amount;
    const finalReason = reason === "Other" ? customReason || "Manual Audit Adjustment" : reason;

    if (amount <= 0) return;

    onSaveAdjustment(item.sku, finalQty, finalReason);
    onClose();
  };

  const itemLogs = movementLogs.filter(log => log.sku === item.sku);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-white/15 p-6 shadow-2xl bg-slate-950/95 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header & Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{item.name}</h2>
              <p className="text-xs text-slate-400 font-mono">SKU: {item.sku} • Location: {item.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-900 border border-white/10 rounded-xl">
              <button
                onClick={() => setActiveTab("adjust")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "adjust" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Stock Adjust
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === "history" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <History className="h-3 w-3" />
                <span>Logs ({itemLogs.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "adjust" ? (
          <form onSubmit={handleFormSubmit} className="space-y-5 pt-5 flex-1 overflow-y-auto">
            {/* Current Stock Snapshot Card */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">CURRENT IN-STOCK LEVEL</span>
                <span className="text-2xl font-black text-white">{item.qty} units</span>
                <span className="text-xs text-slate-400 block mt-0.5">Safety Threshold: {item.minRequired} units</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">NEW ESTIMATED LEVEL</span>
                <span className={`text-2xl font-black ${
                  adjustmentType === "add" ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {adjustmentType === "add" ? item.qty + amount : Math.max(0, item.qty - amount)} units
                </span>
              </div>
            </div>

            {/* Adjustment Type Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Adjustment Operation</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustmentType("add")}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    adjustmentType === "add"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md"
                      : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <Plus className="h-4 w-4 text-emerald-400" />
                  <span>Restock / Add Quantity</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustmentType("deduct")}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    adjustmentType === "deduct"
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-md"
                      : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <Minus className="h-4 w-4 text-rose-400" />
                  <span>Deduct / Write-off Stock</span>
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Quantity Amount</label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Reason Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Reason Log (Required for Audit)</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="Restock Delivery">Restock Delivery / Warehouse Receipt</option>
                <option value="Order Fulfillment">Order Fulfillment / Sales Dispatch</option>
                <option value="Damaged / Expired">Damaged / Expired Inventory Write-off</option>
                <option value="Audit Adjustment">Stock Take / Audit Count Adjustment</option>
                <option value="Customer Return">Customer Return / Restock</option>
                <option value="Other">Other Custom Reason</option>
              </select>

              {reason === "Other" && (
                <input
                  type="text"
                  placeholder="Specify custom audit reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-white/10 rounded-xl text-white mt-2"
                />
              )}
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-white/5 text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30"
              >
                <Save className="h-4 w-4" />
                <span>Save Stock Adjustment</span>
              </button>
            </div>
          </form>
        ) : (
          /* Movement History Log View */
          <div className="pt-4 space-y-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-4 w-4 text-indigo-400" />
              <span>SKU Audit Movement Log Trail</span>
            </h3>

            {itemLogs.length > 0 ? (
              <div className="space-y-3">
                {itemLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-900/60 border border-white/5 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={`font-black text-xs ${
                        log.changeQty > 0 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {log.changeQty > 0 ? `+${log.changeQty}` : log.changeQty} units (New Total: {log.newQty})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-300 font-semibold">{log.reason}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <User className="h-3 w-3" /> Logged by: {log.user}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs font-medium">
                No recent stock movement logs recorded for this SKU.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
