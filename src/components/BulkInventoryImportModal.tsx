"use client";

import React, { useState } from "react";
import { X, Upload, CheckCircle2, AlertCircle, Database } from "lucide-react";

export interface ParsedSKUItem {
  sku: string;
  name: string;
  category: string;
  location: string;
  qty: number;
  minRequired: number;
  costPrice: number;
  unitPrice: number;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Overstocked";
}

interface BulkInventoryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportItems: (items: ParsedSKUItem[]) => void;
}

export default function BulkInventoryImportModal({
  isOpen,
  onClose,
  onImportItems
}: BulkInventoryImportModalProps) {
  const [csvText, setCsvText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedSKUItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSampleTemplateLoad = () => {
    const sampleCSV = `SKU,Name,Category,Location,Quantity,MinRequired,CostPrice,UnitPrice
SKU-901,Industrial Solar Inverter 5KW,Electronics,Dhaka Hub - A1,45,10,32000,45000
SKU-902,High Torque Motor Belt,Automotive,Chittagong Depot - C2,120,30,850,1450
SKU-903,Synthetic Hydraulic Fluid 20L,Chemicals,Gazipur Hub - B4,15,20,2400,3800
SKU-904,Precision Ball Bearing 6204,Industrial,Khulna Depot - A3,300,50,180,350`;

    setCsvText(sampleCSV);
    parseCSVData(sampleCSV);
  };

  const parseCSVData = (text: string) => {
    try {
      setError(null);
      const lines = text.trim().split("\n");
      if (lines.length <= 1) {
        setError("CSV content must contain a header row and at least 1 data row.");
        setParsedItems([]);
        return;
      }

      const items: ParsedSKUItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(",").map(v => v.trim());

        const sku = values[0] || `SKU-${Date.now().toString().slice(-4)}-${i}`;
        const name = values[1] || `Imported Item ${i}`;
        const category = values[2] || "General";
        const location = values[3] || "Central Hub";
        const qty = parseInt(values[4]) || 10;
        const minRequired = parseInt(values[5]) || 5;
        const costPrice = parseFloat(values[6]) || 100;
        const unitPrice = parseFloat(values[7]) || 150;

        let status: "In Stock" | "Low Stock" | "Out of Stock" | "Overstocked" = "In Stock";
        if (qty === 0) status = "Out of Stock";
        else if (qty <= minRequired) status = "Low Stock";
        else if (qty >= minRequired * 3) status = "Overstocked";

        items.push({
          sku,
          name,
          category,
          location,
          qty,
          minRequired,
          costPrice,
          unitPrice,
          status
        });
      }

      setParsedItems(items);
    } catch {
      setError("Failed to parse CSV string. Please check formatting.");
      setParsedItems([]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value);
    parseCSVData(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvText(content);
        parseCSVData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCommitImport = () => {
    if (parsedItems.length === 0) return;
    onImportItems(parsedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-white/15 p-6 shadow-2xl bg-slate-950/95 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Bulk CSV Inventory Import Engine</h2>
              <p className="text-xs text-slate-400">Parse CSV / Excel catalog sheets and batch insert SKUs into Supabase</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white px-3.5 py-2 rounded-xl cursor-pointer transition-all w-fit">
              <Upload className="h-4 w-4" />
              <span>Upload .CSV File</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleSampleTemplateLoad}
              className="text-xs font-bold text-slate-400 hover:text-indigo-400 underline"
            >
              Load Sample Template CSV
            </button>
          </div>

          {/* CSV Text Input Area */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paste Raw CSV Data</label>
            <textarea
              rows={5}
              value={csvText}
              onChange={handleTextChange}
              placeholder="SKU,Name,Category,Location,Quantity,MinRequired,CostPrice,UnitPrice..."
              className="w-full p-3 text-xs font-mono bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Parsed Items Preview Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-emerald-400" />
                  <span>Parsed Preview ({parsedItems.length} valid SKUs ready for import)</span>
                </h3>
              </div>

              <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold bg-slate-900">
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Location</th>
                      <th className="p-2.5">Qty</th>
                      <th className="p-2.5">Selling Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-2.5 font-bold text-white font-mono">{item.sku}</td>
                        <td className="p-2.5 text-slate-200">{item.name}</td>
                        <td className="p-2.5 text-slate-400">{item.category}</td>
                        <td className="p-2.5 text-slate-400">{item.location}</td>
                        <td className="p-2.5 font-bold text-emerald-400">{item.qty}</td>
                        <td className="p-2.5 text-indigo-400 font-bold">৳ {item.unitPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-white/5 text-slate-400 hover:text-white rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleCommitImport}
            disabled={parsedItems.length === 0}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Commit Batch Import ({parsedItems.length} SKUs)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
