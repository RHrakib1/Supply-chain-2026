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
  Truck,
  Eye,
  EyeOff,
  Activity
} from "lucide-react";
import { testCourierConnection, CourierProvider, CourierTestResult } from "@/lib/courierService";
import { CourierIntegration } from "@/lib/supabaseService";

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
    saveMetaCredentials,
    courierIntegrations,
    saveCourierIntegration
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

  // Courier Integration Local Form State
  const [activeCourierProvider, setActiveCourierProvider] = useState<CourierProvider>("Steadfast");
  const [showApiKeyMap, setShowApiKeyMap] = useState<Record<string, boolean>>({});
  const [isTestingMap, setIsTestingMap] = useState<Record<string, boolean>>({});
  const [testResultMap, setTestResultMap] = useState<Record<string, CourierTestResult | null>>({});
  const [isSavingCourierMap, setIsSavingCourierMap] = useState<Record<string, boolean>>({});

  // Local form values per courier provider
  const [courierFormState, setCourierFormState] = useState<Record<CourierProvider, CourierIntegration>>({
    Steadfast: { provider: "Steadfast", apiKey: "stdf_live_894102849182", secretKey: "stdf_secret_99812", storeId: "101", defaultDeliveryType: "inside_dhaka", isActive: true },
    Pathao: { provider: "Pathao", apiKey: "pth_live_77192049102", secretKey: "pth_secret_4410", storeId: "10892", defaultDeliveryType: "inside_dhaka", isActive: true },
    RedX: { provider: "RedX", apiKey: "rdx_live_55192019481", secretKey: "rdx_secret_1120", storeId: "REDX-DHAKA-1", defaultDeliveryType: "inside_dhaka", isActive: true },
    Paperfly: { provider: "Paperfly", apiKey: "pfly_live_33192019400", secretKey: "pfly_secret_8831", storeId: "PFLY-STORE-01", defaultDeliveryType: "outside_dhaka", isActive: true },
  });

  // Sync with global courierIntegrations from context / Supabase
  useEffect(() => {
    if (courierIntegrations && courierIntegrations.length > 0) {
      setCourierFormState(prev => {
        const copy = { ...prev };
        courierIntegrations.forEach(ci => {
          if (ci.provider && copy[ci.provider]) {
            copy[ci.provider] = { ...ci };
          }
        });
        return copy;
      });
    }
  }, [courierIntegrations]);

  const toggleShowApiKey = (provider: string) => {
    setShowApiKeyMap(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleCourierInputChange = (
    provider: CourierProvider, 
    field: keyof CourierIntegration, 
    value: string | boolean
  ) => {
    setCourierFormState(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }));
  };

  const handleTestCourierConnection = async (provider: CourierProvider) => {
    const config = courierFormState[provider];
    if (!config.apiKey.trim()) {
      addToast("warning", "API Key Required", `Please enter a valid API key for ${provider}`);
      return;
    }

    setIsTestingMap(prev => ({ ...prev, [provider]: true }));
    try {
      const res = await testCourierConnection(provider, config.apiKey, config.secretKey, config.storeId);
      setTestResultMap(prev => ({ ...prev, [provider]: res }));
      if (res.success) {
        addToast("success", `${provider} Connected`, `${res.statusMsg} (${res.latencyMs}ms)`);
      } else {
        addToast("error", `${provider} Connection Failed`, res.statusMsg);
      }
    } catch (err) {
      console.error(`Error testing ${provider} connection:`, err);
      addToast("error", `${provider} Error`, "Connection probe failed");
    } finally {
      setIsTestingMap(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSaveCourierConfig = async (provider: CourierProvider) => {
    const config = courierFormState[provider];
    if (!config.apiKey.trim()) {
      addToast("warning", "API Key Required", `Please enter API key for ${provider}`);
      return;
    }

    setIsSavingCourierMap(prev => ({ ...prev, [provider]: true }));
    try {
      await saveCourierIntegration(config);
    } catch (err) {
      console.error(`Error saving ${provider} integration:`, err);
    } finally {
      setIsSavingCourierMap(prev => ({ ...prev, [provider]: false }));
    }
  };

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
        <div className="space-y-6">
          {/* Header Card */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-400" />
                Multi-Tenant Courier API Gateways & Logistics Settings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure API keys, sender warehouse IDs, and default delivery zones bound to Tenant <strong>{activeTenantId || "CLI-101"}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 font-bold w-fit">
              <Building2 className="h-3.5 w-3.5" />
              <span>Target Tenant: {activeTenantId || "CLI-101"}</span>
            </div>
          </div>

          {/* Provider Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["Steadfast", "Pathao", "RedX", "Paperfly"] as CourierProvider[]).map((prov) => {
              const config = courierFormState[prov];
              const testRes = testResultMap[prov];
              const isSelected = activeCourierProvider === prov;

              return (
                <button
                  key={prov}
                  onClick={() => setActiveCourierProvider(prov)}
                  className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500/50"
                      : "bg-slate-950/40 border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">{prov}</span>
                    <span className={`h-2 w-2 rounded-full ${config.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 truncate font-mono">
                      Store: {config.storeId || "101"}
                    </span>
                    {testRes?.success ? (
                      <span className="text-emerald-400 font-bold">Connected</span>
                    ) : (
                      <span className="text-slate-500 font-semibold">{config.isActive ? "Configured" : "Disabled"}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Provider Config Form Card */}
          {(() => {
            const prov = activeCourierProvider;
            const config = courierFormState[prov];
            const isShowingKey = showApiKeyMap[prov] || false;
            const isTesting = isTestingMap[prov] || false;
            const testRes = testResultMap[prov];
            const isSaving = isSavingCourierMap[prov] || false;

            const maskString = (str: string) => {
              if (!str) return "Not Configured";
              if (isShowingKey) return str;
              if (str.length <= 8) return "••••••••••••";
              return `${str.slice(0, 4)}••••••••${str.slice(-4)}`;
            };

            return (
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 bg-slate-950/60">
                {/* Form Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{prov} Courier API Integration</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          config.isActive 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                            : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                        }`}>
                          {config.isActive ? "ACTIVE GATEWAY" : "INACTIVE"}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Manage API Key, App Secret, Merchant Store ID, and default delivery zones.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Active Switch */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300 self-start sm:self-auto">
                    <span>Enable Gateway</span>
                    <input
                      type="checkbox"
                      checked={config.isActive}
                      onChange={(e) => handleCourierInputChange(prov, "isActive", e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                {/* Connection Test Result Alert */}
                {testRes && (
                  <div className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    testRes.success 
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" 
                      : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Activity className={`h-4 w-4 ${testRes.success ? "text-emerald-400" : "text-rose-400"}`} />
                      <div>
                        <span className="font-bold">{testRes.statusMsg}</span>
                        <span className="text-[10px] ml-2 opacity-80">({testRes.latencyMs}ms ping)</span>
                      </div>
                    </div>
                    {testRes.balanceBdt !== undefined && (
                      <div className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs w-fit">
                        COD Account Balance: ৳{testRes.balanceBdt.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* API Key Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {prov} API Key / App Key *
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleShowApiKey(prov)}
                        className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {isShowingKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        <span>{isShowingKey ? "Mask Key" : "Reveal Key"}</span>
                      </button>
                    </div>
                    <input
                      type={isShowingKey ? "text" : "password"}
                      required
                      placeholder={`Enter ${prov} API Key`}
                      value={config.apiKey}
                      onChange={(e) => handleCourierInputChange(prov, "apiKey", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      UI Masked: {maskString(config.apiKey)}
                    </p>
                  </div>

                  {/* App Secret / Bearer Token */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      App Secret / Bearer Token
                    </label>
                    <input
                      type={isShowingKey ? "text" : "password"}
                      placeholder={`Enter ${prov} Secret / Token`}
                      value={config.secretKey}
                      onChange={(e) => handleCourierInputChange(prov, "secretKey", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Merchant Store / Warehouse ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Default Sender Store / Warehouse ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10892 or WAREHOUSE-DHAKA"
                      value={config.storeId}
                      onChange={(e) => handleCourierInputChange(prov, "storeId", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Default Delivery Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Default Delivery Zone Type
                    </label>
                    <select
                      value={config.defaultDeliveryType}
                      onChange={(e) => handleCourierInputChange(prov, "defaultDeliveryType", e.target.value as "inside_dhaka" | "outside_dhaka")}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="inside_dhaka">Inside Dhaka (24-48 Hours Express)</option>
                      <option value="outside_dhaka">Outside Dhaka (Sub-Urban & National)</option>
                    </select>
                  </div>
                </div>

                {/* Form Action Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleTestCourierConnection(prov)}
                    disabled={isTesting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    ) : (
                      <Activity className="h-4 w-4 text-emerald-400" />
                    )}
                    <span>{isTesting ? "Testing Ping..." : `Test ${prov} API Connection`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveCourierConfig(prov)}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <span>{isSaving ? "Saving..." : `Save ${prov} Credentials`}</span>
                  </button>
                </div>
              </div>
            );
          })()}
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
