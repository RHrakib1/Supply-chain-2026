import { supabase } from "./supabase";
import { InventoryItem, Order, Retailer } from "@/context/DashboardContext";

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your_supabase"));
};

interface SupabaseInventoryRow {
  sku: string;
  product_name?: string;
  name?: string;
  category?: string;
  location?: string;
  stock_level?: number;
  qty?: number;
  min_required?: number;
  minRequired?: number;
  unit_price?: number;
  unitPrice?: number;
  status?: string;
}

interface SupabaseOrderRow {
  id?: string;
  shipment_id?: string;
  destination?: string;
  location?: string;
  retailer?: string;
  created_at?: string;
  items?: string;
  qty?: number;
  total?: number;
  status?: string;
  driver_name?: string;
  carrier?: string;
  eta?: string;
}

interface SupabaseRetailerRow {
  id?: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  location?: string;
  total_orders?: number;
  total_volume?: number;
  on_time_rate?: number;
  partnership_status?: string;
  status?: string;
  grade?: "A+" | "A" | "B" | "C";
}

// --- INVENTORY ---
export async function fetchSupabaseInventory(): Promise<InventoryItem[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn("Supabase fetch inventory notice:", error.message);
      return null;
    }

    return (data as SupabaseInventoryRow[]).map(item => ({
      sku: item.sku,
      name: item.product_name || item.name || "Logistics Item",
      category: item.category || "General",
      location: item.location || "Warehouse A",
      qty: item.stock_level ?? item.qty ?? 0,
      minRequired: item.min_required ?? item.minRequired ?? 10,
      unitPrice: item.unit_price ?? item.unitPrice ?? 15.0,
      status: (item.status || (item.stock_level === 0 ? "Out of Stock" : (item.stock_level ?? 0) <= (item.min_required || 10) ? "Low Stock" : "In Stock")) as InventoryItem["status"],
    }));
  } catch (err) {
    console.error("Failed to fetch inventory from Supabase:", err);
    return null;
  }
}

export async function insertSupabaseInventoryItem(item: InventoryItem) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("inventory").insert([
    {
      sku: item.sku,
      product_name: item.name,
      category: item.category,
      stock_level: item.qty,
      min_required: item.minRequired,
      status: item.status,
    },
  ]);
  if (error) console.error("Error inserting inventory item:", error.message);
}

export async function updateSupabaseInventoryQty(sku: string, newQty: number, status: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from("inventory")
    .update({ stock_level: newQty, status })
    .eq("sku", sku);
  if (error) console.error("Error updating inventory qty:", error.message);
}

// --- ORDERS ---
export async function fetchSupabaseOrders(): Promise<Order[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn("Supabase fetch orders notice:", error.message);
      return null;
    }

    return (data as SupabaseOrderRow[]).map(item => ({
      id: item.shipment_id || item.id || "ORD-000",
      retailer: item.destination ? `${item.destination} Hub` : item.retailer || "Retail Hub",
      location: item.destination || item.location || "Boston, MA",
      date: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      items: item.items || "Logistics Components Batch",
      qty: item.qty || 100,
      total: item.total || 2500.0,
      status: (item.status || "Pending") as Order["status"],
      carrier: item.driver_name || item.carrier || "LogiLink Express",
      trackingNum: item.shipment_id || "TRK-001",
      eta: item.eta || "TBD",
    }));
  } catch (err) {
    console.error("Failed to fetch orders from Supabase:", err);
    return null;
  }
}

export async function insertSupabaseOrder(order: Order) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("orders").insert([
    {
      shipment_id: order.id,
      destination: order.location,
      driver_name: order.carrier,
      status: order.status,
      eta: order.eta,
    },
  ]);
  if (error) console.error("Error inserting order:", error.message);
}

