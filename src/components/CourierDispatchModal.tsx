"use client";

import React, { useState, useMemo } from "react";
import { X, Send, Truck, Code2, Check, Copy, ShieldCheck, Package } from "lucide-react";
import { 
  CourierProvider, 
  CourierDispatchConfig, 
  generateCourierPayload, 
  simulateCourierDispatch 
} from "@/lib/courierService";

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

interface CourierDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onDispatchSuccess: (orderId: string, carrier: string, trackingNum: string, eta: string) => void;
  addToast?: (type: "success" | "error" | "info" | "warning", title: string, message?: string) => void;
}

export default function CourierDispatchModal({
  isOpen,
  onClose,
  order,
  onDispatchSuccess,
  addToast,
}: CourierDispatchModalProps) {
  const [provider, setProvider] = useState<CourierProvider>("Steadfast");
  const [activeTab, setActiveTab] = useState<"configure" | "payload">("configure");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("+880 1711-000000");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [districtOrCity, setDistrictOrCity] = useState("Dhaka");
  const [codAmount, setCodAmount] = useState(0);
  const [weightKg, setWeightKg] = useState(1.5);
  const [specialInstruction, setSpecialInstruction] = useState("Handle with care - Fragile logistics component");

  // Sync state when order changes or modal opens
  React.useEffect(() => {
    if (order) {
      setRecipientName(order.retailer);
      setRecipientAddress(order.location);
      setCodAmount(order.total);
    }
  }, [order]);

  const dispatchConfig: CourierDispatchConfig = useMemo(() => {
    return {
      provider,
      orderId: order?.id || "ORD-0000",
      recipientName: recipientName || order?.retailer || "Retailer Partner",
      recipientPhone,
      recipientAddress: recipientAddress || order?.location || "Dhaka, Bangladesh",
      districtOrCity,
      codAmount,
      weightKg,
      itemDescription: order?.items || "Supply Chain Cargo Items",
      specialInstruction,
    };
  }, [provider, order, recipientName, recipientPhone, recipientAddress, districtOrCity, codAmount, weightKg, specialInstruction]);

  const jsonPayload = useMemo(() => {
    return generateCourierPayload(dispatchConfig);
  }, [dispatchConfig]);

  if (!isOpen || !order) return null;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = async () => {
    try {
      setIsSubmitting(true);
      const result = await simulateCourierDispatch(dispatchConfig);
      if (result.success) {
        onDispatchSuccess(
          order.id,
          `${result.provider} Express`,
          result.trackingNumber,
          result.estimatedDelivery
        );
        if (addToast) {
          addToast(
            "success",
            `Dispatched via ${result.provider} API!`,
            `Tracking ID: ${result.trackingNumber}`
          );
        }
        onClose();
      }
    } catch (err: unknown) {
      console.error(err);
      if (addToast) {
        addToast("error", "Courier Dispatch Failed", "Could not connect to courier gateway.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                1-Click Courier Dispatch
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  API Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">Order: <strong className="text-indigo-400">{order.id}</strong> • {order.retailer}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Courier Provider Selector Pills */}
        <div className="px-6 py-3 bg-slate-950/20 border-b border-white/5 flex items-center justify-between gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Courier API Gateway:</span>
          <div className="flex gap-1.5">
            {(["Steadfast", "Pathao", "RedX", "Paperfly"] as CourierProvider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  provider === p
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {p} API
              </button>
            ))}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/40 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("configure")}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "configure"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Package className="h-4 w-4" />
            Payload Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payload")}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "payload"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Code2 className="h-4 w-4" />
            JSON Request Body Preview
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === "configure" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Recipient / Business Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Recipient Contact Phone</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Destination City / Zone</label>
                <select
                  value={districtOrCity}
                  onChange={(e) => setDistrictOrCity(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Dhaka">Dhaka (Central Metro)</option>
                  <option value="Chittagong">Chittagong (Port Hub)</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Gazipur">Gazipur</option>
                  <option value="Narayanganj">Narayanganj</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Cash on Delivery (COD Amount ৳)</label>
                <input
                  type="number"
                  value={codAmount}
                  onChange={(e) => setCodAmount(Number(e.target.value))}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Delivery Address</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Parcel Weight (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Special Instruction / Note</label>
                <input
                  type="text"
                  value={specialInstruction}
                  onChange={(e) => setSpecialInstruction(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-mono">POST /api/v1/courier/dispatch ({provider})</span>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied JSON" : "Copy Payload"}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                {JSON.stringify(jsonPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Secure Webhook Authentication Active</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispatch}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Dispatch via {provider}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
