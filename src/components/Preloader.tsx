"use client";

import React, { useEffect, useState } from "react";
import { Truck, Database, ShieldCheck, RefreshCw } from "lucide-react";

interface PreloaderProps {
  isLoading: boolean;
}

export default function Preloader({ isLoading }: PreloaderProps) {
  const [shouldRender, setShouldRender] = useState(isLoading);
  const [isVisible, setIsVisible] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      // Small timeout to allow render before setting opacity
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Wait for fade out animation (400ms) before unmounting
      const timer = setTimeout(() => setShouldRender(false), 450);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0f19] transition-opacity duration-500 ease-in-out select-none ${
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Preloader Card */}
      <div className="relative z-10 flex flex-col items-center p-8 sm:p-10 rounded-2xl glass-panel border border-white/10 max-w-sm w-full mx-4 shadow-2xl bg-[#0f172a]/90 backdrop-blur-xl text-center">
        
        {/* Pulsing Brand Logo Emblem */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer Rotating Glowing Ring */}
          <div className="absolute w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-30 animate-spin blur-sm" style={{ animationDuration: "6s" }} />
          <div className="absolute w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 opacity-40 animate-pulse" />
          
          {/* Brand Icon Box */}
          <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40 border border-indigo-400/30">
            <Truck className="h-7 w-7 text-white animate-bounce" style={{ animationDuration: "2s" }} />
          </div>
        </div>

        {/* Brand Title */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="font-bold text-2xl tracking-wider text-white">LOGI</span>
          <span className="font-bold text-2xl tracking-wider text-indigo-400">LINK</span>
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-6">
          Supply Chain Engine
        </p>

        {/* Tailwind Custom Spinner */}
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-indigo-400 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border border-indigo-300/30 animate-ping opacity-25" />
        </div>

        {/* Status Message & Dynamic Details */}
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-200">
            <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" style={{ animationDuration: "3s" }} />
            <span>Syncing with Supabase Live Database...</span>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 border-t border-white/10 pt-4 mt-2">
            <div className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              <span>Inventory & Orders</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span>Live Realtime</span>
            </div>
          </div>
        </div>

        {/* Bottom Shimmer Bar */}
        <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden mt-6">
          <div className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 h-full w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
