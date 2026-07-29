"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { ToastMessage, ToastType } from "@/components/Toast";
import {
  fetchSupabaseInventory,
  fetchSupabaseOrders,
  fetchSupabaseRetailers,
  fetchSupabaseClients,
  insertSupabaseInventoryItem,
  updateSupabaseInventoryQty,
  deleteSupabaseInventoryItem,
  insertSupabaseOrder,
  updateSupabaseOrderStatus,
  deleteSupabaseOrder,
  insertSupabaseRetailer,
  updateSupabaseRetailer,
  deleteSupabaseRetailer,
  insertSupabaseClient,
  updateSupabaseClientStatus,
  deleteSupabaseClient,
  seedSupabaseData,
  isSupabaseConfigured,
} from "@/lib/supabaseService";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "user" | "super_admin" | "retailer" | "driver" | "dealer" | "warehouse";

// Types
export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  location: string;
  qty: number;
  minRequired: number;
  unitPrice: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface Order {
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

export interface Retailer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalVolume: number;
  onTimeRate: number;
  status: "Active" | "Under Review" | "Suspended";
  grade: "A+" | "A" | "B" | "C";
  creditLimit?: number;
  outstandingBalance?: number;
}

export interface FleetVehicle {
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

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "inventory" | "order" | "retailer";
}

export interface ClientBusiness {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  plan: "Starter" | "Professional" | "Enterprise";
  maxUsers: number;
  activeUsers: number;
  status: "Active" | "Pending" | "Suspended";
  mrr: number;
  createdAt: string;
}

