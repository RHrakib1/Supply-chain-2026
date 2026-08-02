import { supabase } from "./supabase";
import { InventoryItem, Order, Retailer, ClientBusiness } from "@/context/DashboardContext";

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
  tenant_id?: string;
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
  tenant_id?: string;
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
  tenant_id?: string;
}

// --- INVENTORY ---
export async function fetchSupabaseInventory(tenantId?: string): Promise<InventoryItem[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    let query = supabase
      .from("inventory")
      .select("*")
      .order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data, error } = await query;

    if (error || !data) {
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

export async function insertSupabaseInventoryItem(item: InventoryItem, tenantId?: string) {
  if (!isSupabaseConfigured()) return;
  const payload: Record<string, unknown> = {
    sku: item.sku,
    product_name: item.name,
    category: item.category,
    stock_level: item.qty,
    min_required: item.minRequired,
    status: item.status,
  };
  if (tenantId) payload.tenant_id = tenantId;

  const { error } = await supabase.from("inventory").insert([payload]);
  if (error) console.error("Error inserting inventory item:", error.message);
}

export async function updateSupabaseInventoryQty(sku: string, newQty: number, status: string, tenantId?: string) {
  if (!isSupabaseConfigured()) return;
  let query = supabase
    .from("inventory")
    .update({ stock_level: newQty, status })
    .eq("sku", sku);
  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }
  const { error } = await query;
  if (error) console.error("Error updating inventory qty:", error.message);
}

