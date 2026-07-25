"use client";

import { useState, useMemo } from "react";
import { 
  MapPin, 
  Thermometer, 
  MessageSquare, 
  Phone,
  Search,
  Navigation,
  Package,
  Building2,
  Truck,
  CheckCircle2,
  Globe,
  Layers,
  Clock,
  ShieldCheck
} from "lucide-react";

export interface Delivery {
  id: string;
  orderId: string;
  retailer: string;
  driver: string;
  phone: string;
  route: "Alpha" | "Beta" | "Gamma" | "Delta";
  origin: string;
  destination: string;
  currentStep: 1 | 2 | 3 | 4; // 1: Order Placed, 2: Warehouse Dispatched, 3: On the Way, 4: Delivered
  speed: number;
  temp?: number;
  cargo: string;
  eta: string;
  coordinates: { x: number; y: number };
  mapEmbedUrl: string;
}

interface FleetVehicle {
  id: string;
  driver: string;
  phone: string;
  route: "Alpha" | "Beta" | "Gamma" | "Delta";
  origin: string;
  destination: string;
  status: "On Schedule" | "Delayed" | "Completed";
  progress: number;
  speed: number;
  temp?: number;
  cargo: string;
  eta: string;
  coordinates: { x: number; y: number };
}

interface RouteTrackingViewProps {
  fleet?: FleetVehicle[];
  searchQuery: string;
}

