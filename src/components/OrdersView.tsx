"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  ChevronRight, 
  MapPin, 
  Truck, 
  Calendar, 
  User, 
  ExternalLink,
  Plus
} from "lucide-react";

interface Order {
  id: string;
  retailer: string;
  location: string;
  date: string;
  items: string;
  qty: number;
  total: number;
  status: "Pending" | "Processing" | "In Transit" | "Delivered" | "Cancelled";
  carrier: string;
  trackingNum: string;
  eta: string;
}

interface OrdersViewProps {
  orders: Order[];
  searchQuery: string;
  onUpdateOrderStatus: (id: string, status: Order["status"]) => void;
  onOpenOrderModal: () => void;
}

export default function OrdersView({ orders, searchQuery, onUpdateOrderStatus, onOpenOrderModal }: OrdersViewProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");

  // Select first item as default initially
  const defaultSelectedId = orders.length > 0 ? orders[0].id : null;
  const currentSelectedId = selectedOrderId || defaultSelectedId;

  // useMemo for real-time search filtration
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o.retailer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const activeOrder = useMemo(() => {
    return orders.find(o => o.id === currentSelectedId) || orders[0];
  }, [orders, currentSelectedId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-slate-500/10 border-slate-500/20 text-slate-400";
      case "Processing":
        return "bg-purple-500/10 border-purple-500/20 text-purple-400";
      case "In Transit":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "Delivered":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "Cancelled":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      default:
        return "bg-slate-500/10 border-slate-500/20 text-slate-405";
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Order Orchestration</h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Track customer orders, monitor carriers, and oversee supply chain transit states.
          </p>
        </div>
        <button
          onClick={onOpenOrderModal}
          className="flex items-center gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/30 w-fit focus:outline-none"
        >
          <Plus className="h-4 w-4" />
          Process New Sales Order
        </button>
      </div>

      {/* Main Grid: Orders List & Tracking Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Real-time search status */}
            <div className="flex items-center gap-2 text-sm text-slate-450">
              <Search className="h-4 w-4 text-slate-500" />
              {searchQuery ? (
                <span>Filtering: &quot;<strong className="text-indigo-400">{searchQuery}</strong>&quot;</span>
              ) : (
                <span className="text-xs text-slate-500">Navbar search connects here</span>
              )}
            </div>

            {/* Status tabs */}
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-950/40 rounded-xl border border-white/5">
              {["All", "Pending", "Processing", "In Transit", "Delivered"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
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
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/35">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/20">
                    <th className="py-4 px-5">Order ID</th>
                    <th className="py-4 px-5">Retailer</th>
                    <th className="py-4 px-5">Items</th>
                    <th className="py-4 px-5">Value</th>
                    <th className="py-4 px-5">Status Dropdown</th>
                    <th className="py-4 px-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((o) => (
                      <tr 
                        key={o.id} 
                        onClick={() => setSelectedOrderId(o.id)}
                        className={`group cursor-pointer hover:bg-white/5 transition-all duration-300 ${
                          currentSelectedId === o.id ? "bg-indigo-600/10 border-l-4 border-indigo-500" : ""
                        }`}
                      >
                        <td className="py-4 px-5 font-bold text-white tracking-wider text-xs">
                          {o.id}
                          <span className="block font-medium text-slate-500 text-[10px] mt-0.5">{o.date}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-semibold text-slate-200 block">{o.retailer}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {o.location}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-300 font-medium max-w-[150px] truncate">{o.items}</td>
                        <td className="py-4 px-5 font-semibold text-indigo-400">${o.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        
                        {/* Interactive Status Selector Dropdown */}
                        <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <select
                              value={o.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as Order["status"];
                                onUpdateOrderStatus(o.id, newStatus);
                                setSelectedOrderId(o.id);
                              }}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border bg-slate-900/60 focus:outline-none focus:ring-1 focus:ring-indigo-500 select-status cursor-pointer ${getStatusBadge(o.status)}`}
                            >
                              <option value="Pending" className="bg-slate-950 text-slate-400">Pending</option>
                              <option value="Processing" className="bg-slate-950 text-purple-400">Processing</option>
                              <option value="In Transit" className="bg-slate-950 text-blue-400">In Transit</option>
                              <option value="Delivered" className="bg-slate-950 text-emerald-400">Delivered</option>
                              <option value="Cancelled" className="bg-slate-950 text-rose-400">Cancelled</option>
                            </select>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-slate-400 group-hover:text-white text-right">
                          <ChevronRight className="h-4 w-4 inline-block group-hover:translate-x-1 transition-transform" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                        No orders found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Stepper & Tracking Details */}
        {activeOrder ? (
          <div className="glass-panel rounded-2xl border border-white/10 p-6 h-fit space-y-6">
            <div className="border-b border-white/10 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Selected Shipment</span>
                  <h2 className="text-xl font-extrabold text-white mt-1">{activeOrder.id}</h2>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(activeOrder.status)}`}>
                  {activeOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <User className="h-3 w-3" />
                <span>{activeOrder.retailer}</span>
                <span className="text-slate-600">•</span>
                <span>{activeOrder.location}</span>
              </p>
            </div>

            {/* Stepper progress */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shipment Stepper</h3>
              
              <div className="relative pl-8 space-y-6">
                {/* Vertical timeline line */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-800" />

                {/* Step 1: Placed */}
                <div className="relative flex gap-4">
                  <div className={`absolute -left-8 rounded-full h-7 w-7 border-2 flex items-center justify-center text-xs font-bold transition-all ${getStepStatus(0, activeOrder.status)}`}>
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Order Confirmed</h4>
                    <p className="text-xs text-slate-400">Order successfully logged and allocated in Hub.</p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {activeOrder.date}
                    </p>
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className="relative flex gap-4">
                  <div className={`absolute -left-8 rounded-full h-7 w-7 border-2 flex items-center justify-center text-xs font-bold transition-all ${getStepStatus(1, activeOrder.status)}`}>
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Hub Packaging & Verification</h4>
                    <p className="text-xs text-slate-400">Items packed, weighed, and verified for routing.</p>
                  </div>
                </div>

                {/* Step 3: Shipped/In Transit */}
                <div className="relative flex gap-4">
                  <div className={`absolute -left-8 rounded-full h-7 w-7 border-2 flex items-center justify-center text-xs font-bold transition-all ${getStepStatus(2, activeOrder.status)}`}>
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">In Transit</h4>
                    <p className="text-xs text-slate-400">Departed central hub and loaded on carrier vehicle.</p>
                    {activeOrder.status === "In Transit" && (
                      <p className="text-xs text-indigo-400 font-medium mt-1">ETA: {activeOrder.eta}</p>
                    )}
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className="relative flex gap-4">
                  <div className={`absolute -left-8 rounded-full h-7 w-7 border-2 flex items-center justify-center text-xs font-bold transition-all ${getStepStatus(3, activeOrder.status)}`}>
                    4
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Delivered</h4>
                    <p className="text-xs text-slate-400">Package handed over and signed by partner agent.</p>
                    {activeOrder.status === "Delivered" && (
                      <p className="text-xs text-emerald-400 font-medium mt-1">{activeOrder.eta}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Carrier Info */}
            <div className="pt-4 border-t border-white/10 space-y-3 bg-slate-950/20 p-4 rounded-xl border border-white/5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-indigo-400" />
                Transit Partner Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Carrier</span>
                  <span className="font-semibold text-slate-200">{activeOrder.carrier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tracking ID</span>
                  <span className="font-semibold text-indigo-400 tracking-wider flex items-center gap-1 cursor-pointer hover:underline">
                    {activeOrder.trackingNum}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-white/10 p-6 h-[400px] flex items-center justify-center text-slate-500">
            Select an order to view shipment details.
          </div>
        )}

      </div>
    </div>
  );
}