// --- ORDERS ---
export async function fetchSupabaseOrders(tenantId?: string): Promise<Order[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data, error } = await query;

    if (error || !data) {
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

export async function insertSupabaseOrder(order: Order, tenantId?: string) {
  if (!isSupabaseConfigured()) return;
  const payload: Record<string, unknown> = {
    shipment_id: order.id,
    destination: order.location,
    driver_name: order.carrier,
    status: order.status,
    eta: order.eta,
  };
  if (tenantId) payload.tenant_id = tenantId;

  const { error } = await supabase.from("orders").insert([payload]);
  if (error) console.error("Error inserting order:", error.message);
}

export async function updateSupabaseOrderStatus(orderId: string, status: string, eta: string, tenantId?: string) {
  if (!isSupabaseConfigured()) return;
  try {
    let query1 = supabase
      .from("orders")
      .update({ status, eta })
      .eq("shipment_id", orderId);
    if (tenantId) query1 = query1.eq("tenant_id", tenantId);

    const { error: shipmentErr, data: shipmentData } = await query1.select();

    if (shipmentErr) {
      console.warn("Notice updating order status by shipment_id:", shipmentErr.message);
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    if ((!shipmentData || shipmentData.length === 0) && isUuid) {
      let query2 = supabase
        .from("orders")
        .update({ status, eta })
        .eq("id", orderId);
      if (tenantId) query2 = query2.eq("tenant_id", tenantId);
      const { error: idErr } = await query2;
      if (idErr) console.error("Error updating order status by id:", idErr.message);
    }
  } catch (err) {
    console.error("Failed to update order status in Supabase:", err);
  }
}

// --- RETAILERS ---
export async function fetchSupabaseRetailers(tenantId?: string): Promise<Retailer[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    let query = supabase
      .from("retailers")
      .select("*");

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data, error } = await query;

    if (error || !data) {
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

export async function insertSupabaseRetailer(retailer: Partial<Retailer>, tenantId?: string) {
  if (!isSupabaseConfigured()) return;
  const payload: Record<string, unknown> = {
    name: retailer.name,
    location: retailer.location,
    contact: retailer.contact,
    partnership_status: retailer.status || "Active",
  };
  if (tenantId) payload.tenant_id = tenantId;

  const { error } = await supabase.from("retailers").insert([payload]);
  if (error) console.error("Error inserting retailer:", error.message);
}

export async function updateSupabaseRetailer(id: string, updates: Partial<Retailer>, tenantId?: string) {
  if (!isSupabaseConfigured()) return;
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.contact !== undefined) payload.contact = updates.contact;
  if (updates.status !== undefined) payload.partnership_status = updates.status;

  let query = supabase
    .from("retailers")
    .update(payload)
    .eq("id", id);
  if (tenantId) query = query.eq("tenant_id", tenantId);

  const { error } = await query;
  if (error) console.error("Error updating retailer:", error.message);
}

// --- DELETE OPERATIONS (ADMIN ONLY) ---
export async function deleteSupabaseInventoryItem(sku: string, tenantId?: string) {
  if (!isSupabaseConfigured()) return;
  let query = supabase.from("inventory").delete().eq("sku", sku);
  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { error } = await query;
  if (error) console.error("Error deleting inventory item:", error.message);
}

export async function deleteSupabaseOrder(orderId: string, tenantId?: string) {
  if (!isSupabaseConfigured()) return;
  let q1 = supabase.from("orders").delete().eq("shipment_id", orderId);
  if (tenantId) q1 = q1.eq("tenant_id", tenantId);
  const { error: err1 } = await q1;
  if (err1) {
    let q2 = supabase.from("orders").delete().eq("id", orderId);
    if (tenantId) q2 = q2.eq("tenant_id", tenantId);
    await q2;
  }
}

export async function deleteSupabaseRetailer(id: string, tenantId?: string) {
  if (!isSupabaseConfigured()) return;
  let query = supabase.from("retailers").delete().eq("id", id);
  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { error } = await query;
  if (error) console.error("Error deleting retailer:", error.message);
}

// --- TENANT / CLIENT BUSINESSES ---
interface SupabaseClientRow {
  id?: string;
  tenant_id?: string;
  company_name?: string;
  name?: string;
  owner_name?: string;
  ownerName?: string;
  owner_email?: string;
  ownerEmail?: string;
  subscription_plan?: "Starter" | "Professional" | "Enterprise";
  plan?: "Starter" | "Professional" | "Enterprise";
  max_seats?: number;
  max_users?: number;
  maxUsers?: number;
  user_seats?: number;
  active_users?: number;
  activeUsers?: number;
  status?: "Active" | "Pending" | "Suspended";
  mrr?: number;
  joined_date?: string;
  created_at?: string;
  createdAt?: string;
}

export async function fetchSupabaseClients(): Promise<ClientBusiness[] | null> {
  if (!isSupabaseConfigured()) {
    console.log("[Supabase] Skipping fetchSupabaseClients - Supabase not configured in env");
    return null;
  }
  try {
    // 1. Try querying 'clients' table
    let { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    // 2. Fallback to 'tenants' table if 'clients' query fails or is empty
    if (error || !data || data.length === 0) {
      if (error) console.info("[Supabase] 'clients' table notice, trying 'tenants' table:", error.message);
      const tenantRes = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });
      if (!tenantRes.error && tenantRes.data && tenantRes.data.length > 0) {
        data = tenantRes.data;
        error = null;
      }
    }

    if (error || !data || data.length === 0) {
      if (error) console.warn("[Supabase] Fetch clients/tenants notice:", error.message);
      return null;
    }

    console.log(`[Supabase] Successfully fetched ${data.length} client tenant record(s) from database.`);

    return (data as SupabaseClientRow[]).map((c, index) => ({
      id: c.tenant_id || c.id || `CLI-${101 + index}`,
      name: c.company_name || c.name || "Enterprise Partner",
      ownerName: c.owner_name || c.ownerName || "Client Owner",
      ownerEmail: c.owner_email || c.ownerEmail || "owner@client.com",
      plan: c.subscription_plan || c.plan || "Professional",
      maxUsers: c.max_seats ?? c.max_users ?? c.maxUsers ?? 20,
      activeUsers: c.user_seats ?? c.active_users ?? c.activeUsers ?? 1,
      status: (c.status || "Active") as ClientBusiness["status"],
      mrr: c.mrr ?? ((c.subscription_plan || c.plan) === "Enterprise" ? 250000 : (c.subscription_plan || c.plan) === "Starter" ? 35000 : 95000),
      createdAt: c.joined_date || c.created_at?.split("T")[0] || c.createdAt || new Date().toISOString().split("T")[0],
    }));
  } catch (err) {
    console.error("[Supabase Error] Failed to fetch clients/tenants:", err);
    return null;
  }
}

export async function insertSupabaseClient(client: ClientBusiness): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn("[Supabase] Insert skipped - Environment variables missing.");
    return false;
  }

  const payloadExplicitSql = {
    tenant_id: client.id,
    company_name: client.name,
    owner_name: client.ownerName,
    owner_email: client.ownerEmail,
    subscription_plan: client.plan,
    status: client.status,
    user_seats: client.activeUsers,
    max_seats: client.maxUsers,
  };

  const payloadSnake: Record<string, unknown> = {
    id: client.id,
    name: client.name,
    owner_name: client.ownerName,
    owner_email: client.ownerEmail,
    plan: client.plan,
    max_users: client.maxUsers,
    active_users: client.activeUsers,
    status: client.status,
    mrr: client.mrr,
    created_at: client.createdAt || new Date().toISOString(),
  };

  const payloadSnakeNoId: Record<string, unknown> = {
    name: client.name,
    owner_name: client.ownerName,
    owner_email: client.ownerEmail,
    plan: client.plan,
    max_users: client.maxUsers,
    active_users: client.activeUsers,
    status: client.status,
    mrr: client.mrr,
  };

  try {
    // 1. Attempt insert with exact SQL schema fields (tenant_id, company_name, subscription_plan, user_seats, max_seats)
    let { error } = await supabase.from("clients").insert([payloadExplicitSql]);
    if (!error) {
      console.log(`[Supabase SUCCESS] Inserted client "${client.name}" into 'clients' table (SQL schema).`);
      return true;
    }

    // 2. Attempt insert into 'clients' (snake_case with id)
    ({ error } = await supabase.from("clients").insert([payloadSnake]));
    if (!error) {
      console.log(`[Supabase SUCCESS] Inserted client "${client.name}" into 'clients' table.`);
      return true;
    }

    // 3. Attempt insert into 'clients' (snake_case without id)
    ({ error } = await supabase.from("clients").insert([payloadSnakeNoId]));
    if (!error) {
      console.log(`[Supabase SUCCESS] Inserted client "${client.name}" into 'clients' table (auto-id).`);
      return true;
    }

    // 4. Attempt insert into 'tenants' (snake_case)
    ({ error } = await supabase.from("tenants").insert([payloadSnake]));
    if (!error) {
      console.log(`[Supabase SUCCESS] Inserted client "${client.name}" into 'tenants' table.`);
      return true;
    }

    console.error("[Supabase ERROR] All insert attempts into 'clients' and 'tenants' tables failed:", error?.message);
    return false;
  } catch (err) {
    console.error("[Supabase ERROR] Exception during client insertion:", err);
    return false;
  }
}

