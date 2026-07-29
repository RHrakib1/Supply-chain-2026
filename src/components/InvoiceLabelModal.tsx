"use client";

import React, { useState } from "react";
import { X, Printer, FileText, Package, Truck, CheckCircle2, Building2 } from "lucide-react";
import { Order } from "@/context/DashboardContext";

interface InvoiceLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  activeTenantId: string | null;
}

export default function InvoiceLabelModal({ isOpen, onClose, order, activeTenantId }: InvoiceLabelModalProps) {
  const [activeTab, setActiveTab] = useState<"invoice" | "label">("invoice");

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.id.replace(/[^0-9]/g, "") || "9842"}`;
  const tenantTag = activeTenantId || "CLI-101";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-white/15 p-6 shadow-2xl bg-slate-950/95 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Enterprise Commercial Invoice & Shipping Label</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">Order: {order.id} • Tenant: {tenantTag}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center p-1 bg-slate-900 border border-white/10 rounded-xl">
              <button
                onClick={() => setActiveTab("invoice")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "invoice" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Commercial Invoice</span>
              </button>
              <button
                onClick={() => setActiveTab("label")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "label" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Shipping Label</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto pt-6 pr-2 print-area text-slate-900">
          {activeTab === "invoice" ? (
            /* --- INVOICE VIEW --- */
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-900 space-y-6 shadow-xl max-w-2xl mx-auto">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xl tracking-wider">
                    <Building2 className="h-6 w-6" />
                    <span>LOGILINK ENTERPRISE</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Tenant Account ID: <strong className="text-slate-700">{tenantTag}</strong></p>
                  <p className="text-xs text-slate-500">Central Logistics Fulfillment Center, Hub 04</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest block">TAX INVOICE</span>
                  <h3 className="text-xl font-black text-slate-900">{invoiceNumber}</h3>
                  <p className="text-xs text-slate-500 mt-1">Date: {order.date}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Status: {order.status}
                  </span>
                </div>
              </div>

              {/* Bill To & Ship To Grid */}
              <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">BILLED TO (RETAILER)</span>
                  <h4 className="font-black text-slate-900 text-sm">{order.retailer}</h4>
                  <p className="text-slate-600 mt-0.5">{order.location}</p>
                  <p className="text-slate-500 mt-1">Payment Method: COD / Credit Agreement</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">FULFILLMENT DISPATCH</span>
                  <p className="text-slate-700 font-semibold">Carrier: {order.carrier || "Steadfast Courier"}</p>
                  <p className="text-slate-700 font-mono">Consignment ID: {order.trackingNum || "STD-8492"}</p>
                  <p className="text-slate-500 mt-1">Est. Delivery: {order.eta || "Tomorrow"}</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider bg-slate-50">
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{order.items}</p>
                        <span className="text-[10px] text-slate-400 font-mono">Ref Order SKU: ORD-{order.id}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{order.qty}</td>
                      <td className="py-3 px-3 text-right text-slate-600">৳ {(order.total / order.qty).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">৳ {order.total.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invoice Totals */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>৳ {order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Logistics Shipping Fee:</span>
                    <span className="text-emerald-600 font-bold">FREE / Included</span>
                  </div>
                  <div className="flex justify-between text-slate-900 text-sm font-black pt-2 border-t border-slate-300">
                    <span>Total Outstanding:</span>
                    <span className="text-indigo-600">৳ {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <p>Thank you for partnering with LogiLink Enterprise SaaS Network.</p>
                <div className="flex items-center gap-1 text-slate-600 font-bold">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Authorized System Invoice
                </div>
              </div>
            </div>
          ) : (
            /* --- SHIPPING LABEL VIEW --- */
            <div className="bg-white p-8 rounded-2xl border-4 border-slate-900 text-slate-900 space-y-6 shadow-2xl max-w-md mx-auto">
              {/* Shipping Label Header */}
              <div className="flex justify-between items-center border-b-4 border-slate-900 pb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 flex items-center gap-1.5">
                    <Truck className="h-5 w-5 text-indigo-600" />
                    <span>LOGILINK COURIER</span>
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500">TENANT: {tenantTag}</span>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded bg-slate-900 text-white font-black text-xs uppercase">
                    {order.carrier || "STEADFAST"}
                  </span>
                </div>
              </div>

              {/* Barcode Visualization (CSS SVG Lines) */}
              <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-xl text-center space-y-1">
                <div className="h-14 w-full flex items-center justify-center gap-1">
                  {[4, 2, 6, 1, 3, 5, 2, 4, 7, 2, 5, 1, 3, 6, 2, 4, 2, 5, 1, 6, 3, 4].map((w, i) => (
                    <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 1.5}px` }} />
                  ))}
                </div>
                <span className="text-xs font-mono font-black text-slate-900 tracking-widest block">
                  *{order.trackingNum || "STD-8492019"}*
                </span>
              </div>

              {/* From & To Addresses */}
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                  <span className="font-black text-slate-500 text-[10px] uppercase block mb-1">FROM (SHIPPER):</span>
                  <p className="font-bold text-slate-900">LogiLink Central Dispatch Hub</p>
                  <p className="text-slate-600">Warehouse Complex Alpha, Gate 04</p>
                </div>

                <div className="p-4 bg-indigo-50 border-2 border-indigo-900 rounded-xl">
                  <span className="font-black text-indigo-900 text-[10px] uppercase block mb-1">DELIVER TO (RETAILER):</span>
                  <h4 className="font-black text-indigo-950 text-base">{order.retailer}</h4>
                  <p className="font-semibold text-slate-800 mt-1">{order.location}</p>
                  <p className="text-slate-600 mt-0.5">Contact: Store Purchasing Mgr</p>
                </div>
              </div>

              {/* Item Summary & COD Amount */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t-2 border-slate-900">
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-bold block">ITEMS / QTY</span>
                  <span className="font-black text-slate-900">{order.qty} UNITS</span>
                  <p className="text-[10px] text-slate-600 truncate">{order.items}</p>
                </div>

                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-right">
                  <span className="text-[10px] text-emerald-800 font-bold block">COD COLLECTION</span>
                  <span className="font-black text-emerald-950 text-sm">৳ {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
