"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  UserPlus,
  Users,
  Building2,
  Mail,
  Loader2
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { userRole, isAdmin, setUserRole, isSupabaseLive, activeTenantId, addToast } = useDashboard();

  const [staffEmail, setStaffEmail] = useState("");
  const [staffName, setStaffName] = useState("");
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);
  const [staffNotice, setStaffNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/route-tracking");
    }
  }, [isAdmin, router]);

  const handleProvisionStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim()) {
      addToast("warning", "Email Required", "Please enter a valid staff email address.");
      return;
    }

    try {
      setIsSubmittingStaff(true);
      const currentTenant = activeTenantId || "CLI-101";

      const res = await fetch("/api/provision-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: staffEmail.trim(),
          name: staffName.trim(),
          tenantId: currentTenant,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to provision staff member");
      }

      const data = await res.json();
      setStaffNotice(data.message || `Staff member (${staffEmail.trim()}) successfully provisioned under Tenant ${currentTenant}.`);
      addToast("success", "Staff Member Provisioned", `User assigned to Tenant ${currentTenant}`);
      setStaffEmail("");
      setStaffName("");
    } catch (err) {
      console.error("Error provisioning staff:", err);
      addToast("error", "Provisioning Failed", "Could not provision staff member.");
    } finally {
      setIsSubmittingStaff(false);
    }
  };

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
          Manage user role metadata, tenant staff provisioning, access control policies, and system integrations.
        </p>
      </div>

      {/* Staff & Driver Provisioning Card */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-400" />
              Client Tenant Staff & Driver Provisioning
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Provision drivers and warehouse staff under your isolated tenant environment
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 font-bold w-fit">
            <Building2 className="h-3.5 w-3.5" />
            <span>Active Tenant: {activeTenantId || "CLI-101"}</span>
          </div>
        </div>

        {staffNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>{staffNotice}</span>
            </div>
            <button onClick={() => setStaffNotice(null)} className="text-emerald-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleProvisionStaff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Staff / Driver Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Miller"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Staff / Driver Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. driver@acmefreight.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/5">
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              Provisioning assigns <strong>publicMetadata.role = &apos;user&apos;</strong> and <strong>tenantId = {activeTenantId || "CLI-101"}</strong>
            </p>
            <button
              type="submit"
              disabled={isSubmittingStaff}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 self-start sm:self-auto"
            >
              {isSubmittingStaff ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" />
              )}
              <span>{isSubmittingStaff ? "Provisioning..." : "Provision Staff Member"}</span>
            </button>
          </div>
        </form>
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
                Access `/route-tracking` strictly
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 line-through">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Administrative pages (/inventory, /orders, /settings) blocked
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 line-through">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Destructive & update actions disabled
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
            <div>publicMetadata: &#123; role: &quot;{userRole}&quot;, tenantId: &quot;{activeTenantId || "CLI-101"}&quot; &#125;</div>
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