export async function updateSupabaseOrderStatus(orderId: string, status: string, eta: string) {
  if (!isSupabaseConfigured()) return;
  try {
    // 1. Try updating by shipment_id first
    const { error: shipmentErr, data: shipmentData } = await supabase
      .from("orders")
      .update({ status, eta })
      .eq("shipment_id", orderId)
      .select();

    if (shipmentErr) {
      console.warn("Notice updating order status by shipment_id:", shipmentErr.message);
    }

    // 2. If no rows updated by shipment_id and orderId is a UUID, update by id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    if ((!shipmentData || shipmentData.length === 0) && isUuid) {
      const { error: idErr } = await supabase
        .from("orders")
        .update({ status, eta })
        .eq("id", orderId);
      if (idErr) console.error("Error updating order status by id:", idErr.message);
    }
  } catch (err) {
    console.error("Failed to update order status in Supabase:", err);
  }
}

// --- RETAILERS ---
export async function fetchSupabaseRetailers(): Promise<Retailer[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("retailers")
      .select("*");

    if (error || !data || data.length === 0) {
      if (error) console.warn("Supabase fetch retailers notice:", error.message);
      return null;
    }

    return (data as SupabaseRetailerRow[]).map(item => ({
      id: item.id || `RET-${Math.floor(Math.random() * 100)}`,
      name: item.name,
      contact: item.contact || "Store Manager",
      email: item.email || `${item.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@retailer.com`,
      phone: item.phone || "+1 (555) 019-2834",
      location: item.location || "North Region",
      totalOrders: item.total_orders || 150,
      totalVolume: item.total_volume || 250000,
      onTimeRate: item.on_time_rate || 98.5,
      status: (item.partnership_status || item.status || "Active") as Retailer["status"],
      grade: item.grade || "A+",
    }));
  } catch (err) {
    console.error("Failed to fetch retailers from Supabase:", err);
    return null;
  }
}

export async function insertSupabaseRetailer(retailer: Partial<Retailer>) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("retailers").insert([
    {
      name: retailer.name,
      location: retailer.location,
      contact: retailer.contact,
      partnership_status: retailer.status || "Active",
    },
  ]);
  if (error) console.error("Error inserting retailer:", error.message);
}

export async function updateSupabaseRetailer(id: string, updates: Partial<Retailer>) {
  if (!isSupabaseConfigured()) return;
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.contact !== undefined) payload.contact = updates.contact;
  if (updates.status !== undefined) payload.partnership_status = updates.status;

  const { error } = await supabase
    .from("retailers")
    .update(payload)
    .eq("id", id);
  if (error) console.error("Error updating retailer:", error.message);
}

// --- SEED DUMMY DATA ---
export async function seedSupabaseData(
  initialInventory: InventoryItem[],
  initialOrders: Order[],
  initialRetailers: Retailer[]
) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase URL and Anon Key must be configured in .env.local before seeding.");
  }

  // 1. Seed Inventory
  const inventoryPayload = initialInventory.map(item => ({
    sku: item.sku,
    product_name: item.name,
    category: item.category,
    stock_level: item.qty,
    min_required: item.minRequired,
    status: item.status,
  }));
  const { error: invErr } = await supabase.from("inventory").upsert(inventoryPayload, { onConflict: "sku" });
  if (invErr) console.warn("Notice seeding inventory:", invErr.message);

  // 2. Seed Orders
  const ordersPayload = initialOrders.map(order => ({
    shipment_id: order.id,
    destination: order.location,
    driver_name: order.carrier,
    status: order.status,
    eta: order.eta,
  }));
  const { error: ordErr } = await supabase.from("orders").upsert(ordersPayload, { onConflict: "shipment_id" });
  if (ordErr) console.warn("Notice seeding orders:", ordErr.message);

  // 3. Seed Retailers
  const retailersPayload = initialRetailers.map(r => ({
    name: r.name,
    location: r.location,
    contact: r.contact,
    partnership_status: r.status,
  }));
  const { error: retErr } = await supabase.from("retailers").insert(retailersPayload);
  if (retErr) console.warn("Notice seeding retailers:", retErr.message);

  return { success: true };
}
