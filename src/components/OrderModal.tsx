"use client";

import { useState, useMemo } from "react";
import { X, Plus, Trash2, AlertCircle, ShoppingCart, Sparkles } from "lucide-react";

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

interface Retailer {
  id: string;
  name: string;
  location: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  retailers: Retailer[];
  inventory: InventoryItem[];
  onCreateOrder: (retailerName: string, itemsList: { sku: string; qty: number }[]) => void;
}

interface OrderLine {
  id: string;
  sku: string;
  qty: number;
}

export default function OrderModal({ isOpen, onClose, retailers, inventory, onCreateOrder }: OrderModalProps) {
  const [selectedRetailer, setSelectedRetailer] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([
    { id: "1", sku: "", qty: 1 }
  ]);
  const [error, setError] = useState("");

  // Add dynamic product row
  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), sku: "", qty: 1 }]);
  };

  // Remove product row
  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  // Update product row fields
  const updateLine = (id: string, field: "sku" | "qty", value: string | number) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        return {
          ...line,
          [field]: value
        };
      }
      return line;
    }));
  };

  // Pre-calculate line validations & prices
  const lineDetails = useMemo(() => {
    return lines.map(line => {
      const product = inventory.find(item => item.sku === line.sku);
      const isOverStock = product ? line.qty > product.qty : false;
      const total = product ? line.qty * product.unitPrice : 0;
      return {
        ...line,
        product,
        isOverStock,
        total
      };
    });
  }, [lines, inventory]);

  // Auto-calculated totals
  const totals = useMemo(() => {
    let price = 0;
    let itemsCount = 0;
    let hasStockErrors = false;
    let hasEmptySkus = false;

    lineDetails.forEach(line => {
      price += line.total;
      itemsCount += line.qty;
      if (line.isOverStock) hasStockErrors = true;
      if (!line.sku) hasEmptySkus = true;
    });

    return {
      price,
      itemsCount,
      hasStockErrors,
      hasEmptySkus
    };
  }, [lineDetails]);

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRetailer) {
      setError("Please select a retailer");
      return;
    }
    if (totals.hasEmptySkus) {
      setError("Please select a product for all lines");
      return;
    }
    if (totals.hasStockErrors) {
      setError("Cannot submit order: Some lines exceed available inventory levels!");
      return;
    }
    if (lines.length === 0) {
      setError("Order must contain at least one product line");
      return;
    }

    const itemsPayload = lines.map(l => ({ sku: l.sku, qty: l.qty }));
    onCreateOrder(selectedRetailer, itemsPayload);

    // Reset states and close
    setSelectedRetailer("");
    setLines([{ id: "1", sku: "", qty: 1 }]);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-white/15 shadow-2xl shadow-black/80 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Glowing detail overlay */}
        <div className="absolute -top-10 -right-10 h-32 w-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-950/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 animate-pulse">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <h2 className="font-extrabold text-white text-lg tracking-tight flex items-center gap-1.5">
              Sales Order Processing Terminal
              <span className="text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/35">SR Panel</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Error alerts */}
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Retailer Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Retailer Account Name</label>
              <select
                value={selectedRetailer}
                onChange={(e) => {
                  setSelectedRetailer(e.target.value);
                  setError("");
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
              >
                <option value="">Select corporate retailer partner...</option>
                {retailers.map(r => (
                  <option key={r.id} value={r.name} className="bg-slate-950">{r.name} ({r.location})</option>
                ))}
              </select>
            </div>

            {/* Product Lines Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Line Items</label>
                <button
                  type="button"
                  onClick={addLine}
                  className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item Line
                </button>
              </div>

              {/* Lines list container */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {lineDetails.map((line) => (
                  <div key={line.id} className="p-3.5 bg-slate-900/40 border border-white/5 rounded-xl space-y-2.5 relative group">
                    <div className="flex items-start gap-3">
                      {/* Product Selector */}
                      <div className="flex-1 space-y-1.5">
                        <select
                          value={line.sku}
                          onChange={(e) => {
                            updateLine(line.id, "sku", e.target.value);
                            setError("");
                          }}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Select product...</option>
                          {inventory.map(item => (
                            <option key={item.sku} value={item.sku} className="bg-slate-950">
                              {item.name} - SKU: {item.sku} (৳ {item.unitPrice.toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity Input */}
                      <div className="w-28 space-y-1.5">
                        <input
                          type="number"
                          min="1"
                          value={line.qty}
                          onChange={(e) => {
                            updateLine(line.id, "qty", parseInt(e.target.value) || 0);
                            setError("");
                          }}
                          className={`w-full px-3 py-2 text-xs bg-slate-950 border rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 ${
                            line.isOverStock ? "border-rose-500 text-rose-300 font-bold" : "border-white/10"
                          }`}
                        />
                      </div>

                      {/* Remove Line Button */}
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="mt-1.5 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Stock verification alert indicators */}
                    {line.product && (
                      <div className="flex items-center justify-between text-[10px] font-semibold border-t border-white/5 pt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">Unit Price:</span>
                          <span className="text-slate-350">৳ {line.product.unitPrice.toFixed(2)}</span>
                          <span className="text-slate-700">|</span>
                          <span className="text-slate-500">Available:</span>
                          <span className={`font-bold ${
                            line.product.qty === 0 
                              ? "text-rose-400" 
                              : line.product.qty <= line.product.minRequired 
                              ? "text-amber-400" 
                              : "text-emerald-400"
                          }`}>
                            {line.product.qty} units
                          </span>
                        </div>

                        {/* Calculated total / Error display */}
                        <div className="text-right">
                          {line.isOverStock ? (
                            <span className="text-rose-400 font-bold flex items-center gap-0.5">
                              <AlertCircle className="h-3 w-3 inline" />
                              Exceeds Stock! Max: {line.product.qty}
                            </span>
                          ) : (
                            <span>Subtotal: <strong className="text-indigo-400">৳ {line.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer & Billing Totals */}
          <div className="border-t border-white/10 pt-4 mt-6">
            <div className="flex items-center justify-between bg-slate-950/45 p-4 rounded-xl border border-white/5 mb-4">
              <div className="text-left text-xs font-semibold text-slate-400 space-y-0.5">
                <p>Line Items Total Count: <strong className="text-slate-200">{lines.length} lines</strong></p>
                <p>Total Ordered Quantity: <strong className="text-slate-200">{totals.itemsCount} units</strong></p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Total Billing Price</span>
                <span className="text-2xl font-black text-white">৳ {totals.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={totals.hasStockErrors || totals.hasEmptySkus || !selectedRetailer}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Process Order
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