export async function updateSupabaseClientStatus(id: string, status: ClientBusiness["status"]) {
  if (!isSupabaseConfigured()) return;
  const { error: err1 } = await supabase.from("clients").update({ status }).eq("id", id);
  if (err1) {
    await supabase.from("tenants").update({ status }).eq("id", id);
  }
}

export async function deleteSupabaseClient(id: string) {
  if (!isSupabaseConfigured()) return;
  const { error: err1 } = await supabase.from("clients").delete().eq("id", id);
  if (err1) {
    await supabase.from("tenants").delete().eq("id", id);
  }
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

// --- META ADS & TENANT SETTINGS (MULTI-TENANT ISOLATION) ---

export interface MetaCampaign {
  id: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  spendUsd: number;
  ordersDriven: number;
  revenueBdt: number;
  roas: number;
  status: "ACTIVE" | "PAUSED";
  tenantId?: string;
  createdAt?: string;
}

export interface MetaSettings {
  metaAdAccountId: string;
  metaAccessToken: string;
  usdToBdtRate: number;
  updatedAt?: string;
}

interface SupabaseMetaCampaignRow {
  id?: string;
  tenant_id?: string;
  campaign_name?: string;
  name?: string;
  impressions?: number;
  clicks?: number;
  spend_usd?: number;
  spend?: number;
  orders_driven?: number;
  orders?: number;
  revenue_bdt?: number;
  revenue?: number;
  roas?: number;
  status?: "ACTIVE" | "PAUSED";
  created_at?: string;
}

interface SupabaseTenantSettingsRow {
  tenant_id?: string;
  meta_ad_account_id?: string;
  meta_access_token?: string;
  usd_to_bdt_rate?: number;
  updated_at?: string;
}

export async function fetchSupabaseMetaCampaigns(tenantId?: string): Promise<MetaCampaign[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    let query = supabase
      .from("meta_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data, error } = await query;

    if (error || !data) {
      if (error) console.warn("Supabase fetch meta_campaigns notice:", error.message);
      return null;
    }

    return (data as SupabaseMetaCampaignRow[]).map(row => {
      const spendUsd = row.spend_usd ?? row.spend ?? 0;
      const revenueBdt = row.revenue_bdt ?? row.revenue ?? 0;
      const roas = row.roas ?? (spendUsd > 0 ? Number(((revenueBdt / (spendUsd * 120))).toFixed(2)) : 0);
      return {
        id: row.id || `CAM-${Math.floor(Math.random() * 1000)}`,
        campaignName: row.campaign_name || row.name || "Meta Conversion Campaign",
        impressions: row.impressions || 0,
        clicks: row.clicks || 0,
        spendUsd,
        ordersDriven: row.orders_driven ?? row.orders ?? 0,
        revenueBdt,
        roas,
        status: row.status || "ACTIVE",
        tenantId: row.tenant_id,
        createdAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      };
    });
  } catch (err) {
    console.error("Failed to fetch meta campaigns from Supabase:", err);
    return null;
  }
}

export async function insertSupabaseMetaCampaign(campaign: Omit<MetaCampaign, "id"> & { id?: string }, tenantId?: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: Record<string, unknown> = {
      campaign_name: campaign.campaignName,
      impressions: campaign.impressions,
      clicks: campaign.clicks,
      spend_usd: campaign.spendUsd,
      orders_driven: campaign.ordersDriven,
      revenue_bdt: campaign.revenueBdt,
      roas: campaign.roas,
      status: campaign.status,
    };
    if (campaign.id) payload.id = campaign.id;
    if (tenantId) payload.tenant_id = tenantId;

    const { error } = await supabase.from("meta_campaigns").insert([payload]);
    if (error) {
      console.error("Error inserting meta campaign:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to insert meta campaign into Supabase:", err);
    return false;
  }
}

export async function updateSupabaseMetaCampaign(id: string, updates: Partial<MetaCampaign>, tenantId?: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: Record<string, unknown> = {};
    if (updates.campaignName !== undefined) payload.campaign_name = updates.campaignName;
    if (updates.impressions !== undefined) payload.impressions = updates.impressions;
    if (updates.clicks !== undefined) payload.clicks = updates.clicks;
    if (updates.spendUsd !== undefined) payload.spend_usd = updates.spendUsd;
    if (updates.ordersDriven !== undefined) payload.orders_driven = updates.ordersDriven;
    if (updates.revenueBdt !== undefined) payload.revenue_bdt = updates.revenueBdt;
    if (updates.roas !== undefined) payload.roas = updates.roas;
    if (updates.status !== undefined) payload.status = updates.status;

    let query = supabase.from("meta_campaigns").update(payload).eq("id", id);
    if (tenantId) query = query.eq("tenant_id", tenantId);

    const { error } = await query;
    if (error) {
      console.error("Error updating meta campaign:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to update meta campaign in Supabase:", err);
    return false;
  }
}

export async function deleteSupabaseMetaCampaign(id: string, tenantId?: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    let query = supabase.from("meta_campaigns").delete().eq("id", id);
    if (tenantId) query = query.eq("tenant_id", tenantId);
    const { error } = await query;
    if (error) {
      console.error("Error deleting meta campaign:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete meta campaign in Supabase:", err);
    return false;
  }
}

// --- TENANT SETTINGS (META ACCESS TOKEN & ACCOUNT ID) ---

export async function fetchSupabaseTenantSettings(tenantId?: string): Promise<MetaSettings | null> {
  if (!isSupabaseConfigured() || !tenantId) return null;
  try {
    const { data, error } = await supabase
      .from("tenant_settings")
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error || !data) {
      if (error) console.info("Supabase fetch tenant_settings notice:", error.message);
      return null;
    }

    const row = data as SupabaseTenantSettingsRow;
    return {
      metaAdAccountId: row.meta_ad_account_id || "",
      metaAccessToken: row.meta_access_token || "",
      usdToBdtRate: row.usd_to_bdt_rate || 120.0,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    console.error("Failed to fetch tenant settings from Supabase:", err);
    return null;
  }
}

export async function updateSupabaseMetaCredentials(
  metaAdAccountId: string,
  metaAccessToken: string,
  usdToBdtRate: number = 120.0,
  tenantId?: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !tenantId) return false;
  try {
    const payload = {
      tenant_id: tenantId,
      meta_ad_account_id: metaAdAccountId,
      meta_access_token: metaAccessToken,
      usd_to_bdt_rate: usdToBdtRate,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("tenant_settings").upsert(payload, { onConflict: "tenant_id" });
    if (error) {
      console.error("Error updating meta credentials in tenant_settings:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to update meta credentials in Supabase:", err);
    return false;
  }
}


/*
  ===================================================================
  SUPABASE ROW LEVEL SECURITY (RLS) & CLERK ROLE INTEGRATION REFERENCE
  ===================================================================
  To enforce RBAC at the Supabase database level using Clerk JWT claims:

  1. Enable RLS on tables:
     ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
     ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
     ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;

  2. Create Admin full-access policies:
     CREATE POLICY "Admin Full Access Inventory" ON inventory FOR ALL
     USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role');

  3. Create Normal User read-only / restricted policies:
     CREATE POLICY "User Read-Only Inventory" ON inventory FOR SELECT
     USING (true);

     CREATE POLICY "User Order Read & Update" ON orders FOR SELECT
     USING (true);
*/

