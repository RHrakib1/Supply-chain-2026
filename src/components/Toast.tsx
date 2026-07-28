"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[120] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "bg-slate-900/90 border-emerald-500/30 text-emerald-400",
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
          bar: "bg-emerald-500",
        };
      case "error":
        return {
          bg: "bg-slate-900/90 border-rose-500/30 text-rose-400",
          icon: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
          bar: "bg-rose-500",
        };
      case "warning":
        return {
          bg: "bg-slate-900/90 border-amber-500/30 text-amber-400",
          icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
          bar: "bg-amber-500",
        };
      default:
        return {
          bg: "bg-slate-900/90 border-indigo-500/30 text-indigo-400",
          icon: <Info className="h-5 w-5 text-indigo-400 shrink-0" />,
          bar: "bg-indigo-500",
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${styles.bg}`}
    >
      <div className="flex items-start gap-3">
        {styles.icon}
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-xs font-bold tracking-wide text-white">{toast.title}</h4>
          {toast.message && <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
        <div className={`h-full w-full ${styles.bar} animate-pulse`} />
      </div>
    </div>
  );
}
