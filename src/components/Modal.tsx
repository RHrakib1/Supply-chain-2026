"use client";

import { useState } from "react";
import { X, Plus, Sparkles } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSku: (item: {
    sku: string;
    name: string;
    category: string;
    location: string;
    qty: number;
    minRequired: number;
    unitPrice: number;
  }) => void;
}

export default function Modal({ isOpen, onClose, onAddSku }: ModalProps) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hardware");
  const [location, setLocation] = useState("Warehouse A");
  const [qty, setQty] = useState<number>(0);
  const [minRequired, setMinRequired] = useState<number>(10);
  const [unitPrice, setUnitPrice] = useState<number>(0.0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Validation
    const newErrors: Record<string, string> = {};
    if (!sku.trim()) newErrors.sku = "SKU code is required";
    if (!name.trim()) newErrors.name = "Product name is required";
    if (qty < 0) newErrors.qty = "Initial quantity cannot be negative";
    if (minRequired < 0) newErrors.minRequired = "Alert level cannot be negative";
    if (unitPrice < 0) newErrors.unitPrice = "Unit price cannot be negative";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddSku({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      location: `${location} (Aisle 1)`, // Mock specific aisle
      qty,
      minRequired,
      unitPrice
    });

    // Reset and close
    setSku("");
    setName("");
    setCategory("Hardware");
    setLocation("Warehouse A");
    setQty(0);
    setMinRequired(10);
    setUnitPrice(0.0);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Card container */}
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-white/15 shadow-2xl shadow-black/80 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Decorative corner glow */}
        <div className="absolute -top-10 -right-10 h-32 w-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="font-extrabold text-white text-lg tracking-tight">Log Restock & Add New SKU</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* SKU Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">SKU Code</label>
              <input
                type="text"
                placeholder="e.g. SKU-4912"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-slate-900/60 border rounded-xl text-slate-250 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${
                  errors.sku ? "border-rose-500" : "border-white/10 focus:border-indigo-500"
                }`}
              />
              {errors.sku && <p className="text-[10px] text-rose-400 font-bold">{errors.sku}</p>}
            </div>

            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Hardware" className="bg-slate-950">Hardware</option>
                <option value="Fluid Power" className="bg-slate-950">Fluid Power</option>
                <option value="Electronics" className="bg-slate-950">Electronics</option>
                <option value="Electrical" className="bg-slate-950">Electrical</option>
                <option value="Telecom" className="bg-slate-950">Telecom</option>
                <option value="Chemicals" className="bg-slate-950">Chemicals</option>
              </select>
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Precision Coupler Springs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-slate-900/60 border rounded-xl text-slate-250 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${
                errors.name ? "border-rose-500" : "border-white/10 focus:border-indigo-500"
              }`}
            />
            {errors.name && <p className="text-[10px] text-rose-400 font-bold">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Warehouse Location */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warehouse Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Warehouse A" className="bg-slate-950">Warehouse A</option>
                <option value="Warehouse B" className="bg-slate-950">Warehouse B</option>
                <option value="Warehouse C" className="bg-slate-950">Warehouse C</option>
              </select>
            </div>

            {/* Unit Price */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={unitPrice || ""}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl text-slate-250 placeholder-slate-500 focus:outline-none focus:border-indigo-500`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Quantity</label>
              <input
                type="number"
                placeholder="0"
                value={qty || ""}
                onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl text-slate-250 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Alert level */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Min Alert Level</label>
              <input
                type="number"
                placeholder="10"
                value={minRequired || ""}
                onChange={(e) => setMinRequired(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl text-slate-250 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="h-3.5 w-3.5" />
              Add SKU Item
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