export default function RouteTrackingView({ searchQuery }: RouteTrackingViewProps) {
  // Enhanced deliveries data incorporating 4-step transit lifecycle
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: "DEL-8942",
      orderId: "ORD-9842",
      retailer: "Walmart East Hub",
      driver: "Albert Carter",
      phone: "+1 (555) 019-8822",
      route: "Alpha",
      origin: "Central Warehouse A",
      destination: "Walmart East Hub (Boston, MA)",
      currentStep: 3, // On the Way
      speed: 58,
      temp: 34,
      cargo: "Steel Coupler Pins & Assemblies",
      eta: "Today, 14:30",
      coordinates: { x: 288, y: 104 },
      mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-71.12%2C42.30%2C-70.98%2C42.40&layer=mapnik"
    },
    {
      id: "DEL-8943",
      orderId: "ORD-9843",
      retailer: "Target Dist Center",
      driver: "Maria Ramirez",
      phone: "+1 (555) 012-9900",
      route: "Beta",
      origin: "Central Warehouse B",
      destination: "Target Dist Center (Atlanta, GA)",
      currentStep: 2, // Warehouse Dispatched
      speed: 42,
      cargo: "Hydraulic Tubing (A)",
      eta: "Tomorrow, 16:45",
      coordinates: { x: 220, y: 175 },
      mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-84.45%2C33.70%2C-84.30%2C33.80&layer=mapnik"
    },
    {
      id: "DEL-8944",
      orderId: "ORD-9844",
      retailer: "Costco Wholesale #12",
      driver: "Jessica Alba",
      phone: "+1 (555) 014-9988",
      route: "Gamma",
      origin: "Central Warehouse C",
      destination: "Costco Wholesale #12 (Chicago, IL)",
      currentStep: 4, // Delivered
      speed: 0,
      cargo: "Heavy Duty Strut Mounts",
      eta: "Delivered (11:15 AM)",
      coordinates: { x: 420, y: 180 },
      mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-87.70%2C41.80%2C-87.55%2C41.90&layer=mapnik"
    },
    {
      id: "DEL-8945",
      orderId: "ORD-9845",
      retailer: "Kroger Supply Hub",
      driver: "Danielle Vance",
      phone: "+1 (555) 015-1100",
      route: "Delta",
      origin: "Central Warehouse B",
      destination: "Kroger Supply Hub (Houston, TX)",
      currentStep: 1, // Order Placed
      speed: 0,
      cargo: "Synthetic Gear Oil 5L",
      eta: "July 27, 09:00",
      coordinates: { x: 380, y: 85 },
      mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-95.45%2C29.70%2C-95.30%2C29.80&layer=mapnik"
    }
  ]);

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>("DEL-8942");
  const [mapMode, setMapMode] = useState<"vector" | "iframe">("vector");

  // Search filter matching
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => 
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.retailer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.destination.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deliveries, searchQuery]);

  const activeDelivery = useMemo(() => {
    return filteredDeliveries.find(d => d.id === selectedDeliveryId) || filteredDeliveries[0] || deliveries[0];
  }, [filteredDeliveries, deliveries, selectedDeliveryId]);

  // Step status helper
  const steps = [
    { step: 1, title: "Order Placed", desc: "Order details verified & scheduled", icon: Package },
    { step: 2, title: "Warehouse Dispatched", desc: "Freight loaded & left facility", icon: Building2 },
    { step: 3, title: "On the Way", desc: "Driver in transit to destination", icon: Truck },
    { step: 4, title: "Delivered", desc: "Cargo signed & delivered to hub", icon: CheckCircle2 },
  ];

  const handleStepChange = (deliveryId: string, newStep: 1 | 2 | 3 | 4) => {
    setDeliveries(deliveries.map(d => {
      if (d.id === deliveryId) {
        let speed = d.speed;
        let eta = d.eta;
        if (newStep === 4) {
          speed = 0;
          eta = "Delivered (Just Now)";
        } else if (newStep === 3) {
          speed = 58;
          eta = "ETA: 2 hours";
        } else if (newStep === 2) {
          speed = 35;
          eta = "ETA: 5 hours";
        } else if (newStep === 1) {
          speed = 0;
          eta = "Scheduled";
        }

        return {
          ...d,
          currentStep: newStep,
          speed,
          eta
        };
      }
      return d;
    }));
  };

  const getStepBadge = (step: number) => {
    switch (step) {
      case 1: return { label: "Order Placed", style: "bg-slate-500/10 border-slate-500/20 text-slate-300" };
      case 2: return { label: "Warehouse Dispatched", style: "bg-amber-500/10 border-amber-500/20 text-amber-400" };
      case 3: return { label: "On the Way", style: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" };
      case 4: return { label: "Delivered", style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" };
      default: return { label: "Unknown", style: "bg-slate-500/10 border-slate-500/20 text-slate-400" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Delivery & Route Tracking
            <span className="text-xs font-bold uppercase bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/30">
              Live Fleet GPS
            </span>
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Track real-time B2B deliveries, monitor 4-stage dispatch lifecycles, and view driver telemetry routes.
          </p>
        </div>
      </div>

      {/* Main Grid: Deliveries List + Map & Stepper View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Deliveries List */}
        <div className="space-y-4 flex flex-col h-[640px]">
          {/* Search bar helper indicator */}
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/60 border border-white/10 px-3.5 py-2 rounded-xl flex-shrink-0">
            <Search className="h-4 w-4 text-slate-500" />
            {searchQuery ? (
              <span className="truncate">Filter: &quot;<strong className="text-indigo-400">{searchQuery}</strong>&quot; ({filteredDeliveries.length})</span>
            ) : (
              <span className="text-xs text-slate-500">Navbar search filters drivers & orders</span>
            )}
          </div>

          {/* List items scrollable container */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((del) => {
                const badge = getStepBadge(del.currentStep);
                const isSelected = activeDelivery.id === del.id;

                return (
                  <div
                    key={del.id}
                    onClick={() => setSelectedDeliveryId(del.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                      isSelected
                        ? "bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-600/10"
                        : "bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase">{del.id} | {del.orderId}</span>
                        <h3 className="text-sm font-bold text-white mt-0.5">{del.retailer}</h3>
                      </div>
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${badge.style}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-slate-400 space-y-1">
                      <p className="flex items-center gap-1.5 text-slate-300 truncate">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{del.destination}</span>
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Driver: <strong className="text-slate-300">{del.driver}</strong></span>
                        <span className="text-indigo-400 font-semibold">{del.eta}</span>
                      </div>
                    </div>

                    {/* Stepper mini progress indicator bar */}
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden flex gap-0.5">
                        {[1, 2, 3, 4].map((stepNum) => (
                          <div 
                            key={stepNum}
                            className={`flex-1 h-full rounded-full transition-all duration-500 ${
                              del.currentStep >= stepNum
                                ? del.currentStep === 4
                                  ? "bg-emerald-500"
                                  : "bg-indigo-500"
                                : "bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-12 text-slate-500 text-xs font-semibold">No active deliveries match query filter.</p>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Map View + 4-Stage Status Stepper Panel */}
        {activeDelivery ? (
          <div className="lg:col-span-2 flex flex-col space-y-6">
            
            {/* 4-Step Delivery Lifecycle Stepper Card */}
            <div className="glass-panel rounded-2xl border border-white/10 p-6 bg-slate-950/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    Delivery Dispatch Lifecycle (4 Steps)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Order: <strong className="text-white">{activeDelivery.orderId}</strong> | Retailer: <strong className="text-white">{activeDelivery.retailer}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Change Stage:</span>
                  <div className="flex gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
                    {([1, 2, 3, 4] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => handleStepChange(activeDelivery.id, s)}
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                          activeDelivery.currentStep === s
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        Step {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Responsive 4-Step Visual Connector Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {steps.map((s) => {
                  const StepIcon = s.icon;
                  const isPassed = activeDelivery.currentStep >= s.step;
                  const isCurrent = activeDelivery.currentStep === s.step;

                  return (
                    <div 
                      key={s.step} 
                      onClick={() => handleStepChange(activeDelivery.id, s.step as 1 | 2 | 3 | 4)}
                      className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                        isCurrent
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                          : isPassed
                          ? "bg-slate-900/60 border-indigo-500/40 text-slate-200"
                          : "bg-slate-950/40 border-white/5 text-slate-500 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg border ${
                          isCurrent
                            ? "bg-indigo-500 text-white border-indigo-400 animate-pulse"
                            : isPassed
                            ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                            : "bg-slate-900 text-slate-600 border-white/5"
                        }`}>
                          <StepIcon className="h-4 w-4" />
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          isCurrent
                            ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                            : isPassed
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-900 text-slate-600"
                        }`}>
                          {isPassed ? (s.step === activeDelivery.currentStep ? "ACTIVE" : "DONE") : `STEP ${s.step}`}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{s.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map View Panel with Mode Switcher */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-slate-950/50 flex flex-col h-[380px] relative shadow-xl shadow-black/40">
              
              {/* Map Header bar with mode switcher */}
              <div className="px-5 py-3 border-b border-white/10 bg-slate-950/60 flex items-center justify-between z-10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">
                    Live Route GPS Map: {activeDelivery.destination}
                  </span>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setMapMode("vector")}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-lg transition-all ${
                      mapMode === "vector"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="h-3 w-3" />
                    Telemetry Vector Map
                  </button>
                  <button
                    onClick={() => setMapMode("iframe")}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-lg transition-all ${
                      mapMode === "iframe"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Globe className="h-3 w-3" />
                    Satellite GPS Map
                  </button>
                </div>
              </div>

              {/* Map Display Body */}
              <div className="flex-1 relative w-full h-full overflow-hidden">
                {mapMode === "vector" ? (
                  // Mode 1: Interactive Telemetry SVG Map
                  <div className="w-full h-full relative flex items-center justify-center p-4">
                    <svg 
                      className="w-full h-full min-h-[250px]"
                      viewBox="0 0 500 220" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M 60,160 Q 150,80 280,100 T 440,60" 
                        stroke="#6366f1" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        className="animate-dash-line"
                        strokeDasharray="8, 4"
                      />

                      {/* Origin Node */}
                      <circle cx="60" cy="160" r="8" fill="#4f46e5" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="3" />
                      <text x="45" y="180" fill="#a5b4fc" fontSize="8" fontWeight="bold">{activeDelivery.origin}</text>

                      {/* Destination Node */}
                      <circle cx="440" cy="60" r="8" fill="#10b981" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="3" />
                      <text x="400" y="48" fill="#34d399" fontSize="8" fontWeight="bold">{activeDelivery.retailer}</text>

                      {/* Driver Position Pulse Marker */}
                      <g transform={`translate(${activeDelivery.coordinates.x}, ${activeDelivery.coordinates.y})`}>
                        <circle cx="0" cy="0" r="16" fill="#a5b4fc" className="animate-pulse-dot opacity-30" />
                        <circle cx="0" cy="0" r="8" fill="#6366f1" stroke="white" strokeWidth="2" />
                      </g>
                    </svg>

                    {/* Overlay Telemetry HUD */}
                    <div className="absolute top-4 right-4 glass-panel border border-white/10 rounded-xl p-3 w-56 space-y-1.5 bg-slate-950/85 pointer-events-none">
                      <div className="flex justify-between items-center text-[10px] font-bold text-indigo-400">
                        <span>LIVE CARRIER SPEED</span>
                        <span className="text-white">{activeDelivery.speed} mph</span>
                      </div>
                      {activeDelivery.temp !== undefined && (
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>TEMPERATUE</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <Thermometer className="h-3 w-3" />
                            {activeDelivery.temp}°F
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>ASSIGNED ROUTE</span>
                        <span className="text-slate-200 font-bold">Corridor {activeDelivery.route}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Mode 2: Real Google Maps / OpenStreetMap iframe View
                  <div className="w-full h-full relative">
                    <iframe
                      title="Delivery Location Map"
                      src={activeDelivery.mapEmbedUrl}
                      className="w-full h-full border-none filter invert contrast-125 brightness-90 opacity-80"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-2 backdrop-blur-md">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      Encrypted GPS Feed ({activeDelivery.destination})
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Driver Communication Bar */}
              <div className="px-5 py-3 border-t border-white/10 bg-slate-950/60 flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-xs">
                    {activeDelivery.driver.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Carrier Driver</span>
                    <p className="text-xs font-bold text-white">{activeDelivery.driver}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={`tel:${activeDelivery.phone}`}
                    className="flex items-center gap-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Phone className="h-3.5 w-3.5 text-indigo-400" />
                    Call
                  </a>
                  <button className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-all shadow-md shadow-indigo-600/20">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Ping Driver
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 p-6 h-[640px] flex items-center justify-center text-slate-500">
            No active deliveries selected.
          </div>
        )}

      </div>
    </div>
  );
}
