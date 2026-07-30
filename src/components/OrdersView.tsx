"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  ChevronRight, 
  MapPin, 
  Truck, 
  Calendar, 
  User, 
  ExternalLink,
  Plus,
  Trash2,
  Send,
  Printer,
  DollarSign,
  ShoppingBag,
  Building2,
  TrendingUp,
  Clock
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboard, Order } from "@/context/DashboardContext";
import CourierDispatchModal from "./CourierDispatchModal";
import InvoiceLabelModal from "./InvoiceLabelModal";

interface OrdersViewProps {
  orders: Order[];
  searchQuery: string;
  onUpdateOrderStatus: (id: string, status: Order["status"], carrier?: string, trackingNum?: string, eta?: string) => void;
  onOpenOrderModal: () => void;
}

export default function OrdersView({ orders, searchQuery, onUpdateOrderStatus, onOpenOrderModal }: OrdersViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  const { isAdmin, activeTenantId, deleteOrder, addToast } = useDashboard();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [targetPrintOrder, setTargetPrintOrder] = useState<Order | null>(null);

  // Select first item as default initially
  const defaultSelectedId = orders.length > 0 ? orders[0].id : null;
  const currentSelectedId = selectedOrderId || defaultSelectedId;

  // --- FILTERED ORDERS ---
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o.retailer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === "pending") matchesTab = o.status === "Pending";
      else if (activeTab === "dispatched" || activeTab === "dispatch" || activeTab === "in_transit") matchesTab = o.status === "Processing" || o.status === "In Transit";
      else if (activeTab === "delivered") matchesTab = o.status === "Delivered";
      else if (activeTab === "returned" || activeTab === "cancelled" || activeTab === "labels") matchesTab = o.status === "Cancelled" || o.status === "Pending";
      else if (statusFilter !== "All") matchesTab = o.status === statusFilter;

      return matchesSearch && matchesTab;
    });
  }, [orders, searchQuery, statusFilter, activeTab]);

  const activeOrder = useMemo(() => {
    return orders.find(o => o.id === currentSelectedId) || orders[0];
  }, [orders, currentSelectedId]);

  // --- COMMERCIAL KPI CALCULATIONS ---
  const pendingProcessingCount = useMemo(() => {
    return orders.filter(o => o.status === "Pending" || o.status === "Processing").length;
  }, [orders]);

  const inTransitCount = useMemo(() => {
    return orders.filter(o => o.status === "In Transit").length;
  }, [orders]);

  const totalFulfilledRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== "Cancelled")
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  // --- STYLING HELPERS ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "Processing":
        return "bg-purple-500/10 border-purple-500/30 text-purple-400";
      case "In Transit":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "Delivered":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "Cancelled":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-400";
    }
  };

  const getStepStatus = (currentStep: number, orderStatus: string) => {
    const steps = ["Pending", "Processing", "In Transit", "Delivered"];
    const currentIdx = steps.indexOf(orderStatus);

    if (orderStatus === "Cancelled") return "bg-rose-950/40 text-rose-400 border-rose-900";
    if (currentIdx >= currentStep) {
      return "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30";
    }
    return "bg-slate-900 border-white/10 text-slate-500";
  };

  // --- HANDLERS ---
  const handleCourierDispatchSuccess = (
    orderId: string,
    carrier: string,
    trackingNum: string,
    eta: string
  ) => {
    onUpdateOrderStatus(orderId, "In Transit", carrier, trackingNum, eta);
    addToast("success", "Dispatched to Courier", `Order ${orderId} assigned to ${carrier} (${trackingNum})`);
  };

  const handleOpenPrintInvoice = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetPrintOrder(order);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 rounded-3xl border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-1">
            <ShoppingBag className="h-4 w-4" />
            <span>Omnichannel Order Orchestration Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            B2B Commercial Sales & Fulfillment
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Monitor purchase order pipelines, dispatch integrated couriers (Steadfast/Pathao), and generate printable invoices.
          </p>
        </div>

        {/* Controls: Tenant Badge + Process New Sales Order */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-extrabold text-indigo-300">
            <Building2 className="h-4 w-4" />
            <span>Tenant: {activeTenantId || "CLI-101"}</span>
          </div>

          <button
            onClick={onOpenOrderModal}
            className="flex items-center gap-2 text-xs font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Process New Sales Order
          </button>
        </div>
      </div>

      {/* Dynamic Status Sub-Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/10 rounded-2xl overflow-x-auto custom-scrollbar text-xs font-bold">
        <button
          onClick={() => router.push("/orders?tab=all")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "all"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5"
          }`}
        >
          All Orders ({orders.length})
        </button>

        <button
          onClick={() => router.push("/orders?tab=pending")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "pending"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5"
          }`}
        >
          Pending ({orders.filter(o => o.status === "Pending").length})
        </button>

        <button
          onClick={() => router.push("/orders?tab=dispatched")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "dispatched" || activeTab === "dispatch" || activeTab === "in_transit"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5"
          }`}
        >
          Dispatched & In-Transit ({orders.filter(o => o.status === "Processing" || o.status === "In Transit").length})
        </button>

        <button
          onClick={() => router.push("/orders?tab=delivered")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "delivered"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5"
          }`}
        >
          Delivered ({orders.filter(o => o.status === "Delivered").length})
        </button>

        <button
          onClick={() => router.push("/orders?tab=returned")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "returned" || activeTab === "cancelled"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5"
          }`}
        >
          Returned / Cancelled ({orders.filter(o => o.status === "Cancelled").length})
        </button>
      </div>

      {/* 4 Commercial Order Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders Count */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Orders Pipeline</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{orders.length}</span>
            <span className="text-xs font-bold text-slate-400">orders logged</span>
          </div>
          <div className="mt-2 text-xs text-indigo-400 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Active B2B Sales Pipeline</span>
          </div>
        </div>

        {/* Pending & Processing Action Count */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Pending Dispatch Action</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300">{pendingProcessingCount}</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Requires Dispatch</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">Orders awaiting warehouse packing</div>
        </div>

        {/* In-Transit Parcels */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>In-Transit Parcels</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{inTransitCount}</span>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">On the Way</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">Live courier delivery telemetry</div>
        </div>

        {/* Total Fulfilled Revenue */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Fulfilled Sales Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">৳ {totalFulfilledRevenue.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-semibold">Gross sales total</div>
        </div>
      </div>

      {/* Main Grid: Orders List & Tracking Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Orders List & Filters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
            {/* Real-time search status */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Search className="h-4 w-4 text-indigo-400" />
              {searchQuery ? (
                <span className="text-xs">Filtering orders: &quot;<strong className="text-indigo-400">{searchQuery}</strong>&quot; ({filteredOrders.length} results)</span>
              ) : (
                <span className="text-xs text-slate-400">Search by Order ID, Retailer, or Item SKU</span>
              )}
            </div>

            {/* Fast Filter Status tabs */}
            <div className="flex gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-900 rounded-xl border border-white/10">
              {["All", "Pending", "Processing", "In Transit", "Delivered", "Cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    statusFilter === status 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table Container */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider bg-slate-950/30 text-[10px]">
                    <th className="py-4 px-5">Order ID & Date</th>
                    <th className="py-4 px-5">Retailer Partner</th>
                    <th className="py-4 px-5">Items Summary</th>
                    <th className="py-4 px-5">Billing Value</th>
                    <th className="py-4 px-5">Fulfillment Status</th>
                    <th className="py-4 px-5 text-right">Invoice & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((o) => (
                      <tr 
                        key={o.id} 
                        onClick={() => setSelectedOrderId(o.id)}
                        className={`group cursor-pointer hover:bg-white/5 transition-all duration-200 ${
                          currentSelectedId === o.id ? "bg-indigo-600/10 border-l-4 border-indigo-500" : ""
                        }`}
                      >
                        <td className="py-4 px-5 font-black text-white tracking-wider text-xs">
                          {o.id}
                          <span className="block font-medium text-slate-500 text-[10px] mt-0.5">{o.date}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-200 block">{o.retailer}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {o.location}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-300 font-semibold max-w-[140px] truncate">
                          {o.items} ({o.qty} units)
                        </td>
                        
                        <td className="py-4 px-5 font-black text-indigo-400">
                          ৳ {o.total.toLocaleString()}
                        </td>
                        
                        {/* Interactive Status Selector Dropdown */}
                        <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={o.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as Order["status"];
                              onUpdateOrderStatus(o.id, newStatus);
                              setSelectedOrderId(o.id);
                              addToast("info", "Order Status Updated", `${o.id} updated to ${newStatus}`);
                            }}
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border bg-slate-900 focus:outline-none cursor-pointer ${getStatusBadge(o.status)}`}
                          >
                            <option value="Pending" className="bg-slate-950 text-amber-400">Pending</option>
                            <option value="Processing" className="bg-slate-950 text-purple-400">Processing</option>
                            <option value="In Transit" className="bg-slate-950 text-blue-400">In Transit</option>
                            <option value="Delivered" className="bg-slate-950 text-emerald-400">Delivered</option>
                            <option value="Cancelled" className="bg-slate-950 text-rose-400">Cancelled</option>
                          </select>
                        </td>

                        <td className="py-4 px-5 text-slate-400 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {/* Print Invoice & Shipping Label Button */}
                            <button
                              onClick={(e) => handleOpenPrintInvoice(o, e)}
                              title="Print Invoice & Shipping Label"
                              className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 font-bold text-[10px] flex items-center gap-1"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>Invoice</span>
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete order ${o.id}?`)) {
                                    deleteOrder(o.id);
                                    addToast("info", "Order Deleted", `Removed ${o.id}`);
                                  }
                                }}
                                title="Delete Order (Admin Only)"
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold text-xs">
                        No orders found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Stepper & Courier Dispatch Card */}
        {activeOrder ? (
          <div className="glass-panel rounded-3xl border border-white/10 p-6 h-fit space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">Active Shipment Inspection</span>
                  <h2 className="text-xl font-black text-white mt-0.5">{activeOrder.id}</h2>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusBadge(activeOrder.status)}`}>
                  {activeOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span className="font-bold text-slate-200">{activeOrder.retailer}</span>
                <span className="text-slate-600">•</span>
                <span>{activeOrder.location}</span>
              </p>
            </div>

            {/* Stepper progress */}
            <div className="space-y-5">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">4-Stage Dispatch Lifecycle</h3>
              
              <div className="relative pl-8 space-y-5">
                {/* Vertical timeline line */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-800" />

                {/* Step 1: Placed */}
                <div className="relative flex gap-3">
                  <div className={`absolute -left-8 rounded-full h-7 w-7 border-2 flex items-center justify-center text-xs font-black transition-all ${getStepStatus(0, activeOrder.status)}`}>
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Order Confirmed</h4>
                    <p className="text-[11px] text-slate-400">Allocated in Central Hub inventory.</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {activeOrder.date}
                    </p>
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className="relative flex gap-3">
                  <div className={`absolute -left-8 rounded-full h-7 w-7 border-2 flex items-center justify-center text-xs font-black transition-all ${getStepStatus(1, activeOrder.status)}`}>
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Hub Packaging & Verification</h4>
                    <p className="text-[11px] text-slate-400">Items packed, weighed & invoice attached.</p>
                  </div>
                </div>

                {/* Step 3: Shipped/In Transit */}
                <div className="relative flex gap-3">
                  <div className={`absolute -left-8 rounded-full h-7 w-7 border-2 flex items-center justify-center text-xs font-black transition-all ${getStepStatus(2, activeOrder.status)}`}>
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">In Transit (Courier Gateway)</h4>
                    <p className="text-[11px] text-slate-400">Loaded on transit vehicle.</p>
                    {activeOrder.status === "In Transit" && (
                      <p className="text-xs text-indigo-400 font-bold mt-0.5">ETA: {activeOrder.eta}</p>
                    )}
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className="relative flex gap-3">
                  <div className={`absolute -left-8 rounded-full h-7 w-7 border-2 flex items-center justify-center text-xs font-black transition-all ${getStepStatus(3, activeOrder.status)}`}>
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Delivered & Signed</h4>
                    <p className="text-[11px] text-slate-400">Handed over to retailer purchasing agent.</p>
                    {activeOrder.status === "Delivered" && (
                      <p className="text-xs text-emerald-400 font-bold mt-0.5">{activeOrder.eta}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Carrier Details & 1-Click Courier Dispatch */}
            <div className="pt-4 border-t border-white/10 space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-indigo-400" />
                  Courier Integration
                </h4>
                <button
                  onClick={() => setIsCourierModalOpen(true)}
                  className="flex items-center gap-1.5 text-[11px] font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-3 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  Dispatch to Courier
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Carrier Gateway</span>
                  <span className="font-bold text-slate-200">{activeOrder.carrier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Tracking Consignment ID</span>
                  <span className="font-bold text-indigo-400 font-mono flex items-center gap-1 cursor-pointer hover:underline">
                    {activeOrder.trackingNum}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Print Invoice Button in Sidebar */}
            <button
              onClick={(e) => handleOpenPrintInvoice(activeOrder, e)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-xs transition-colors"
            >
              <Printer className="h-4 w-4 text-indigo-400" />
              <span>Generate Printable Invoice & Label</span>
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-white/10 p-6 h-[400px] flex items-center justify-center text-slate-500 text-xs font-semibold">
            Select an order to view shipment telemetry.
          </div>
        )}

      </div>

      {/* Courier Dispatch Modal */}
      <CourierDispatchModal
        isOpen={isCourierModalOpen}
        onClose={() => setIsCourierModalOpen(false)}
        order={activeOrder}
        onDispatchSuccess={handleCourierDispatchSuccess}
        addToast={addToast}
      />

      {/* Printable Invoice & Shipping Label Modal */}
      <InvoiceLabelModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={targetPrintOrder}
        activeTenantId={activeTenantId}
      />
    </div>
  );
}
