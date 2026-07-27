"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Crown, 
  Building2, 
  Users, 
  DollarSign, 
  ShieldAlert, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  Trash2, 
  Mail, 
  Calendar, 
  TrendingUp,
  X,
  UserCheck
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

export default function SuperAdminPage() {
  const router = useRouter();
  const { isSuperAdmin, clients, addClientBusiness, toggleClientStatus, deleteClientBusiness } = useDashboard();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form State for Client Onboarding
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [plan, setPlan] = useState<"Starter" | "Professional" | "Enterprise">("Professional");
  const [maxUsers, setMaxUsers] = useState(20);

  // Protect page: redirect non-super-admins to Home
  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/");
    }
  }, [isSuperAdmin, router]);

  // Platform Metrics
  const metrics = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === "Active").length;
    const totalMrr = clients.filter(c => c.status === "Active").reduce((sum, c) => sum + c.mrr, 0);
    const totalUsers = clients.reduce((sum, c) => sum + c.activeUsers, 0);
    const totalMaxUsers = clients.reduce((sum, c) => sum + c.maxUsers, 0);

    return {
      totalClients,
      activeClients,
      totalMrr,
      totalUsers,
      totalMaxUsers,
    };
  }, [clients]);

  // Filtered Clients Table
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.ownerEmail.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        c.plan.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  if (!isSuperAdmin) return null;

  const handleSubmitOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerEmail.trim() || !ownerName.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    addClientBusiness({
      name,
      ownerName,
      ownerEmail,
      plan,
      maxUsers: Number(maxUsers),
      status: "Active",
    });

    setSuccessNotice(`Successfully onboarded "${name}"! Client owner (${ownerEmail}) has been provisioned with Admin privileges.`);
    setIsModalOpen(false);
    
    // Reset form
    setName("");
    setOwnerName("");
    setOwnerEmail("");
    setPlan("Professional");
    setMaxUsers(20);

    setTimeout(() => setSuccessNotice(null), 6000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 relative overflow-hidden bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 h-48 w-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-2">
              <Crown className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>Master Super Admin Portal &bull; SaaS Control Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Multi-Tenant Business Directory
            </h1>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl leading-relaxed">
              Manage SaaS tenant accounts, provision client businesses, monitor subscription tiers, and toggle tenant access controls.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 self-start md:self-auto"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Onboard New Client
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Tenant Businesses */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Tenant Businesses</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{metrics.totalClients}</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {metrics.activeClients} Active
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Registered SaaS tenant organizations</div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>SaaS Monthly Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">${metrics.totalMrr.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              /month
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Active subscription billing MRR</div>
        </div>

        {/* Total Staff Accounts Provisioned */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Provisioned User Seats</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{metrics.totalUsers}</span>
            <span className="text-xs font-bold text-slate-400">/ {metrics.totalMaxUsers} max</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Total staff accounts across all tenants</div>
        </div>

        {/* Active Subscriptions Rate */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Platform Health</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {metrics.totalClients > 0 ? ((metrics.activeClients / metrics.totalClients) * 100).toFixed(0) : 100}%
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Optimal
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Active vs suspended tenant ratio</div>
        </div>

      </div>

      {/* Client Businesses Directory */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-400" />
              Tenant Client Organizations
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Filter, monitor subscription tiers, and toggle tenant access</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, owner, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>
        </div>

        {/* Client Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 pr-4">Tenant Company</th>
                <th className="pb-3 px-4">Client Owner</th>
                <th className="pb-3 px-4">Subscription Plan</th>
                <th className="pb-3 px-4">User Seats</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Joined Date</th>
                <th className="pb-3 pl-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.map((client) => (
                <tr key={client.id} className="group hover:bg-white/5 transition-colors">
                  {/* Tenant Company */}
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{client.name}</h3>
                        <span className="text-[10px] font-mono text-slate-500">{client.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Client Owner */}
                  <td className="py-4 px-4">
                    <p className="text-xs font-semibold text-slate-200">{client.ownerName}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3 text-slate-500" />
                      {client.ownerEmail}
                    </p>
                  </td>

                  {/* Subscription Plan & MRR */}
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
                      client.plan === "Enterprise"
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                        : client.plan === "Professional"
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                    }`}>
                      {client.plan} (${client.mrr}/mo)
                    </span>
                  </td>

                  {/* User Seats Usage */}
                  <td className="py-4 px-4">
                    <div className="w-32 space-y-1">
                      <div className="flex justify-between text-[11px] font-medium text-slate-300">
                        <span>{client.activeUsers} Users</span>
                        <span className="text-slate-500">Max {client.maxUsers}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{ width: `${Math.min(100, (client.activeUsers / client.maxUsers) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit ${
                      client.status === "Active"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : client.status === "Pending"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    }`}>
                      {client.status === "Active" && <CheckCircle2 className="h-3 w-3" />}
                      {client.status === "Pending" && <AlertTriangle className="h-3 w-3" />}
                      {client.status === "Suspended" && <Ban className="h-3 w-3" />}
                      {client.status}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-4 px-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      {client.createdAt}
                    </div>
                  </td>

                  {/* Actions: Toggle Access & Delete */}
                  <td className="py-4 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleClientStatus(client.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                          client.status === "Active"
                            ? "bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {client.status === "Active" ? "Suspend Access" : "Activate Access"}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove "${client.name}" from the SaaS platform?`)) {
                            deleteClientBusiness(client.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete tenant account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard New Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-amber-500/30 p-6 shadow-2xl bg-slate-950/95 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Onboard New Tenant Client</h3>
                  <p className="text-xs text-slate-400">Provision business account & invite Client Owner</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOnboard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Business / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Freight Logistics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Client Owner Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Client Owner Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah@acmefreight.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subscription Tier
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as "Starter" | "Professional" | "Enterprise")}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Starter">Starter ($299/mo)</option>
                    <option value="Professional">Professional ($799/mo)</option>
                    <option value="Enterprise">Enterprise ($1,999/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Max User Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                <Crown className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  Provisioning automatically creates the tenant workspace and assigns the Client Owner email an <strong>Admin</strong> role claim in Clerk metadata.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Provision & Invite Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
