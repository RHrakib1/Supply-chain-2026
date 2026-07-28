"use client";

import { useState } from "react";
import { 
  Crown, 
  Check, 
  X, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const { clients, inventory, addToast } = useDashboard();
  const [requestedPlan, setRequestedPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeClient = clients[0] || {
    name: "Apex Logistics",
    plan: "Starter",
    maxUsers: 5,
    activeUsers: 5,
  };

  const currentPlan = activeClient.plan || "Starter";

  const handleRequestUpgrade = (planName: string) => {
    setRequestedPlan(planName);
    setTimeout(() => {
      addToast("success", "Upgrade Request Dispatched", `Request for "${planName}" tier sent to Super Admin`);
      onClose();
      setRequestedPlan(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl bg-slate-950/95 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Plan Limit Exceeded</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-350 border border-rose-500/30 font-bold px-2 py-0.5 rounded-full">
                  Action Blocked
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Upgrade Plan Required
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Reason Alert Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-300">
              {reason || "Your current subscription tier has reached its operational allocation limits."}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Current Plan: <strong className="text-white">{currentPlan}</strong> ({inventory.length} SKUs in catalog, {activeClient.activeUsers}/{activeClient.maxUsers} User Seats used).
            </span>
          </div>
        </div>

        {/* Plan Tiers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Starter Plan */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            currentPlan === "Starter" 
              ? "bg-slate-900/80 border-slate-700 opacity-70" 
              : "bg-slate-900/40 border-white/10 hover:border-amber-500/30"
          }`}>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Starter</span>
              <h3 className="text-xl font-black text-white mt-1">$299<span className="text-xs font-normal text-slate-400">/mo</span></h3>
              <ul className="mt-4 space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> 5 User Seats</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> 10 Inventory SKUs</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Basic Route Maps</li>
              </ul>
            </div>
            {currentPlan === "Starter" ? (
              <span className="mt-4 text-[10px] font-bold text-center text-slate-500 bg-slate-800 py-1.5 rounded-xl block">Current Active Plan</span>
            ) : (
              <button
                onClick={() => handleRequestUpgrade("Starter")}
                className="mt-4 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Select Starter
              </button>
            )}
          </div>

          {/* Professional Plan */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative ${
            currentPlan === "Professional"
              ? "bg-indigo-950/40 border-indigo-500/40 shadow-lg shadow-indigo-500/10"
              : "bg-gradient-to-b from-indigo-950/30 to-slate-900/40 border-indigo-500/30 hover:border-indigo-400"
          }`}>
            <span className="absolute -top-2.5 right-3 bg-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Most Popular</span>
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase">Professional</span>
              <h3 className="text-xl font-black text-white mt-1">$799<span className="text-xs font-normal text-slate-400">/mo</span></h3>
              <ul className="mt-4 space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-400" /> 20 User Seats</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-400" /> 50 Inventory SKUs</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-400" /> Supabase Realtime Sync</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-400" /> Freight Telemetry</li>
              </ul>
            </div>
            <button
              onClick={() => handleRequestUpgrade("Professional")}
              disabled={requestedPlan === "Professional"}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {requestedPlan === "Professional" ? "Sending..." : "Request Pro Upgrade"}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            currentPlan === "Enterprise"
              ? "bg-slate-900/80 border-purple-500/40"
              : "bg-slate-900/40 border-white/10 hover:border-purple-500/30"
          }`}>
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase">Enterprise</span>
              <h3 className="text-xl font-black text-white mt-1">$1,999<span className="text-xs font-normal text-slate-400">/mo</span></h3>
              <ul className="mt-4 space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-purple-400" /> 500 User Seats</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-purple-400" /> 500 Inventory SKUs</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-purple-400" /> Dedicated RLS Tables</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-purple-400" /> 24/7 Priority SLA</li>
              </ul>
            </div>
            <button
              onClick={() => handleRequestUpgrade("Enterprise")}
              disabled={requestedPlan === "Enterprise"}
              className="mt-4 w-full py-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-extrabold hover:bg-purple-600/40 transition-all"
            >
              {requestedPlan === "Enterprise" ? "Sending..." : "Request Enterprise"}
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Instant Super Admin dispatch notification enabled
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
