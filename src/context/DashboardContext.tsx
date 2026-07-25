"use client";

import React, { createContext, useContext, useState } from "react";

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

interface DashboardContextType {
  inventory: InventoryItem[];
  orders: Order[];
  retailers: Retailer[];
  fleet: FleetVehicle[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  addSku: (item: Omit<InventoryItem, "status">) => void;
  restockSku: (sku: string) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  createOrder: (retailerName: string, itemsList: { sku: string; qty: number }[]) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { sku: "SKU-4912", name: "Steel Coupler Pins", category: "Hardware", location: "Warehouse A (Aisle 4)", qty: 4, minRequired: 25, unitPrice: 8.50, status: "Low Stock" },
    { sku: "SKU-8920", name: "Hydraulic Tubing (A)", category: "Fluid Power", location: "Warehouse B (Aisle 2)", qty: 12, minRequired: 30, unitPrice: 22.00, status: "Low Stock" },
    { sku: "SKU-3120", name: "Microchips H1-V2", category: "Electronics", location: "Warehouse A (Aisle 1)", qty: 50, minRequired: 100, unitPrice: 45.00, status: "Low Stock" },
    { sku: "SKU-1029", name: "Brake Seals 10mm", category: "Hardware", location: "Warehouse A (Aisle 5)", qty: 22, minRequired: 40, unitPrice: 12.30, status: "Low Stock" },
    { sku: "SKU-5011", name: "Heavy Duty Strut Mounts", category: "Suspension", location: "Warehouse C (Aisle 12)", qty: 125, minRequired: 50, unitPrice: 65.00, status: "In Stock" },
    { sku: "SKU-6789", name: "LED Signal Bulbs 12V", category: "Electrical", location: "Warehouse B (Aisle 8)", qty: 400, minRequired: 150, unitPrice: 4.20, status: "In Stock" },
    { sku: "SKU-7721", name: "Fibre Optic Splice Tray", category: "Telecom", location: "Warehouse C (Aisle 2)", qty: 0, minRequired: 10, unitPrice: 35.00, status: "Out of Stock" },
    { sku: "SKU-8822", name: "Synthetic Gear Oil 5L", category: "Chemicals", location: "Warehouse B (Aisle 15)", qty: 85, minRequired: 20, unitPrice: 29.99, status: "In Stock" },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-9842",
      retailer: "Walmart East Hub",
      location: "Boston, MA",
      date: "2026-07-24",
      items: "Steel Coupler Pins (x500), Brake Seals (x200)",
      qty: 700,
      total: 6710.00,
      status: "In Transit",
      carrier: "FedEx Freight",
      trackingNum: "FX-9081249-A",
      eta: "Today, 14:30"
    },
    {
      id: "ORD-9843",
      retailer: "Target Dist Center",
      location: "Atlanta, GA",
      date: "2026-07-23",
      items: "Hydraulic Tubing (x100), Steel Coupler Pins (x50)",
      qty: 150,
      total: 2625.00,
      status: "In Transit",
      carrier: "DHL Supply Chain",
      trackingNum: "DH-119283-GA",
      eta: "Tomorrow, 16:45"
    },
    {
      id: "ORD-9844",
      retailer: "Costco Wholesale #12",
      location: "Chicago, IL",
      date: "2026-07-22",
      items: "Heavy Duty Strut Mounts (x80)",
      qty: 80,
      total: 5200.00,
      status: "Delivered",
      carrier: "Swift Cargo",
      trackingNum: "SW-88290-IL",
      eta: "Delivered (July 24)"
    },
    {
      id: "ORD-9845",
      retailer: "Kroger Supply Hub",
      location: "Houston, TX",
      date: "2026-07-22",
      items: "Synthetic Gear Oil 5L (x150)",
      qty: 150,
      total: 4498.50,
      status: "Processing",
      carrier: "LogiLink Local",
      trackingNum: "LL-TX-092-B",
      eta: "July 27, 09:00"
    },
    {
      id: "ORD-9846",
      retailer: "Amazon FC MD-3",
      location: "Baltimore, MD",
      date: "2026-07-25",
      items: "Microchips H1-V2 (x200), LED Signal Bulbs (x500)",
      qty: 700,
      total: 11100.00,
      status: "Pending",
      carrier: "FedEx Freight",
      trackingNum: "Pending Dispatch",
      eta: "TBD"
    },
  ]);

  const [retailers] = useState<Retailer[]>([
    { id: "RET-01", name: "Walmart East Hub", contact: "Sarah Jenkins", email: "sjenks@walmart.com", phone: "+1 (555) 019-2834", location: "Boston, MA", totalOrders: 342, totalVolume: 512000, onTimeRate: 98.8, status: "Active", grade: "A+" },
    { id: "RET-02", name: "Target Dist Center", contact: "Marcus Aurelius", email: "m.aurelius@target.com", phone: "+1 (555) 012-9843", location: "Atlanta, GA", totalOrders: 198, totalVolume: 295000, onTimeRate: 96.2, status: "Active", grade: "A" },
    { id: "RET-03", name: "Costco Wholesale #12", contact: "Jessica Alba", email: "j.alba@costco.com", phone: "+1 (555) 014-9988", location: "Chicago, IL", totalOrders: 154, totalVolume: 210000, onTimeRate: 94.5, status: "Active", grade: "B" },
    { id: "RET-04", name: "Kroger Supply Hub", contact: "Danielle Vance", email: "d.vance@kroger.com", phone: "+1 (555) 015-1100", location: "Houston, TX", totalOrders: 92, totalVolume: 125000, onTimeRate: 99.1, status: "Active", grade: "A+" },
    { id: "RET-05", name: "Amazon FC MD-3", contact: "Sanjay Patel", email: "spatel@amazon.com", phone: "+1 (555) 018-4422", location: "Baltimore, MD", totalOrders: 510, totalVolume: 920000, onTimeRate: 97.5, status: "Active", grade: "A" },
  ]);

  const [fleet] = useState<FleetVehicle[]>([
    { id: "TX-89", driver: "Albert Carter", phone: "+1 (555) 019-8822", route: "Alpha", origin: "Central Hub", destination: "Walmart East Hub", status: "Delayed", progress: 60, speed: 15, temp: 34, cargo: "Steel Pins & Assemblies", eta: "14:30 (Delayed 45 mins)", coordinates: { x: 288, y: 104 } },
    { id: "FL-52", driver: "Maria Ramirez", phone: "+1 (555) 012-9900", route: "Beta", origin: "Central Hub", destination: "Target Dist Center", status: "On Schedule", progress: 45, speed: 62, cargo: "Hydraulic System Tubing", eta: "16:45", coordinates: { x: 220, y: 175 } },
    { id: "NY-77", driver: "Derrick Vance", phone: "+1 (555) 015-7722", route: "Delta", origin: "Central Hub", destination: "Amazon FC MD-3", status: "On Schedule", progress: 85, speed: 58, temp: -2, cargo: "Frozen Medical Components", eta: "18:00", coordinates: { x: 380, y: 85 } },
  ]);

  const addSku = (newItem: Omit<InventoryItem, "status">) => {
    let status: InventoryItem["status"] = "In Stock";
    if (newItem.qty === 0) status = "Out of Stock";
    else if (newItem.qty <= newItem.minRequired) status = "Low Stock";

    const itemWithStatus: InventoryItem = { ...newItem, status };
    setInventory([itemWithStatus, ...inventory]);
  };

  const restockSku = (sku: string) => {
    setInventory(inventory.map(item => {
      if (item.sku === sku) {
        const newQty = item.qty + 50;
        let status: InventoryItem["status"] = "In Stock";
        if (newQty === 0) status = "Out of Stock";
        else if (newQty <= item.minRequired) status = "Low Stock";

        return { ...item, qty: newQty, status };
      }
      return item;
    }));
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        let eta = order.eta;
        if (status === "Delivered") eta = "Delivered (Just Now)";
        else if (status === "In Transit") eta = "ETA: 2 hours";
        else if (status === "Cancelled") eta = "Cancelled";

        return { ...order, status, eta };
      }
      return order;
    }));
  };

  const createOrder = (retailerName: string, itemsList: { sku: string; qty: number }[]) => {
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
      carrier: "LogiLink Local",
      trackingNum: "Pending Dispatch",
      eta: "TBD"
    };

    setInventory(prevInventory => {
      return prevInventory.map(item => {
        const orderedItem = itemsList.find(i => i.sku === item.sku);
        if (orderedItem) {
          const newQty = Math.max(0, item.qty - orderedItem.qty);
          let newStatus: InventoryItem["status"] = "In Stock";
          if (newQty === 0) newStatus = "Out of Stock";
          else if (newQty <= item.minRequired) newStatus = "Low Stock";
          return {
            ...item,
            qty: newQty,
            status: newStatus
          };
        }
        return item;
      });
    });

    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  return (
    <DashboardContext.Provider
      value={{
        inventory,
        orders,
        retailers,
        fleet,
        searchQuery,
        setSearchQuery,
        isModalOpen,
        setIsModalOpen,
        isOrderModalOpen,
        setIsOrderModalOpen,
        addSku,
        restockSku,
        updateOrderStatus,
        createOrder,
      }}
    >
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
