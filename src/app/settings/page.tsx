"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Database, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { userRole, isAdmin, setUserRole, isSupabaseLive } = useDashboard();

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/route-tracking");
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-indigo-400" />
          System Settings & RBAC Management
        </h1>
        <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
          Manage user role metadata, access control policies, and system integrations.
        </p>
      </div>

      {/* Role Configuration Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 bg-slate-950/40">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-400" />
              Active Session Role Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Role permissions determined by Clerk User Metadata (`publicMetadata.role` / `unsafeMetadata.role`)
            </p>
          </div>
          <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
            isAdmin 
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" 
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          }`}>
            Current: {userRole}
          </span>
        </div>

        {/* Role Switcher Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Admin Role Box */}
          <div 
            onClick={() => setUserRole("admin")}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              userRole === "admin"
                ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500/50"
                : "bg-slate-900/40 border-white/10 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Administrator Role (`admin`)</h3>
                  <span className="text-[10px] text-indigo-300 font-semibold">Full System Access</span>
                </div>
              </div>
              {userRole === "admin" && <CheckCircle2 className="h-5 w-5 text-indigo-400" />}
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-400 border-t border-white/5 pt-3">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Access all pages & analytics
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Add/delete SKUs & orders
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Onboard retailers & inspect financials
              </li>
            </ul>
          </div>

          {/* User Role Box */}
          <div 
            onClick={() => setUserRole("user")}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              userRole === "user"
                ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500/50"
                : "bg-slate-900/40 border-white/10 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Normal User Role (`user`)</h3>
                  <span className="text-[10px] text-emerald-300 font-semibold">Restricted Operational Access</span>
                </div>
              </div>
              {userRole === "user" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-400 border-t border-white/5 pt-3">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Access `/route-tracking` & `/orders`
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 line-through">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Financial metrics & totals hidden
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 line-through">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                &quot;Delete Item&quot; &amp; &quot;Onboard Retailer&quot; hidden
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security & Database Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="h-4 w-4 text-indigo-400" />
            Clerk Auth & Metadata Integration
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            User identity is managed via Clerk `@clerk/nextjs`. Role claims are attached to user metadata and enforced via Next.js Middleware route matchers.
          </p>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[11px] font-mono text-indigo-300 space-y-1">
            <div>publicMetadata: &#123; role: &quot;{userRole}&quot; &#125;</div>
            <div>unsafeMetadata: &#123; role: &quot;{userRole}&quot; &#125;</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            Supabase RLS Status
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Supabase database tables (`inventory`, `orders`, `retailers`) sync real-time changes. RLS policies restrict DELETE and sensitive UPDATE actions to authenticated Admin JWT tokens.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isSupabaseLive ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Supabase Live & RLS Enforced
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertCircle className="h-4 w-4" /> Local Fallback Mock Mode Active
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
