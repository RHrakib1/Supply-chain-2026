"use client";

import React from "react";
import { X, Printer, ShieldCheck, Building2, Crown } from "lucide-react";
import { ClientBusiness } from "@/context/DashboardContext";

interface SaaSReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientBusiness | null;
}

export default function SaaSReceiptModal({ isOpen, onClose, client }: SaaSReceiptModalProps) {
  if (!isOpen || !client) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNum = `REC-${client.id.replace(/[^0-9]/g, "") || "3261"}-${Date.now().toString().slice(-4)}`;
  const dateStr = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-white/15 p-6 shadow-2xl bg-slate-950/95 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 no-print flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Official SaaS Subscription Billing Receipt</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">Tenant: {client.id} • {client.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Subscription Invoice</span>
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
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-900 space-y-6 shadow-xl max-w-xl mx-auto">
            
            {/* Receipt Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xl tracking-wider">
                  <Building2 className="h-6 w-6" />
                  <span>LOGILINK SAAS PLATFORM</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">LogiLink Cloud Infrastructure &amp; Licensing Inc.</p>
                <p className="text-xs text-slate-500">Master Super Admin Governance Portal</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-extrabold text-amber-600 tracking-widest block">SAAS BILLING RECEIPT</span>
                <h3 className="text-base font-black text-slate-900 font-mono">{receiptNum}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Billing Date: {dateStr}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Payment Status: {client.status === "Active" ? "PAID & ACTIVE" : "SUSPENDED"}
                </span>
              </div>
            </div>

            {/* Client Account Details */}
            <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">SUBSCRIBER CLIENT TENANT</span>
                <h4 className="font-black text-slate-900 text-sm">{client.name}</h4>
                <p className="text-slate-700 font-mono">Tenant ID: {client.id}</p>
                <p className="text-slate-600 mt-1">Owner: {client.ownerName}</p>
                <p className="text-slate-500">{client.ownerEmail}</p>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">PLAN CAPABILITY</span>
                <p className="text-slate-800 font-bold">Tier: {client.plan} Subscription</p>
                <p className="text-slate-600">Provisioned Seats: {client.activeUsers} / {client.maxUsers} Max</p>
                <p className="text-slate-500 mt-1">Billing Cycle: Monthly Recurring</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="py-2.5 px-3">Subscription Item / Feature Set</th>
                    <th className="py-2.5 px-3 text-center">Seats</th>
                    <th className="py-2.5 px-3 text-right">Monthly Fee (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">LogiLink {client.plan} Plan License</p>
                      <span className="text-[10px] text-slate-500">Includes Multi-Tenant DB, Courier APIs &amp; BI Engine</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{client.maxUsers} Seats</td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900">৳ {client.mrr.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Plan Subtotal:</span>
                  <span>৳ {client.mrr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cloud API Infrastructure Tax:</span>
                  <span className="text-emerald-600 font-bold">৳ 0 (Included)</span>
                </div>
                <div className="flex justify-between text-slate-900 text-sm font-black pt-2 border-t border-slate-300">
                  <span>Total Amount Paid:</span>
                  <span className="text-amber-600">৳ {client.mrr.toLocaleString()} / mo</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <p>Generated by LogiLink Master Governance Operations.</p>
              <div className="flex items-center gap-1 text-slate-600 font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Authorized SaaS Billing Invoice
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
