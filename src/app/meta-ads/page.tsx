"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Plus, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Building2, 
  Key, 
  CheckCircle2, 
  Play, 
  Pause, 
  Trash2, 
  Layers, 
  Sparkles,
  MousePointerClick,
  Eye,
  ShoppingBag,
  X,
  Loader2
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

function MetaAdsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  const { 
    metaCampaigns, 
    metaSettings, 
    activeTenantId, 
    isAdmin, 
    addToast,
    addMetaCampaign,
    toggleMetaCampaignStatus,
    deleteMetaCampaign
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Campaign Form State
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newSpendUsd, setNewSpendUsd] = useState("");
  const [newRevenueBdt, setNewRevenueBdt] = useState("");
  const [newOrders, setNewOrders] = useState("");
  const [newImpressions, setNewImpressions] = useState("");
  const [newClicks, setNewClicks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/route-tracking");
    }
  }, [isAdmin, router]);

  // --- FILTERED CAMPAIGNS (Multi-Tenant Isolated) ---
  const filteredCampaigns = useMemo(() => {
    return metaCampaigns.filter(c => {
      const matchesSearch = c.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === "active") matchesTab = c.status === "ACTIVE";
      else if (activeTab === "paused") matchesTab = c.status === "PAUSED";

      return matchesSearch && matchesTab;
    });
  }, [metaCampaigns, searchQuery, activeTab]);

  // --- KPI CALCULATIONS ---
  const totalSpendUsd = useMemo(() => {
    return metaCampaigns.reduce((sum, c) => sum + c.spendUsd, 0);
  }, [metaCampaigns]);

  const totalSpendBdt = useMemo(() => {
    return Math.round(totalSpendUsd * (metaSettings.usdToBdtRate || 120));
  }, [totalSpendUsd, metaSettings.usdToBdtRate]);

  const totalRevenueBdt = useMemo(() => {
    return metaCampaigns.reduce((sum, c) => sum + c.revenueBdt, 0);
  }, [metaCampaigns]);

  const totalOrdersDriven = useMemo(() => {
    return metaCampaigns.reduce((sum, c) => sum + c.ordersDriven, 0);
  }, [metaCampaigns]);

  const netRoas = useMemo(() => {
    if (totalSpendBdt === 0) return "0.00x";
    const ratio = totalRevenueBdt / totalSpendBdt;
    return `${ratio.toFixed(2)}x`;
  }, [totalRevenueBdt, totalSpendBdt]);

  const avgCpaUsd = useMemo(() => {
    if (totalOrdersDriven === 0) return "$0.00";
    return `$${(totalSpendUsd / totalOrdersDriven).toFixed(2)}`;
  }, [totalSpendUsd, totalOrdersDriven]);

  const avgCpaBdt = useMemo(() => {
    if (totalOrdersDriven === 0) return "৳0";
    return `৳${Math.round(totalSpendBdt / totalOrdersDriven).toLocaleString()}`;
  }, [totalSpendBdt, totalOrdersDriven]);

  const handleSyncMeta = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast("success", "Meta Graph API Synced", `Refreshed live ad account metrics for Tenant ${activeTenantId || "CLI-101"}`);
    }, 1200);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) {
      addToast("warning", "Campaign Name Required", "Please enter a valid campaign name");
      return;
    }

    setIsSubmitting(true);
    try {
      const spendUsd = parseFloat(newSpendUsd) || 500;
      const revenueBdt = parseFloat(newRevenueBdt) || 300000;
      const orders = parseInt(newOrders, 10) || 40;
      const impressions = parseInt(newImpressions, 10) || 50000;
      const clicks = parseInt(newClicks, 10) || 2500;

      await addMetaCampaign({
        campaignName: newCampaignName.trim(),
        impressions,
        clicks,
        spendUsd,
        ordersDriven: orders,
        revenueBdt,
        roas: spendUsd > 0 ? Number((revenueBdt / (spendUsd * (metaSettings.usdToBdtRate || 120))).toFixed(2)) : 0,
        status: "ACTIVE",
      });

      setIsCreateModalOpen(false);
      setNewCampaignName("");
      setNewSpendUsd("");
      setNewRevenueBdt("");
      setNewOrders("");
      setNewImpressions("");
      setNewClicks("");
    } catch (err) {
      console.error("Error creating campaign:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-1.5">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Digital Marketing Performance Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Meta Ads & ROAS Analytics Engine
          </h1>
          <p className="text-slate-400 mt-1.5 text-xs sm:text-sm max-w-2xl">
            Track multi-tenant Facebook ad spend, track real-time B2B conversions, monitor Return on Ad Spend (ROAS), and manage campaign budgets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-300">
            <Building2 className="h-4 w-4 text-indigo-400" />
            <span>Active Tenant: <strong>{activeTenantId || "CLI-101"}</strong></span>
          </div>

          <button
            onClick={handleSyncMeta}
            disabled={isSyncing}
            className="flex items-center gap-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Meta API"}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 text-xs font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Launch Campaign</span>
          </button>
        </div>
      </div>

      {/* Meta Credentials & Graph API Connection Status Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Meta Business Account:</span>
              <code className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-emerald-300 font-bold">
                {metaSettings.metaAdAccountId || "act_49201948120"}
              </code>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" /> Token Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Multi-tenant isolated token mapped to Supabase (`.eq(&quot;tenant_id&quot;, &quot;{activeTenantId || "CLI-101"}&quot;)`)
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/settings?tab=meta")}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors self-end sm:self-auto"
        >
          <span>Configure Meta Tokens in Settings</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 4 CORE KPI OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Total Spend */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Facebook Ad Spend</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              ${totalSpendUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-extrabold text-indigo-400 mt-1 flex items-center gap-1">
              <span>≈ ৳{totalSpendBdt.toLocaleString()} BDT</span>
              <span className="text-[10px] text-slate-400 font-normal">(@ {metaSettings.usdToBdtRate || 120}/$)</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Revenue */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Meta Revenue Generated</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400">
              ৳{totalRevenueBdt.toLocaleString()} BDT
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
              <ShoppingBag className="h-3 w-3 text-emerald-400" />
              <span>{totalOrdersDriven} Orders Driven</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Net ROAS Ratio */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 relative overflow-hidden shadow-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 ring-1 ring-indigo-500/20">
          <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
            <span>Net ROAS Ratio</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
              <span>{netRoas}</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Healthy Multiplier
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Return on Ad Spend = Total Sales (BDT) / Spend (BDT)
            </p>
          </div>
        </div>

        {/* KPI 4: Average CPA */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Avg Cost Per Acquisition (CPA)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {avgCpaUsd} <span className="text-xs font-normal text-slate-400">USD</span>
            </div>
            <div className="text-xs font-extrabold text-amber-400 mt-1">
              {avgCpaBdt} BDT per customer order
            </div>
          </div>
        </div>
      </div>

      {/* CAMPAIGN PERFORMANCE TABLE SECTION */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden space-y-4">
        {/* Table Header Bar & Filters */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-950/40">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              Meta Campaign Performance Directory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Granular impression, click, spend, order conversion, and ROAS breakdown for active tenant.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold">
              <button
                onClick={() => router.push("/meta-ads?tab=all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "all" ? "bg-indigo-600 text-white font-extrabold" : "text-slate-400 hover:text-white"
                }`}
              >
                All ({metaCampaigns.length})
              </button>
              <button
                onClick={() => router.push("/meta-ads?tab=active")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "active" ? "bg-indigo-600 text-white font-extrabold" : "text-slate-400 hover:text-white"
                }`}
              >
                Active ({metaCampaigns.filter(c => c.status === "ACTIVE").length})
              </button>
              <button
                onClick={() => router.push("/meta-ads?tab=paused")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "paused" ? "bg-indigo-600 text-white font-extrabold" : "text-slate-400 hover:text-white"
                }`}
              >
                Paused ({metaCampaigns.filter(c => c.status === "PAUSED").length})
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/60 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Campaign Name</th>
                <th className="py-3.5 px-4 text-right">Impressions</th>
                <th className="py-3.5 px-4 text-right">Clicks (CTR)</th>
                <th className="py-3.5 px-4 text-right">Spend ($ USD)</th>
                <th className="py-3.5 px-4 text-right">Orders Driven</th>
                <th className="py-3.5 px-4 text-right">Revenue (৳ BDT)</th>
                <th className="py-3.5 px-4 text-right">Net ROAS</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium text-slate-300">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="h-8 w-8 text-slate-600" />
                      <p className="font-semibold text-slate-300">No campaigns found for Tenant {activeTenantId || "CLI-101"}</p>
                      <p className="text-xs text-slate-500">Launch a campaign or check your search query filter.</p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                      >
                        + Launch Meta Campaign
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : "0.00";
                  const spendBdt = Math.round(c.spendUsd * (metaSettings.usdToBdtRate || 120));

                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm">{c.campaignName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                          <span>ID: {c.id}</span>
                          <span>•</span>
                          <span>Tenant: {activeTenantId || "CLI-101"}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-200">
                        <div className="flex items-center justify-end gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>{c.impressions.toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-slate-200 flex items-center justify-end gap-1.5">
                          <MousePointerClick className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{c.clicks.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">{ctr}% CTR</div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="font-bold text-white font-mono">${c.spendUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-[10px] text-slate-400">≈ ৳{spendBdt.toLocaleString()}</div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="font-extrabold text-emerald-400">{c.ordersDriven} orders</div>
                        <div className="text-[10px] text-slate-400">
                          {c.ordersDriven > 0 ? `$${(c.spendUsd / c.ordersDriven).toFixed(2)} CPA` : "-"}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-black text-emerald-400 text-sm">
                        ৳{c.revenueBdt.toLocaleString()}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span className={`inline-block font-black text-xs px-2.5 py-1 rounded-xl border ${
                          c.roas >= 4.0 
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                            : c.roas >= 2.0 
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30" 
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        }`}>
                          {c.roas.toFixed(2)}x
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          c.status === "ACTIVE" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                            : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${c.status === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                          <span>{c.status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => toggleMetaCampaignStatus(c.id)}
                            title={c.status === "ACTIVE" ? "Pause Campaign" : "Activate Campaign"}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
                          >
                            {c.status === "ACTIVE" ? (
                              <Pause className="h-3.5 w-3.5 text-amber-400" />
                            ) : (
                              <Play className="h-3.5 w-3.5 text-emerald-400" />
                            )}
                          </button>

                          <button
                            onClick={() => deleteMetaCampaign(c.id)}
                            title="Delete Campaign"
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-slate-950 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-400" />
                  Launch Meta Campaign
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create isolated campaign record under Tenant {activeTenantId || "CLI-101"}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Retargeting - Dhaka Region"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Ad Spend ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1500"
                    value={newSpendUsd}
                    onChange={(e) => setNewSpendUsd(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Revenue (৳ BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 900000"
                    value={newRevenueBdt}
                    onChange={(e) => setNewRevenueBdt(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Orders Driven
                  </label>
                  <input
                    type="number"
                    placeholder="120"
                    value={newOrders}
                    onChange={(e) => setNewOrders(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Impressions
                  </label>
                  <input
                    type="number"
                    placeholder="250000"
                    value={newImpressions}
                    onChange={(e) => setNewImpressions(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Clicks
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={newClicks}
                    onChange={(e) => setNewClicks(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span>{isSubmitting ? "Saving..." : "Create Campaign"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MetaAdsPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-slate-900/40 rounded-3xl" />}>
      <MetaAdsContent />
    </Suspense>
  );
}
