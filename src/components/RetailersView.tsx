"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldAlert, 
  DollarSign, 
  Activity,
  Plus,
  X,
  Edit3,
  CheckCircle2
} from "lucide-react";
import { useDashboard, Retailer } from "@/context/DashboardContext";

interface RetailersViewProps {
  retailers: Retailer[];
  searchQuery: string;
}

export default function RetailersView({ retailers, searchQuery }: RetailersViewProps) {
  const { addRetailer, updateRetailer } = useDashboard();
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState<Retailer | null>(null);

  // New Retailer Form State
  const [newRetailer, setNewRetailer] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    location: "",
    totalVolume: 50000,
  });

  // Edit Retailer Form State
  const [editForm, setEditForm] = useState({
    status: "Active" as Retailer["status"],
    grade: "A+" as Retailer["grade"],
    totalVolume: 0,
    contact: "",
    phone: "",
  });

  const filteredRetailers = useMemo(() => {
    return retailers.filter(r => {
      const matchesSearch = 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.contact.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [retailers, searchQuery, statusFilter]);

  const totalContractValue = useMemo(() => {
    return retailers.reduce((sum, r) => sum + (r.totalVolume || 0), 0);
  }, [retailers]);

  const reviewAccountsCount = useMemo(() => {
    return retailers.filter(r => r.status === "Under Review").length;
  }, [retailers]);

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case "A+": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "A": return "text-teal-400 bg-teal-500/10 border-teal-500/30";
      case "B": return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "C": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "Under Review": return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "Suspended": return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      default: return "bg-slate-500/10 border-slate-500/20 text-slate-400";
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRetailer.name.trim()) return;

    addRetailer({
      name: newRetailer.name.trim(),
      contact: newRetailer.contact.trim() || "Logistics Ops",
      email: newRetailer.email.trim() || `${newRetailer.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@retailer.com`,
      phone: newRetailer.phone.trim() || "+1 (555) 019-2834",
      location: newRetailer.location.trim() || "North Region",
      totalVolume: Number(newRetailer.totalVolume) || 50000,
      status: "Active",
      grade: "A+",
    });

    setNewRetailer({ name: "", contact: "", email: "", phone: "", location: "", totalVolume: 50000 });
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (retailer: Retailer) => {
    setEditingRetailer(retailer);
    setEditForm({
      status: retailer.status,
      grade: retailer.grade,
      totalVolume: retailer.totalVolume,
      contact: retailer.contact,
      phone: retailer.phone,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRetailer) return;

    updateRetailer(editingRetailer.id, {
      status: editForm.status,
      grade: editForm.grade,
      totalVolume: Number(editForm.totalVolume),
      contact: editForm.contact.trim(),
      phone: editForm.phone.trim(),
    });

    setEditingRetailer(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Retailer Partner Network</h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Oversee corporate logistics agreements, performance metrics, and contact portals.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/30 w-fit cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Onboard New Retailer
        </button>
      </div>

      {/* Network Health Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Network Fulfillment Avg</span>
            <span className="block text-2xl font-extrabold text-white mt-1">96.7%</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total B2B Contract Value</span>
            <span className="block text-2xl font-extrabold text-white mt-1">${(totalContractValue / 1000).toFixed(0)}k</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 border-l-4 border-amber-500">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Partners Under Review</span>
            <span className="block text-2xl font-extrabold text-amber-400 mt-1">{reviewAccountsCount} {reviewAccountsCount === 1 ? "Account" : "Accounts"}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Status bar */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search status */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Search className="h-4 w-4 text-slate-500" />
          {searchQuery ? (
            <span>Filtering partners: &quot;<strong className="text-indigo-400">{searchQuery}</strong>&quot; ({filteredRetailers.length} results)</span>
          ) : (
            <span className="text-xs text-slate-400">Filter or search by retailer partner name or contact person</span>
          )}
        </div>

        {/* Filter selection */}
        <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 px-3 py-1.5 rounded-xl self-end sm:self-auto">
          <span className="text-xs text-slate-400 font-medium">Account Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 border-none outline-none cursor-pointer"
          >
            <option value="All" className="bg-slate-950">All Partnerships</option>
            <option value="Active" className="bg-slate-950">Active</option>
            <option value="Under Review" className="bg-slate-950">Under Review</option>
            <option value="Suspended" className="bg-slate-950">Suspended</option>
          </select>
        </div>
      </div>

      {/* Retailers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRetailers.length > 0 ? (
          filteredRetailers.map((r) => (
            <div key={r.id} className="glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between relative group shadow-lg shadow-black/10">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{r.id}</span>
                    <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors mt-0.5">{r.name}</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      {r.location}
                    </p>
                  </div>
                  
                  <div className={`h-10 w-10 border rounded-xl flex flex-col items-center justify-center font-black text-sm tracking-tighter ${getGradeStyle(r.grade)}`}>
                    {r.grade}
                    <span className="text-[7px] font-bold tracking-normal uppercase -mt-0.5">Rating</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 my-5 py-4 border-y border-white/5 bg-slate-950/15 rounded-xl px-2.5">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Orders</span>
                    <span className="font-bold text-white text-sm">{r.totalOrders}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Total Sales</span>
                    <span className="font-bold text-indigo-400 text-sm">${(r.totalVolume / 1000).toFixed(0)}k</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">On-Time %</span>
                    <span className={`font-bold text-sm ${r.onTimeRate >= 95 ? "text-emerald-400" : "text-amber-400"}`}>
                      {r.onTimeRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 text-xs text-slate-400">
                  <p className="flex items-center gap-2 font-semibold text-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    {r.contact}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    {r.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    {r.phone}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className={`inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full border ${getStatusBadge(r.status)}`}>
                    {r.status}
                  </span>
                  <button 
                    onClick={() => handleOpenEdit(r)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Modify Agreement &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full py-12 text-center text-slate-500 text-xs font-semibold">No B2B partners match search parameters.</p>
        )}
      </div>

      {/* --- MODAL 1: Onboard New Retailer --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/15 p-6 shadow-2xl bg-slate-950/90 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Onboard New Retailer</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Partner / Retailer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Costco North Distribution"
                  value={newRetailer.name}
                  onChange={(e) => setNewRetailer({ ...newRetailer, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={newRetailer.contact}
                    onChange={(e) => setNewRetailer({ ...newRetailer, contact: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={newRetailer.phone}
                    onChange={(e) => setNewRetailer({ ...newRetailer, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  placeholder="logistics@retailer.com"
                  value={newRetailer.email}
                  onChange={(e) => setNewRetailer({ ...newRetailer, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Hub</label>
                  <input
                    type="text"
                    placeholder="e.g. Seattle, WA"
                    value={newRetailer.location}
                    onChange={(e) => setNewRetailer({ ...newRetailer, location: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Volume ($)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={newRetailer.totalVolume}
                    onChange={(e) => setNewRetailer({ ...newRetailer, totalVolume: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Save & Save to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Modify Agreement --- */}
      {editingRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/15 p-6 shadow-2xl bg-slate-950/90 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Modify Partner Agreement</h3>
                  <p className="text-xs text-indigo-400 font-semibold">{editingRetailer.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingRetailer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Partnership Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Retailer["status"] })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active" className="bg-slate-950">Active</option>
                    <option value="Under Review" className="bg-slate-950">Under Review</option>
                    <option value="Suspended" className="bg-slate-950">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Performance Grade</label>
                  <select
                    value={editForm.grade}
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value as Retailer["grade"] })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="A+" className="bg-slate-950">A+ (Tier 1)</option>
                    <option value="A" className="bg-slate-950">A (High)</option>
                    <option value="B" className="bg-slate-950">B (Standard)</option>
                    <option value="C" className="bg-slate-950">C (Needs Imp)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contract Volume ($)</label>
                <input
                  type="number"
                  value={editForm.totalVolume}
                  onChange={(e) => setEditForm({ ...editForm, totalVolume: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editForm.contact}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRetailer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Update Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
