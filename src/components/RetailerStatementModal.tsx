"use client";

import React from "react";
import { X, Printer, FileSpreadsheet, Building2, CheckCircle2 } from "lucide-react";
import { Retailer, Order } from "@/context/DashboardContext";

interface RetailerStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  retailer: Retailer | null;
  orders: Order[];
  activeTenantId: string | null;
}

export default function RetailerStatementModal({ isOpen, onClose, retailer, orders, activeTenantId }: RetailerStatementModalProps) {
  if (!isOpen || !retailer) return null;

  const handlePrint = () => {
    window.print();
  };

  const tenantTag = activeTenantId || "CLI-101";
  const dateStr = new Date().toISOString().split("T")[0];
  const statementNum = `STM-${retailer.id.replace(/[^0-9]/g, "") || "948"}-${Date.now().toString().slice(-4)}`;

  const dealerOrders = orders.filter(o => 
    o.retailer.toLowerCase().includes(retailer.name.toLowerCase()) || 
    retailer.name.toLowerCase().includes(o.retailer.toLowerCase())
  );

  const outstandingBalance = retailer.outstandingBalance || Math.round((retailer.totalVolume || 50000) * 0.22);
  const creditLimit = retailer.creditLimit || 150000;
  const availableCredit = Math.max(0, creditLimit - outstandingBalance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-white/15 p-6 shadow-2xl bg-slate-950/95 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 no-print flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>B2B Credit Ledger &amp; Account Statement</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">Dealer ID: {retailer.id} • {retailer.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Account Statement</span>
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
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-900 space-y-6 shadow-xl max-w-2xl mx-auto">
            
            {/* Statement Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xl tracking-wider">
                  <Building2 className="h-6 w-6" />
                  <span>LOGILINK B2B LEDGER</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Tenant Organization: <strong className="text-slate-700">{tenantTag}</strong></p>
                <p className="text-xs text-slate-500">Corporate Dealer Accounting &amp; Audit Services</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-extrabold text-indigo-600 tracking-widest block">DEALER CREDIT STATEMENT</span>
                <h3 className="text-base font-black text-slate-900 font-mono">{statementNum}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Statement Date: {dateStr}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase">
                  Grade {retailer.grade} Partner
                </span>
              </div>
            </div>

            {/* Dealer Info & Financial Overview */}
            <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">DEALER ACCOUNT DETAILS</span>
                <h4 className="font-black text-slate-900 text-sm">{retailer.name}</h4>
                <p className="text-slate-700 font-semibold">{retailer.location}</p>
                <p className="text-slate-600 mt-1">Contact: {retailer.contact}</p>
                <p className="text-slate-500">{retailer.email} • {retailer.phone}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">CREDIT SUMMARY</span>
                <div className="flex justify-between text-slate-700">
                  <span>Assigned Limit:</span>
                  <span className="font-bold text-slate-900">৳ {creditLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Unpaid Invoices:</span>
                  <span className="font-bold text-amber-600">৳ {outstandingBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black pt-1 border-t border-slate-200">
                  <span>Available Credit Margin:</span>
                  <span className="text-emerald-600">৳ {availableCredit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Order History Table */}
            <div className="space-y-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-xs">RECENT FULFILLMENT ORDER TRANSACTIONS</span>
              
              {dealerOrders.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider bg-slate-50">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Items Summary</th>
                      <th className="py-2.5 px-3 text-center">Fulfillment Status</th>
                      <th className="py-2.5 px-3 text-right">Order Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dealerOrders.map(o => (
                      <tr key={o.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">{o.id}</td>
                        <td className="py-2.5 px-3 text-slate-600">{o.date}</td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-[150px] truncate">{o.items}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">৳ {o.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No recent order transactions recorded for this dealer account.
                </div>
              )}
            </div>

            {/* Statement Totals */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Lifetime Purchased Volume:</span>
                  <span className="font-bold text-slate-900">৳ {retailer.totalVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 text-sm font-black pt-2 border-t border-slate-300">
                  <span>Total Outstanding Due:</span>
                  <span className="text-amber-600">৳ {outstandingBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <p>Certified statement generated by LogiLink Enterprise SaaS B2B CRM Engine.</p>
              <div className="flex items-center gap-1 text-slate-600 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" /> Authorized B2B Ledger
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
