"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  DollarSign, 
  Activity,
  Plus,
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  Building2,
  CreditCard,
  Send,
  UserCheck,
  ShoppingBag,
  ListFilter,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  TrendingUp,
  Printer,
  AlertTriangle
} from "lucide-react";
import { useDashboard, Retailer } from "@/context/DashboardContext";
import RetailerStatementModal from "./RetailerStatementModal";

interface RetailersViewProps {
  retailers: Retailer[];
  searchQuery: string;
}

export default function RetailersView({ retailers, searchQuery }: RetailersViewProps) {
  const { 
    orders, 
    addRetailer, 
    updateRetailer, 
    deleteRetailer, 
    isAdmin, 
    activeTenantId, 
    setIsOrderModalOpen, 
    addToast 
  } = useDashboard();

  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Inspection Drawer / Modal State
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);

  // Retailer Ledger Statement Modal State
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [targetStatementRetailer, setTargetStatementRetailer] = useState<Retailer | null>(null);

  // Management Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState<Retailer | null>(null);

  // New Retailer Form State
  const [newRetailer, setNewRetailer] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    location: "",
    totalVolume: 85000,
    creditLimit: 150000,
    grade: "A+" as Retailer["grade"],
  });

  // Edit Retailer Form State
  const [editForm, setEditForm] = useState({
    status: "Active" as Retailer["status"],
    grade: "A+" as Retailer["grade"],
    totalVolume: 0,
    creditLimit: 150000,
    contact: "",
    phone: "",
  });

  // --- FILTERED RETAILERS ---
  const filteredRetailers = useMemo(() => {
    return retailers.filter(r => {
      const matchesSearch = 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [retailers, searchQuery, statusFilter]);

  // --- KPI CALCULATIONS ---
  const activeRetailersCount = useMemo(() => {
    return retailers.filter(r => r.status === "Active").length;
  }, [retailers]);

  const totalContractVolume = useMemo(() => {
    return retailers.reduce((sum, r) => sum + (r.totalVolume || 0), 0);
  }, [retailers]);

  const totalOutstandingCredit = useMemo(() => {
    return retailers.reduce((sum, r) => {
      const credit = r.outstandingBalance || Math.round((r.totalVolume || 50000) * 0.22);
      return sum + credit;
    }, 0);
  }, [retailers]);

  const topTierPartnerRatio = useMemo(() => {
    if (retailers.length === 0) return 0;
    const topTierCount = retailers.filter(r => r.grade === "A+" || r.grade === "A").length;
    return Math.round((topTierCount / retailers.length) * 100);
  }, [retailers]);

  const reviewAccountsCount = useMemo(() => {
    return retailers.filter(r => r.status === "Under Review").length;
  }, [retailers]);

  // --- STYLING HELPERS ---
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

  // --- HANDLERS ---
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRetailer.name.trim()) return;

    addRetailer({
      name: newRetailer.name.trim(),
      contact: newRetailer.contact.trim() || "Logistics Director",
      email: newRetailer.email.trim() || `${newRetailer.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@partner.com`,
      phone: newRetailer.phone.trim() || "+1 (555) 019-2834",
      location: newRetailer.location.trim() || "Central Hub Zone",
      totalVolume: Number(newRetailer.totalVolume) || 85000,
      creditLimit: Number(newRetailer.creditLimit) || 150000,
      outstandingBalance: Math.round((Number(newRetailer.totalVolume) || 85000) * 0.2),
      status: "Active",
      grade: newRetailer.grade,
    });

    addToast("success", "Retailer Onboarded", `${newRetailer.name} added to Tenant ${activeTenantId || "CLI-101"}`);
    setNewRetailer({ name: "", contact: "", email: "", phone: "", location: "", totalVolume: 85000, creditLimit: 150000, grade: "A+" });
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (retailer: Retailer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingRetailer(retailer);
    setEditForm({
      status: retailer.status,
      grade: retailer.grade,
      totalVolume: retailer.totalVolume,
      creditLimit: retailer.creditLimit || 150000,
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
      creditLimit: Number(editForm.creditLimit),
      contact: editForm.contact.trim(),
      phone: editForm.phone.trim(),
    });

    addToast("info", "Agreement Updated", `Updated terms for ${editingRetailer.name}`);
    setEditingRetailer(null);
  };

  const handleSendPaymentReminder = (retailer: Retailer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToast("success", "Payment Reminder Dispatched", `Sent payment statement to ${retailer.name} (${retailer.email})`);
  };

  const handleToggleDeactivate = (retailer: Retailer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = retailer.status === "Suspended" ? "Active" : "Suspended";
    updateRetailer(retailer.id, { status: newStatus });
    addToast(newStatus === "Suspended" ? "warning" : "success", `Partner ${newStatus}`, `${retailer.name} is now ${newStatus}`);
    if (selectedRetailer?.id === retailer.id) {
      setSelectedRetailer({ ...selectedRetailer, status: newStatus });
    }
  };

  const handlePlaceOrderForRetailer = (retailer: Retailer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedRetailer(null);
    setIsOrderModalOpen(true);
    addToast("info", "Create Retailer Order", `Opening order creation for ${retailer.name}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 rounded-3xl border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-1">
            <Building2 className="h-4 w-4" />
            <span>B2B CRM & Dealer Network Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Retailer Partner Directory
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Manage commercial dealer relationships, credit limits, order volumes, and partner performance.
          </p>
        </div>

        {/* Controls: Active Tenant Badge + Onboard Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-extrabold text-indigo-300">
            <Building2 className="h-4 w-4" />
            <span>Tenant: {activeTenantId || "CLI-101"}</span>
          </div>

          {isAdmin && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 text-xs font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Onboard New Retailer
            </button>
          )}
        </div>
      </div>

      {/* 4 Commercial B2B CRM KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Partners Count */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Active Retail Partners</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{activeRetailersCount}</span>
            <span className="text-xs font-bold text-slate-400">/ {retailers.length} total</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Operational B2B Accounts</span>
          </div>
        </div>

        {/* Total B2B Order Volume */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Fulfilled Order Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">৳ {(totalContractVolume / 1000).toFixed(0)}k</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">Cumulative lifetime dealer revenue</div>
        </div>

        {/* Outstanding Unpaid Credit */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Outstanding Dealer Credit</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300">৳ {(totalOutstandingCredit / 1000).toFixed(0)}k</span>
          </div>
          <div className="mt-2 text-xs text-amber-400 font-semibold">Pending invoice balances</div>
        </div>

        {/* Top Tier Ratio */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Top Tier Partner Ratio</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{topTierPartnerRatio}%</span>
            <span className="text-xs font-extrabold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">Grade A+ / A</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">{reviewAccountsCount > 0 ? `${reviewAccountsCount} Under Review` : "High fulfillment reliability"}</div>
        </div>
      </div>

      {/* Filter and Search Bar + View Switcher */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
        {/* Search */}
        <div className="flex items-center gap-2 text-sm text-slate-400 w-full sm:w-auto">
          <Search className="h-4 w-4 text-indigo-400 flex-shrink-0" />
          {searchQuery ? (
            <span className="text-xs">Filtering partners for: &quot;<strong className="text-indigo-400">{searchQuery}</strong>&quot; ({filteredRetailers.length} results)</span>
          ) : (
            <span className="text-xs text-slate-400">Search dealer directory by partner name, contact, email, or location</span>
          )}
        </div>

        {/* Filters & View Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl">
            <ListFilter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-950">All Partnerships ({retailers.length})</option>
              <option value="Active" className="bg-slate-950">Active</option>
              <option value="Under Review" className="bg-slate-950">Under Review</option>
              <option value="Suspended" className="bg-slate-950">Suspended</option>
            </select>
          </div>

          {/* Grid vs Table View Switcher */}
          <div className="flex items-center p-1 bg-slate-900 border border-white/10 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
              title="Directory Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- RETAILER CARDS DISPLAY: GRID VIEW --- */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRetailers.length > 0 ? (
            filteredRetailers.map((r) => (
              <div 
                key={r.id} 
                onClick={() => setSelectedRetailer(r)}
                className="glass-panel glass-panel-hover rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between relative group shadow-xl border border-white/10 cursor-pointer hover:border-indigo-500/40"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{r.id}</span>
                      <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors mt-0.5 flex items-center gap-1.5">
                        <span>{r.name}</span>
                        <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                      </h2>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        {r.location}
                      </p>
                    </div>
                    
                    <div className={`h-11 w-11 border rounded-2xl flex flex-col items-center justify-center font-black text-sm tracking-tighter ${getGradeStyle(r.grade)}`}>
                      {r.grade}
                      <span className="text-[7px] font-bold tracking-normal uppercase -mt-0.5">Rating</span>
                    </div>
                  </div>

                  {/* Financial & Volume Mini Matrix */}
                  <div className={`grid ${isAdmin ? "grid-cols-3" : "grid-cols-2"} gap-3 my-5 py-4 border-y border-white/5 bg-slate-950/30 rounded-2xl px-3`}>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Total Orders</span>
                      <span className="font-bold text-white text-sm">{r.totalOrders}</span>
                    </div>
                    
                    {isAdmin && (
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Lifetime Sales</span>
                        <span className="font-extrabold text-indigo-400 text-sm">৳ {(r.totalVolume / 1000).toFixed(0)}k</span>
                      </div>
                    )}

                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Credit Usage</span>
                      <span className="font-bold text-amber-400 text-sm">
                        ৳ {((r.outstandingBalance || Math.round(r.totalVolume * 0.22)) / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <p className="flex items-center gap-2 font-semibold text-slate-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      {r.contact}
                    </p>
                    <p className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      {r.email}
                    </p>
                    <p className="flex items-center gap-2 text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      {r.phone}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className={`inline-flex items-center text-[9px] font-black px-2.5 py-0.5 rounded-full border ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                    
                    {isAdmin && (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => handleOpenEdit(r, e)}
                          title="Modify Partner Terms"
                          className="p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-600/20 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete retailer ${r.name}?`)) {
                              deleteRetailer(r.id);
                              addToast("info", "Retailer Deleted", `Removed ${r.name} from directory`);
                            }
                          }}
                          title="Delete Retailer"
                          className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full py-12 text-center text-slate-500 text-xs font-semibold">No B2B partners match search parameters.</p>
          )}
        </div>
      ) : (
        /* --- DIRECTORY TABLE VIEW --- */
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 pr-4">Partner Name / ID</th>
                <th className="pb-3 px-4">Contact & Phone</th>
                <th className="pb-3 px-4">Location</th>
                <th className="pb-3 px-4">Orders</th>
                <th className="pb-3 px-4">Lifetime Revenue</th>
                <th className="pb-3 px-4">Credit Balance</th>
                <th className="pb-3 px-4">Grade</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRetailers.map((r) => (
                <tr 
                  key={r.id} 
                  onClick={() => setSelectedRetailer(r)}
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="py-3 pr-4">
                    <p className="font-bold text-white text-xs">{r.name}</p>
                    <span className="text-[9px] font-mono text-slate-500">{r.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-200">{r.contact}</p>
                    <span className="text-[10px] text-slate-400">{r.phone}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{r.location}</td>
                  <td className="py-3 px-4 font-bold text-white">{r.totalOrders}</td>
                  <td className="py-3 px-4 font-extrabold text-indigo-400">৳ {r.totalVolume.toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-amber-300">
                    ৳ {(r.outstandingBalance || Math.round(r.totalVolume * 0.22)).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] border ${getGradeStyle(r.grade)}`}>
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => handleOpenEdit(r, e)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 font-bold text-[10px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleSendPaymentReminder(r, e)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-bold text-[10px]"
                      >
                        Reminder
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* --- SINGLE-CLICK DEEP INSPECTION DRAWER / MODAL --- */}
      {selectedRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-xl h-full border-l border-white/15 p-6 shadow-2xl bg-slate-950/95 overflow-y-auto relative animate-in slide-in-from-right duration-300 space-y-6">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold">{selectedRetailer.id} • Active Partner Profile</span>
                <h2 className="text-2xl font-black text-white mt-0.5">{selectedRetailer.name}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  {selectedRetailer.location}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-black border ${getGradeStyle(selectedRetailer.grade)}`}>
                  Rating: {selectedRetailer.grade}
                </span>
                <button 
                  onClick={() => setSelectedRetailer(null)}
                  className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 space-y-3">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Commercial B2B Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  onClick={(e) => handlePlaceOrderForRetailer(selectedRetailer, e)}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex flex-col items-center gap-1 transition-all shadow-md"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Place Order</span>
                </button>

                <button
                  onClick={() => {
                    setTargetStatementRetailer(selectedRetailer);
                    setIsStatementModalOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs flex flex-col items-center gap-1 transition-all"
                >
                  <Printer className="h-4 w-4 text-emerald-400" />
                  <span>Statement</span>
                </button>

                <button
                  onClick={(e) => handleOpenEdit(selectedRetailer, e)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex flex-col items-center gap-1 transition-all"
                >
                  <Edit3 className="h-4 w-4 text-indigo-400" />
                  <span>Edit Terms</span>
                </button>

                <button
                  onClick={(e) => handleSendPaymentReminder(selectedRetailer, e)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex flex-col items-center gap-1 transition-all"
                >
                  <Send className="h-4 w-4 text-amber-400" />
                  <span>Reminder</span>
                </button>

                <button
                  onClick={(e) => handleToggleDeactivate(selectedRetailer, e)}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                    selectedRetailer.status === "Suspended"
                      ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30"
                      : "bg-rose-600/20 border-rose-500/30 text-rose-300 hover:bg-rose-600/30"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>{selectedRetailer.status === "Suspended" ? "Activate" : "Suspend"}</span>
                </button>
              </div>
            </div>

            {/* Financial & Credit Overview */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                Financial Credit & Lifetime Valuation
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">Lifetime Revenue</span>
                  <span className="text-base font-black text-indigo-400">৳ {selectedRetailer.totalVolume.toLocaleString()}</span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">Unpaid Invoices</span>
                  <span className="text-base font-black text-amber-400">
                    ৳ {(selectedRetailer.outstandingBalance || Math.round(selectedRetailer.totalVolume * 0.22)).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">Assigned Credit Limit</span>
                  <span className="text-base font-black text-white">
                    ৳ {(selectedRetailer.creditLimit || 150000).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Credit Limit Usage Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Credit Limit Utilization</span>
                  <span className="text-amber-400 font-bold">
                    {Math.round(((selectedRetailer.outstandingBalance || Math.round(selectedRetailer.totalVolume * 0.22)) / (selectedRetailer.creditLimit || 150000)) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round(((selectedRetailer.outstandingBalance || Math.round(selectedRetailer.totalVolume * 0.22)) / (selectedRetailer.creditLimit || 150000)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Contact Person & Address */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 text-xs text-slate-300">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-indigo-400" />
                Contact Person & Corporate Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">Contact Executive</span>
                  <span className="font-bold text-white">{selectedRetailer.contact}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Corporate Email</span>
                  <span className="font-semibold text-slate-200">{selectedRetailer.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Direct Phone</span>
                  <span className="font-semibold text-slate-200">{selectedRetailer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">On-Time Delivery Rate</span>
                  <span className="font-bold text-emerald-400">{selectedRetailer.onTimeRate}%</span>
                </div>
              </div>
            </div>

            {/* Localized Order History Timeline for this Retailer */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-purple-400" />
                Recent Orders Placed by {selectedRetailer.name}
              </h3>

              {orders.filter(o => o.retailer.toLowerCase().includes(selectedRetailer.name.toLowerCase()) || selectedRetailer.name.toLowerCase().includes(o.retailer.toLowerCase())).length > 0 ? (
                <div className="space-y-2.5">
                  {orders.filter(o => o.retailer.toLowerCase().includes(selectedRetailer.name.toLowerCase()) || selectedRetailer.name.toLowerCase().includes(o.retailer.toLowerCase())).map(o => (
                    <div key={o.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{o.id}</span>
                        <span className="text-[10px] text-slate-400">{o.date} • {o.items}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-indigo-300 block">৳ {o.total.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-emerald-400">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-slate-400">
                  No active fulfillment orders recorded for this dealer.
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* --- MODAL 1: Onboard New Retailer --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/15 p-6 shadow-2xl bg-slate-950/95 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-extrabold text-white">Onboard New Retailer</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Partner / Retailer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Walmart East Distribution"
                  value={newRetailer.name}
                  onChange={(e) => setNewRetailer({ ...newRetailer, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={newRetailer.contact}
                    onChange={(e) => setNewRetailer({ ...newRetailer, contact: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={newRetailer.phone}
                    onChange={(e) => setNewRetailer({ ...newRetailer, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  placeholder="logistics@retailer.com"
                  value={newRetailer.email}
                  onChange={(e) => setNewRetailer({ ...newRetailer, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Location / Hub Zone</label>
                  <input
                    type="text"
                    placeholder="e.g. Boston, MA"
                    value={newRetailer.location}
                    onChange={(e) => setNewRetailer({ ...newRetailer, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Credit Limit (৳)</label>
                  <input
                    type="number"
                    placeholder="150000"
                    value={newRetailer.creditLimit}
                    onChange={(e) => setNewRetailer({ ...newRetailer, creditLimit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Save Retailer to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Modify Agreement & Credit Limit --- */}
      {editingRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/15 p-6 shadow-2xl bg-slate-950/95 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="text-lg font-extrabold text-white">Modify Partner Agreement</h3>
                  <p className="text-xs text-indigo-400 font-bold">{editingRetailer.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingRetailer(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Partnership Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Retailer["status"] })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active" className="bg-slate-950">Active</option>
                    <option value="Under Review" className="bg-slate-950">Under Review</option>
                    <option value="Suspended" className="bg-slate-950">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Performance Grade</label>
                  <select
                    value={editForm.grade}
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value as Retailer["grade"] })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="A+" className="bg-slate-950">A+ (Tier 1)</option>
                    <option value="A" className="bg-slate-950">A (High)</option>
                    <option value="B" className="bg-slate-950">B (Standard)</option>
                    <option value="C" className="bg-slate-950">C (Needs Imp)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Total Sales (৳)</label>
                  <input
                    type="number"
                    value={editForm.totalVolume}
                    onChange={(e) => setEditForm({ ...editForm, totalVolume: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Credit Limit (৳)</label>
                  <input
                    type="number"
                    value={editForm.creditLimit}
                    onChange={(e) => setEditForm({ ...editForm, creditLimit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editForm.contact}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRetailer(null)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Update Terms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Retailer Credit Ledger Statement Modal */}
      <RetailerStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        retailer={targetStatementRetailer}
        orders={orders}
        activeTenantId={activeTenantId}
      />
    </div>
  );
}
