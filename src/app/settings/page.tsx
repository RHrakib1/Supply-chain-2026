"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Loader2,
  Truck
} from "lucide-react";

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "roles";

  const { 
    userRole, 
    isAdmin, 
    setUserRole, 
    isSupabaseLive, 
    activeTenantId, 
    addToast,
    metaSettings,
    saveMetaCredentials
  } = useDashboard();

  const [staffEmail, setStaffEmail] = useState("");
  const [staffName, setStaffName] = useState("");
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);
  const [staffNotice, setStaffNotice] = useState<string | null>(null);

  // Meta Settings State
  const [metaAdAccountId, setMetaAdAccountId] = useState(metaSettings?.metaAdAccountId || "act_49201948120");
  const [metaAccessToken, setMetaAccessToken] = useState(metaSettings?.metaAccessToken || "EAAG_demo_access_token");
  const [usdToBdtRate, setUsdToBdtRate] = useState(metaSettings?.usdToBdtRate?.toString() || "120");
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  useEffect(() => {
    if (metaSettings) {
      if (metaSettings.metaAdAccountId) setMetaAdAccountId(metaSettings.metaAdAccountId);
      if (metaSettings.metaAccessToken) setMetaAccessToken(metaSettings.metaAccessToken);
      if (metaSettings.usdToBdtRate) setUsdToBdtRate(metaSettings.usdToBdtRate.toString());
    }
  }, [metaSettings]);

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/route-tracking");
    }
  }, [isAdmin, router]);

  const handleSaveMetaCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaAdAccountId.trim()) {
      addToast("warning", "Ad Account ID Required", "Please enter your Meta Ad Account ID (e.g. act_12345)");
      return;
    }
    if (!metaAccessToken.trim()) {
      addToast("warning", "Access Token Required", "Please enter a valid Meta Access Token");
      return;
    }

    setIsSavingMeta(true);
    try {
      const rate = parseFloat(usdToBdtRate) || 120.0;
      await saveMetaCredentials(metaAdAccountId.trim(), metaAccessToken.trim(), rate);
    } catch (err) {
      console.error("Error saving meta credentials:", err);
    } finally {
      setIsSavingMeta(false);
    }
  };

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

      {/* Dynamic Settings Sub-Navigation Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/10 rounded-2xl overflow-x-auto text-xs font-bold">
        <button
          onClick={() => router.push("/settings?tab=roles")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "roles" || activeTab === "team"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Team Provisioning & RBAC Roles</span>
        </button>

        <button
          onClick={() => router.push("/settings?tab=couriers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "couriers" || activeTab === "integrations"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Courier APIs & System Integrations</span>
        </button>

        <button
          onClick={() => router.push("/settings?tab=meta")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "meta" || activeTab === "facebook"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Key className="h-4 w-4 text-emerald-400" />
          <span>Meta Ad Account & System Token</span>
        </button>
      </div>

      {/* SECTION 1: TEAM ROLES & STAFF PROVISIONING */}
      {(activeTab === "roles" || activeTab === "team" || (activeTab !== "couriers" && activeTab !== "integrations")) && (
        <>
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
        </>
      )}

      {/* SECTION 2: COURIER APIS & SYSTEM INTEGRATIONS */}
      {(activeTab === "couriers" || activeTab === "integrations") && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 bg-slate-950/40">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-400" />
                Integrated Courier API Gateways & Webhooks
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage API credentials for Steadfast Courier, Pathao Courier, Paperfly, RedX, and eCourier
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              5 Webhooks Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-xs">Steadfast Courier API</h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">Active</span>
              </div>
              <p className="text-[11px] text-slate-400">ApiKey: `stdfst_live_9921*****` | Secret: `••••••••`</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-xs">Pathao Logistics API</h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">Active</span>
              </div>
              <p className="text-[11px] text-slate-400">Client ID: `pth_prod_7712` | Secret: `••••••••`</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: META ADS CREDENTIALS & ACCESS TOKEN */}
      {(activeTab === "meta" || activeTab === "facebook") && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-400" />
                Meta Ad Account & System User Access Token
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your Facebook Graph API credentials for multi-tenant ROAS analytics and conversion tracking.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 font-bold w-fit">
              <Building2 className="h-3.5 w-3.5" />
              <span>Target Tenant: {activeTenantId || "CLI-101"}</span>
            </div>
          </div>

          <form onSubmit={handleSaveMetaCredentials} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Meta Ad Account ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. act_49201948120"
                  value={metaAdAccountId}
                  onChange={(e) => setMetaAdAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Prefix with `act_` as shown in Meta Business Manager.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  USD to BDT Exchange Rate *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="120.0"
                  value={usdToBdtRate}
                  onChange={(e) => setUsdToBdtRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Used for converting Facebook USD spend to BDT sales ratio.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                System User Long-Lived Access Token *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Paste System User Access Token starting with EAAG..."
                value={metaAccessToken}
                onChange={(e) => setMetaAccessToken(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Encrypted and saved to Supabase tenant settings (`.eq(&quot;tenant_id&quot;, &quot;{activeTenantId || "CLI-101"}&quot;)`)
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="submit"
                disabled={isSavingMeta}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isSavingMeta ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>{isSavingMeta ? "Saving Token..." : "Save Meta Credentials"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

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

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-slate-900/40 rounded-3xl" />}>
      <SettingsPageContent />
    </Suspense>
  );
}