interface DashboardContextType {
  userRole: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  activeTenantId: string | null;
  setUserRole: (role: UserRole) => Promise<void>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  orders: Order[];
  retailers: Retailer[];
  fleet: FleetVehicle[];
  activityLogs: ActivityLog[];
  clients: ClientBusiness[];
  setClients: React.Dispatch<React.SetStateAction<ClientBusiness[]>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: (open: boolean) => void;
  upgradeReason: string;
  triggerUpgradeModal: (reason: string) => void;
  unreadNotificationsCount: number;
  markNotificationsAsRead: () => void;
  isLoading: boolean;
  isSupabaseLive: boolean;
  isSeeding: boolean;
  loadSupabaseData: (isInitial?: boolean) => Promise<void>;
  seedDatabase: () => Promise<void>;
  addSku: (item: Omit<InventoryItem, "status">) => void;
  restockSku: (sku: string) => void;
  deleteSku: (sku: string) => void;
  updateOrderStatus: (id: string, status: Order["status"], carrier?: string, trackingNum?: string, eta?: string) => void;
  createOrder: (retailerName: string, itemsList: { sku: string; qty: number }[]) => void;
  deleteOrder: (id: string) => void;
  addRetailer: (retailer: Partial<Retailer>) => void;
  updateRetailer: (id: string, updates: Partial<Retailer>) => void;
  deleteRetailer: (id: string) => void;
  addClientBusiness: (client: Omit<ClientBusiness, "id" | "activeUsers" | "createdAt" | "mrr">) => void;
  toggleClientStatus: (id: string) => void;
  deleteClientBusiness: (id: string) => void;
  toasts: ToastMessage[];
  addToast: (type: ToastType, title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Initial fallback mock data
const initialMockInventory: InventoryItem[] = [
  { sku: "SKU-4912", name: "Steel Coupler Pins", category: "Hardware", location: "Warehouse A (Aisle 4)", qty: 4, minRequired: 25, unitPrice: 8.50, status: "Low Stock" },
  { sku: "SKU-8920", name: "Hydraulic Tubing (A)", category: "Fluid Power", location: "Warehouse B (Aisle 2)", qty: 12, minRequired: 30, unitPrice: 22.00, status: "Low Stock" },
  { sku: "SKU-3120", name: "Microchips H1-V2", category: "Electronics", location: "Warehouse A (Aisle 1)", qty: 50, minRequired: 100, unitPrice: 45.00, status: "Low Stock" },
  { sku: "SKU-1029", name: "Brake Seals 10mm", category: "Hardware", location: "Warehouse A (Aisle 5)", qty: 22, minRequired: 40, unitPrice: 12.30, status: "Low Stock" },
  { sku: "SKU-5011", name: "Heavy Duty Strut Mounts", category: "Suspension", location: "Warehouse C (Aisle 12)", qty: 125, minRequired: 50, unitPrice: 65.00, status: "In Stock" },
  { sku: "SKU-6789", name: "LED Signal Bulbs 12V", category: "Electrical", location: "Warehouse B (Aisle 8)", qty: 400, minRequired: 150, unitPrice: 4.20, status: "In Stock" },
  { sku: "SKU-7721", name: "Fibre Optic Splice Tray", category: "Telecom", location: "Warehouse C (Aisle 2)", qty: 0, minRequired: 10, unitPrice: 35.00, status: "Out of Stock" },
  { sku: "SKU-8822", name: "Synthetic Gear Oil 5L", category: "Chemicals", location: "Warehouse B (Aisle 15)", qty: 85, minRequired: 20, unitPrice: 29.99, status: "In Stock" },
];

const initialMockOrders: Order[] = [
  { id: "ORD-9842", retailer: "Walmart East Hub", location: "Boston, MA", date: "2026-07-24", items: "Steel Coupler Pins (x500), Brake Seals (x200)", qty: 700, total: 6710.00, status: "In Transit", carrier: "FedEx Freight", trackingNum: "FX-9081249-A", eta: "Today, 14:30" },
  { id: "ORD-9843", retailer: "Target Dist Center", location: "Atlanta, GA", date: "2026-07-23", items: "Hydraulic Tubing (x100), Steel Coupler Pins (x50)", qty: 150, total: 2625.00, status: "In Transit", carrier: "DHL Supply Chain", trackingNum: "DH-119283-GA", eta: "Tomorrow, 16:45" },
  { id: "ORD-9844", retailer: "Costco Wholesale #12", location: "Chicago, IL", date: "2026-07-22", items: "Heavy Duty Strut Mounts (x80)", qty: 80, total: 5200.00, status: "Delivered", carrier: "Swift Cargo", trackingNum: "SW-88290-IL", eta: "Delivered (July 24)" },
  { id: "ORD-9845", retailer: "Kroger Supply Hub", location: "Houston, TX", date: "2026-07-22", items: "Synthetic Gear Oil 5L (x150)", qty: 150, total: 4498.50, status: "Processing", carrier: "LogiLink Local", trackingNum: "LL-TX-092-B", eta: "July 27, 09:00" },
  { id: "ORD-9846", retailer: "Amazon FC MD-3", location: "Baltimore, MD", date: "2026-07-25", items: "Microchips H1-V2 (x200), LED Signal Bulbs (x500)", qty: 700, total: 11100.00, status: "Pending", carrier: "FedEx Freight", trackingNum: "Pending Dispatch", eta: "TBD" },
];

const initialMockRetailers: Retailer[] = [
  { id: "RET-01", name: "Walmart East Hub", contact: "Sarah Jenkins", email: "sjenks@walmart.com", phone: "+1 (555) 019-2834", location: "Boston, MA", totalOrders: 342, totalVolume: 512000, onTimeRate: 98.8, status: "Active", grade: "A+" },
  { id: "RET-02", name: "Target Dist Center", contact: "Marcus Aurelius", email: "m.aurelius@target.com", phone: "+1 (555) 012-9843", location: "Atlanta, GA", totalOrders: 198, totalVolume: 295000, onTimeRate: 96.2, status: "Active", grade: "A" },
  { id: "RET-03", name: "Costco Wholesale #12", contact: "Jessica Alba", email: "j.alba@costco.com", phone: "+1 (555) 014-9988", location: "Chicago, IL", totalOrders: 154, totalVolume: 210000, onTimeRate: 94.5, status: "Active", grade: "B" },
  { id: "RET-04", name: "Kroger Supply Hub", contact: "Danielle Vance", email: "d.vance@kroger.com", phone: "+1 (555) 015-1100", location: "Houston, TX", totalOrders: 92, totalVolume: 125000, onTimeRate: 99.1, status: "Active", grade: "A+" },
  { id: "RET-05", name: "Amazon FC MD-3", contact: "Sanjay Patel", email: "spatel@amazon.com", phone: "+1 (555) 018-4422", location: "Baltimore, MD", totalOrders: 510, totalVolume: 920000, onTimeRate: 97.5, status: "Active", grade: "A" },
];

const initialActivityLogs: ActivityLog[] = [
  { id: "log-1", title: "Order ORD-9846 Dispatched", description: "Created new shipment for Amazon FC MD-3", timestamp: "10 mins ago", type: "order" },
  { id: "log-2", title: "Inventory Replenishment", description: "Steel Coupler Pins (SKU-4912) restocked (+50 units)", timestamp: "25 mins ago", type: "inventory" },
  { id: "log-3", title: "Transit Status Updated", description: "ORD-9842 marked as In Transit with FedEx Freight", timestamp: "1 hour ago", type: "order" },
  { id: "log-4", title: "Retailer Agreement Created", description: "Walmart East Hub added to active partner network", timestamp: "3 hours ago", type: "retailer" },
];

const initialMockClients: ClientBusiness[] = [
  {
    id: "CLI-101",
    name: "Apex Global Logistics",
    ownerName: "Sarah Jenkins",
    ownerEmail: "sarah@apexlogistics.com",
    plan: "Enterprise",
    maxUsers: 50,
    activeUsers: 28,
    status: "Active",
    mrr: 250000,
    createdAt: "2026-01-15",
  },
  {
    id: "CLI-102",
    name: "Titan Supply Chain Solutions",
    ownerName: "Marcus Aurelius",
    ownerEmail: "marcus@titansupply.io",
    plan: "Professional",
    maxUsers: 20,
    activeUsers: 14,
    status: "Active",
    mrr: 95000,
    createdAt: "2026-03-02",
  },
  {
    id: "CLI-103",
    name: "Horizon Express Hubs",
    ownerName: "Jessica Alba",
    ownerEmail: "horizon@freightnet.com",
    plan: "Starter",
    maxUsers: 5,
    activeUsers: 3,
    status: "Pending",
    mrr: 35000,
    createdAt: "2026-06-18",
  },
  {
    id: "CLI-104",
    name: "Vanguard Transports Inc",
    ownerName: "Devon Vance",
    ownerEmail: "devon@vanguardlogistics.org",
    plan: "Enterprise",
    maxUsers: 50,
    activeUsers: 41,
    status: "Suspended",
    mrr: 250000,
    createdAt: "2025-11-04",
  },
];

const MASTER_SUPER_ADMIN_EMAIL = "rakibhasanmd457@gmail.com";

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  // Toast State Management
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const userPrimaryEmail = (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ""
  ).toLowerCase();

  const isMasterSuperAdmin = userPrimaryEmail === MASTER_SUPER_ADMIN_EMAIL;

  // Synchronously initialize localRoleOverride from localStorage to prevent role glitch on refresh
  const [localRoleOverride, setLocalRoleOverride] = useState<UserRole | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userRole") as UserRole | null;
      if (saved && (saved === "admin" || saved === "user" || saved === "super_admin")) {
        return saved;
      }
    }
    return null;
  });

  // Determine user role from Clerk publicMetadata, unsafeMetadata, or master super admin status
  const publicRole = (user?.publicMetadata?.role as UserRole);
  const unsafeRole = (user?.unsafeMetadata?.role as UserRole);

  const rawClerkRole: UserRole = isMasterSuperAdmin
    ? "super_admin"
    : (publicRole || unsafeRole || "admin");

  let effectiveRole: UserRole = localRoleOverride !== null ? localRoleOverride : rawClerkRole;

  // STRICT MASTER EMAIL SUPER ADMIN LOCK: ONLY 'rakibhasanmd457@gmail.com' can hold super_admin
  if (!isMasterSuperAdmin) {
    if (effectiveRole === "super_admin") {
      const fallbackRole = publicRole && publicRole !== "super_admin" ? publicRole : "admin";
      effectiveRole = fallbackRole;
    }
  }

  const userRole: UserRole = effectiveRole;
  const isAdmin = userRole === "admin" || (isMasterSuperAdmin && userRole === "super_admin");
  const isSuperAdmin = isMasterSuperAdmin && userRole === "super_admin";

  // Cleanup Effect: Clear out legacy 'super_admin' roles from localStorage & unsafeMetadata for non-master emails
  useEffect(() => {
    if (!user) return;
    const email = (
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress ||
      ""
    ).toLowerCase();

    if (email && email !== MASTER_SUPER_ADMIN_EMAIL) {
      if (typeof window !== "undefined") {
        const savedRole = localStorage.getItem("userRole");
        if (savedRole === "super_admin") {
          const resetRole = (user.publicMetadata?.role as UserRole) || "user";
          localStorage.setItem("userRole", resetRole);
          setLocalRoleOverride(resetRole);
        }
      }
    }
  }, [user]);

  const setUserRole = useCallback(async (role: UserRole) => {
    const email = (
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      ""
    ).toLowerCase();
    const isMaster = email === MASTER_SUPER_ADMIN_EMAIL;

    // Never assign super_admin to non-master emails
    const targetRole: UserRole = (!isMaster && role === "super_admin") ? "admin" : role;

    setLocalRoleOverride(targetRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", targetRole);
    }
    addToast("info", "Role Context Switch", `Switched active portal view to ${targetRole.toUpperCase().replace("_", " ")}`);
  }, [user, addToast]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const [inventory, setInventory] = useState<InventoryItem[]>(initialMockInventory);
  const [orders, setOrders] = useState<Order[]>(initialMockOrders);
  const [retailers, setRetailers] = useState<Retailer[]>(initialMockRetailers);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [clients, setClients] = useState<ClientBusiness[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("logilink_clients");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error("Error reading logilink_clients from localStorage:", e);
        }
      }
    }
    return initialMockClients;
  });

  const triggerUpgradeModal = (reason: string) => {
    setUpgradeReason(reason);
    setIsUpgradeModalOpen(true);
  };

  const markNotificationsAsRead = useCallback(() => {
    setUnreadNotificationsCount(0);
    addToast("info", "Notifications Cleared", "All activity alerts marked as read");
  }, [addToast]);

  const addLog = useCallback((title: string, description: string, type: ActivityLog["type"]) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      title,
      description,
      timestamp: "Just now",
      type,
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 15)]);
    setUnreadNotificationsCount(prev => prev + 1);
  }, []);

  // Determine active tenantId from Clerk metadata or localStorage
  const userTenantId = (user?.publicMetadata?.tenantId as string) || (user?.unsafeMetadata?.tenantId as string) || null;
  const activeTenantId = isSuperAdmin ? null : userTenantId;

  // Load live data from Supabase
  const loadSupabaseData = useCallback(async (isInitial = false) => {
    if (!isSupabaseConfigured()) {
      if (isInitial) setIsLoading(false);
      return;
    }

    try {
      const fetchPromise = Promise.all([
        fetchSupabaseInventory(activeTenantId || undefined),
        fetchSupabaseOrders(activeTenantId || undefined),
        fetchSupabaseRetailers(activeTenantId || undefined),
        fetchSupabaseClients(),
      ]);

      let results;
      if (isInitial) {
        const minDelayPromise = new Promise(resolve => setTimeout(resolve, 600));
        [results] = await Promise.all([fetchPromise, minDelayPromise]);
      } else {
        results = await fetchPromise;
      }

      const [remoteInv, remoteOrd, remoteRet, remoteCli] = results;

      // Clean Workspace Enforcement: If an active tenant is set, populate strictly isolated records (or [] if 0 records exist)
      if (activeTenantId) {
        setInventory(remoteInv || []);
        setOrders(remoteOrd || []);
        setRetailers(remoteRet || []);
        if (remoteInv !== null || remoteOrd !== null || remoteRet !== null) {
          setIsSupabaseLive(true);
        }
      } else {
        // Global / Super Admin fallback
        if (remoteInv && remoteInv.length > 0) {
          setInventory(remoteInv);
          setIsSupabaseLive(true);
        }
        if (remoteOrd && remoteOrd.length > 0) {
          setOrders(remoteOrd);
          setIsSupabaseLive(true);
        }
        if (remoteRet && remoteRet.length > 0) {
          setRetailers(remoteRet);
          setIsSupabaseLive(true);
        }
      }

      if (remoteCli && remoteCli.length > 0) {
        setClients(prev => {
          const map = new Map<string, ClientBusiness>();
          remoteCli.forEach(c => map.set(c.id, c));
          prev.forEach(c => {
            if (!map.has(c.id)) map.set(c.id, c);
          });
          const merged = Array.from(map.values());
          if (typeof window !== "undefined") {
            localStorage.setItem("logilink_clients", JSON.stringify(merged));
          }
          return merged;
        });
        setIsSupabaseLive(true);
      } else if (typeof window !== "undefined") {
        const saved = localStorage.getItem("logilink_clients");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setClients(parsed);
            }
          } catch (e) {
            console.error("Error reading logilink_clients fallback:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error loading Supabase data:", error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [activeTenantId]);

  const addClientBusiness = useCallback(async (clientData: Omit<ClientBusiness, "id" | "activeUsers" | "createdAt" | "mrr">) => {
    const planMrrMap: Record<string, number> = {
      Starter: 35000,
      Professional: 95000,
      Enterprise: 250000,
    };

    const newClient: ClientBusiness = {
      ...clientData,
      id: `CLI-${Date.now().toString().slice(-4)}`,
      activeUsers: 1,
      mrr: planMrrMap[clientData.plan] || 95000,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setClients(prev => {
      const exists = prev.some(c => c.id === newClient.id || (c.name.toLowerCase() === newClient.name.toLowerCase() && c.ownerEmail.toLowerCase() === newClient.ownerEmail.toLowerCase()));
      const updated = exists ? prev : [newClient, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("logilink_clients", JSON.stringify(updated));
      }
      return updated;
    });

    addLog(`Client Onboarded: ${newClient.name}`, `Provisioned ${newClient.plan} account for ${newClient.ownerEmail}`, "retailer");
    addToast("success", "Client Account Provisioned", `${newClient.name} successfully added to SaaS engine`);
    await insertSupabaseClient(newClient);
    await loadSupabaseData(false);
  }, [addLog, addToast, loadSupabaseData]);

  const toggleClientStatus = useCallback((id: string) => {
    setClients(prev => {
      const updated = prev.map(client => {
        if (client.id === id) {
          const nextStatus: ClientBusiness["status"] = client.status === "Active" ? "Suspended" : "Active";
          addLog(`Client Access ${nextStatus}`, `${client.name} status updated to ${nextStatus}`, "retailer");
          addToast(nextStatus === "Active" ? "success" : "warning", `Client ${nextStatus}`, `${client.name} access is now ${nextStatus}`);
          updateSupabaseClientStatus(id, nextStatus);
          return { ...client, status: nextStatus };
        }
        return client;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("logilink_clients", JSON.stringify(updated));
      }
      return updated;
    });
  }, [addLog, addToast]);

  const deleteClientBusiness = useCallback((id: string) => {
    setClients(prev => {
      const target = prev.find(c => c.id === id);
      if (target) {
        addLog(`Client Account Deleted`, `Removed ${target.name} from SaaS platform`, "retailer");
        addToast("error", "Client Removed", `${target.name} account deleted`);
      }
      const updated = prev.filter(c => c.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("logilink_clients", JSON.stringify(updated));
      }
      return updated;
    });
    deleteSupabaseClient(id);
  }, [addLog, addToast]);

  const [fleet] = useState<FleetVehicle[]>([
    { id: "TX-89", driver: "Albert Carter", phone: "+1 (555) 019-8822", route: "Alpha", origin: "Central Hub", destination: "Walmart East Hub", status: "Delayed", progress: 60, speed: 15, temp: 34, cargo: "Steel Pins & Assemblies", eta: "14:30 (Delayed 45 mins)", coordinates: { x: 288, y: 104 } },
    { id: "FL-52", driver: "Maria Ramirez", phone: "+1 (555) 012-9900", route: "Beta", origin: "Central Hub", destination: "Target Dist Center", status: "On Schedule", progress: 45, speed: 62, cargo: "Hydraulic System Tubing", eta: "16:45", coordinates: { x: 220, y: 175 } },
    { id: "NY-77", driver: "Derrick Vance", phone: "+1 (555) 015-7722", route: "Delta", origin: "Central Hub", destination: "Amazon FC MD-3", status: "On Schedule", progress: 85, speed: 58, temp: -2, cargo: "Frozen Medical Components", eta: "18:00", coordinates: { x: 380, y: 85 } },
  ]);

  useEffect(() => {
    loadSupabaseData(true);

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel("supabase-realtime-dashboard")
        .on("postgres_changes", { event: "*", schema: "public" }, () => {
          loadSupabaseData(false);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadSupabaseData, user?.id, userRole, activeTenantId]);

  // Seed Supabase with initial data
  const seedDatabase = useCallback(async () => {
    try {
      setIsSeeding(true);
      await seedSupabaseData(initialMockInventory, initialMockOrders, initialMockRetailers);
      addLog("Database Seeded", "Successfully populated Supabase with sample dataset", "inventory");
      addToast("success", "Supabase Database Seeded", "Sample dataset loaded into live tables");
    } catch (err: unknown) {
      const error = err as Error;
      addToast("error", "Database Seeding Error", error?.message || "Failed to seed database.");
    } finally {
      setIsSeeding(false);
    }
  }, [addLog, addToast]);

  const addSku = useCallback((newItem: Omit<InventoryItem, "status">) => {
    let status: InventoryItem["status"] = "In Stock";
    if (newItem.qty === 0) status = "Out of Stock";
    else if (newItem.qty <= newItem.minRequired) status = "Low Stock";

    const itemWithStatus: InventoryItem = { ...newItem, status };
    setInventory(prev => [itemWithStatus, ...prev]);
    addLog(`SKU Added: ${itemWithStatus.sku}`, `Added "${itemWithStatus.name}" with stock ${itemWithStatus.qty}`, "inventory");
    addToast("success", "SKU Created", `${itemWithStatus.name} (${itemWithStatus.sku}) cataloged`);

    // Persist to Supabase with tenant isolation
    insertSupabaseInventoryItem(itemWithStatus, activeTenantId || undefined);
  }, [addLog, addToast, activeTenantId]);

  const restockSku = useCallback((sku: string) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.sku === sku) {
          const newQty = item.qty + 50;
          let status: InventoryItem["status"] = "In Stock";
          if (newQty === 0) status = "Out of Stock";
          else if (newQty <= item.minRequired) status = "Low Stock";

          updateSupabaseInventoryQty(sku, newQty, status, activeTenantId || undefined);
          addLog(`Restocked SKU ${sku}`, `Replenished stock by +50 units (New Qty: ${newQty})`, "inventory");
          addToast("success", "Stock Replenished", `${item.name} (+50 units). New Qty: ${newQty}`);
          return { ...item, qty: newQty, status };
        }
        return item;
      })
    );
  }, [addLog, addToast, activeTenantId]);

  const deleteSku = useCallback((sku: string) => {
    setInventory(prev => {
      const target = prev.find(i => i.sku === sku);
      addLog(`Deleted SKU ${sku}`, `Removed inventory item from catalog`, "inventory");
      addToast("error", "SKU Removed", `${target?.name || sku} deleted from catalog`);
      return prev.filter(item => item.sku !== sku);
    });
    deleteSupabaseInventoryItem(sku, activeTenantId || undefined);
  }, [addLog, addToast, activeTenantId]);

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"], carrier?: string, trackingNum?: string, eta?: string) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          let updatedEta = eta || order.eta;
          if (!eta) {
            if (status === "Delivered") updatedEta = "Delivered (Just Now)";
            else if (status === "In Transit") updatedEta = "ETA: 2 hours";
            else if (status === "Cancelled") updatedEta = "Cancelled";
          }

          const updatedCarrier = carrier || order.carrier;
          const updatedTrackingNum = trackingNum || order.trackingNum;

          updateSupabaseOrderStatus(orderId, status, updatedEta, activeTenantId || undefined);
          addLog(`Order ${orderId} Updated`, `Status: ${status} | Carrier: ${updatedCarrier}`, "order");
          addToast("info", `Order ${orderId} Updated`, `Status changed to ${status}`);
          return { ...order, status, carrier: updatedCarrier, trackingNum: updatedTrackingNum, eta: updatedEta };
        }
        return order;
      })
    );
  }, [addLog, addToast, activeTenantId]);

  const createOrder = useCallback((retailerName: string, itemsList: { sku: string; qty: number }[]) => {
    const retailer = retailers.find(r => r.name === retailerName);
    const location = retailer ? retailer.location : "Boston, MA";

    const itemsDescriptionParts: string[] = [];
    let totalPrice = 0;
    let totalQty = 0;

    itemsList.forEach(orderedItem => {
      const invItem = inventory.find(i => i.sku === orderedItem.sku);
      if (invItem) {
        itemsDescriptionParts.push(`${invItem.name} (x${orderedItem.qty})`);
        totalPrice += orderedItem.qty * invItem.unitPrice;
        totalQty += orderedItem.qty;
      }
    });

    const newOrderId = `ORD-${9840 + orders.length + 1}`;
    const newOrder: Order = {
      id: newOrderId,
      retailer: retailerName,
      location,
      date: new Date().toISOString().split("T")[0],
      items: itemsDescriptionParts.join(", "),
      qty: totalQty,
      total: totalPrice,
      status: "Pending",
      carrier: "LogiLink Express",
      trackingNum: "Pending Dispatch",
      eta: "TBD",
    };

    setInventory(prevInventory => {
      return prevInventory.map(item => {
        const orderedItem = itemsList.find(i => i.sku === item.sku);
        if (orderedItem) {
          const newQty = Math.max(0, item.qty - orderedItem.qty);
          let newStatus: InventoryItem["status"] = "In Stock";
          if (newQty === 0) newStatus = "Out of Stock";
          else if (newQty <= item.minRequired) newStatus = "Low Stock";

          updateSupabaseInventoryQty(item.sku, newQty, newStatus, activeTenantId || undefined);
          return { ...item, qty: newQty, status: newStatus };
        }
        return item;
      });
    });

    setOrders(prev => [newOrder, ...prev]);
    addLog(`Sales Order Created (${newOrderId})`, `Assigned to ${retailerName} for $${totalPrice.toFixed(2)}`, "order");
    addToast("success", "Sales Order Created", `${newOrderId} for ${retailerName} ($${totalPrice.toFixed(2)})`);
    insertSupabaseOrder(newOrder, activeTenantId || undefined);
  }, [retailers, inventory, orders.length, addLog, addToast, activeTenantId]);

  const deleteOrder = useCallback((id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    addLog(`Deleted Order ${id}`, `Removed sales order from pipeline`, "order");
    addToast("error", "Order Removed", `${id} deleted from pipeline`);
    deleteSupabaseOrder(id, activeTenantId || undefined);
  }, [addLog, addToast, activeTenantId]);

  const addRetailer = useCallback((newRetailer: Partial<Retailer>) => {
    const retailerItem: Retailer = {
      id: `RET-0${retailers.length + 1}`,
      name: newRetailer.name || "New Partner Hub",
      contact: newRetailer.contact || "Logistics Ops",
      email: newRetailer.email || "partner@supplychain.com",
      phone: newRetailer.phone || "+1 (555) 000-1122",
      location: newRetailer.location || "Central Region",
      totalOrders: 0,
      totalVolume: newRetailer.totalVolume || 0,
      onTimeRate: 100,
      status: newRetailer.status || "Active",
      grade: newRetailer.grade || "A+",
    };

    setRetailers(prev => [retailerItem, ...prev]);
    addLog(`Retailer Onboarded: ${retailerItem.name}`, `Added partner account in ${retailerItem.location}`, "retailer");
    addToast("success", "Partner Onboarded", `${retailerItem.name} (${retailerItem.location})`);
    insertSupabaseRetailer(retailerItem, activeTenantId || undefined);
  }, [retailers.length, addLog, addToast, activeTenantId]);

  const updateRetailer = useCallback((id: string, updates: Partial<Retailer>) => {
    setRetailers(prev =>
      prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          updateSupabaseRetailer(id, updates, activeTenantId || undefined);
          addLog(`Updated Partner ${r.name}`, `Status: ${updated.status}, Grade: ${updated.grade}`, "retailer");
          addToast("info", "Partner Updated", `${r.name} profile updated`);
          return updated;
        }
        return r;
      })
    );
  }, [addLog, addToast, activeTenantId]);

  const deleteRetailer = useCallback((id: string) => {
    setRetailers(prev => {
      const target = prev.find(r => r.id === id);
      addLog(`Deleted Retailer ${id}`, `Removed partner hub from network`, "retailer");
      addToast("error", "Partner Removed", `${target?.name || id} removed from network`);
      return prev.filter(r => r.id !== id);
    });
    deleteSupabaseRetailer(id, activeTenantId || undefined);
  }, [addLog, addToast, activeTenantId]);

  const contextValue = useMemo(() => {
    return {
      userRole,
      isAdmin,
      isSuperAdmin,
      activeTenantId,
      setUserRole,
      inventory,
      setInventory,
      orders,
      retailers,
      fleet,
      activityLogs,
      clients,
      setClients,
      searchQuery,
      setSearchQuery,
      isModalOpen,
      setIsModalOpen,
      isOrderModalOpen,
      setIsOrderModalOpen,
      isUpgradeModalOpen,
      setIsUpgradeModalOpen,
      upgradeReason,
      triggerUpgradeModal,
      unreadNotificationsCount,
      markNotificationsAsRead,
      isLoading,
      isSupabaseLive,
      isSeeding,
      loadSupabaseData,
      seedDatabase,
      addSku,
      restockSku,
      deleteSku,
      updateOrderStatus,
      createOrder,
      deleteOrder,
      addRetailer,
      updateRetailer,
      deleteRetailer,
      addClientBusiness,
      toggleClientStatus,
      deleteClientBusiness,
      toasts,
      addToast,
      dismissToast,
    };
  }, [
    userRole,
    isAdmin,
    isSuperAdmin,
    activeTenantId,
    setUserRole,
    inventory,
    setInventory,
    orders,
    retailers,
    fleet,
    activityLogs,
    clients,
    setClients,
    searchQuery,
    isModalOpen,
    isOrderModalOpen,
    isUpgradeModalOpen,
    upgradeReason,
    unreadNotificationsCount,
    markNotificationsAsRead,
    isLoading,
    isSupabaseLive,
    isSeeding,
    loadSupabaseData,
    seedDatabase,
    addSku,
    restockSku,
    deleteSku,
    updateOrderStatus,
    createOrder,
    deleteOrder,
    addRetailer,
    updateRetailer,
    deleteRetailer,
    addClientBusiness,
    toggleClientStatus,
    deleteClientBusiness,
    toasts,
    addToast,
    dismissToast,
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
