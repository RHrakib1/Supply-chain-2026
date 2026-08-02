// Bangladesh Courier API Modular Payload Generator & Dispatch Integrator

export type CourierProvider = "Steadfast" | "Pathao" | "RedX" | "Paperfly";

export interface CourierDispatchConfig {
  provider: CourierProvider;
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  districtOrCity: string;
  codAmount: number;
  weightKg: number;
  itemDescription: string;
  specialInstruction?: string;
}

export interface SteadfastPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note: string;
}

export interface PathaoPayload {
  store_id: number;
  merchant_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_zone: string;
  delivery_type: number; // 48: Normal, 12: Express
  item_type: number; // 2: Parcel, 1: Document
  special_instruction: string;
  item_quantity: number;
  item_weight: number; // KG
  amount_to_collect: number;
}

export interface RedXPayload {
  customer_name: string;
  customer_phone: string;
  delivery_area: string;
  merchant_invoice_id: string;
  cash_collection_amount: number;
  parcel_weight: number;
  instruction: string;
}

export interface PaperflyPayload {
  merOrderRef: string;
  custName: string;
  custPhone: string;
  custAddr: string;
  custDistrict: string;
  max_weight: number;
  packagePrice: number;
}

export function buildSteadfastPayload(config: CourierDispatchConfig): SteadfastPayload {
  return {
    invoice: config.orderId,
    recipient_name: config.recipientName,
    recipient_phone: config.recipientPhone,
    recipient_address: `${config.recipientAddress}, ${config.districtOrCity}`,
    cod_amount: config.codAmount,
    note: config.specialInstruction || config.itemDescription,
  };
}

export function buildPathaoPayload(config: CourierDispatchConfig): PathaoPayload {
  return {
    store_id: 10892, // Default merchant store ID
    merchant_order_id: config.orderId,
    recipient_name: config.recipientName,
    recipient_phone: config.recipientPhone,
    recipient_address: config.recipientAddress,
    recipient_city: config.districtOrCity,
    recipient_zone: "Central Zone",
    delivery_type: 48, // Standard 48-hr courier delivery
    item_type: 2, // Parcel
    special_instruction: config.specialInstruction || config.itemDescription,
    item_quantity: 1,
    item_weight: config.weightKg,
    amount_to_collect: config.codAmount,
  };
}

export function buildRedXPayload(config: CourierDispatchConfig): RedXPayload {
  return {
    customer_name: config.recipientName,
    customer_phone: config.recipientPhone,
    delivery_area: config.districtOrCity,
    merchant_invoice_id: config.orderId,
    cash_collection_amount: config.codAmount,
    parcel_weight: config.weightKg,
    instruction: config.specialInstruction || config.itemDescription,
  };
}

export function buildPaperflyPayload(config: CourierDispatchConfig): PaperflyPayload {
  return {
    merOrderRef: config.orderId,
    custName: config.recipientName,
    custPhone: config.recipientPhone,
    custAddr: config.recipientAddress,
    custDistrict: config.districtOrCity,
    max_weight: config.weightKg,
    packagePrice: config.codAmount,
  };
}

export function generateCourierPayload(config: CourierDispatchConfig): object {
  switch (config.provider) {
    case "Steadfast":
      return buildSteadfastPayload(config);
    case "Pathao":
      return buildPathaoPayload(config);
    case "RedX":
      return buildRedXPayload(config);
    case "Paperfly":
      return buildPaperflyPayload(config);
    default:
      return buildSteadfastPayload(config);
  }
}

export interface CourierDispatchResult {
  success: boolean;
  trackingNumber: string;
  consignmentId: string;
  provider: CourierProvider;
  estimatedDelivery: string;
  message: string;
}

export async function simulateCourierDispatch(config: CourierDispatchConfig): Promise<CourierDispatchResult> {
  // Simulate network latency (400ms)
  await new Promise((resolve) => setTimeout(resolve, 400));

  const providerPrefixes: Record<CourierProvider, string> = {
    Steadfast: "SFC",
    Pathao: "PTH",
    RedX: "RDX",
    Paperfly: "PFLY",
  };

  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const prefix = providerPrefixes[config.provider] || "EXP";
  const trackingNumber = `${prefix}-${config.orderId.replace("ORD-", "")}-${randomDigits}`;

  return {
    success: true,
    trackingNumber,
    consignmentId: `CSG-${Date.now().toString().slice(-6)}`,
    provider: config.provider,
    estimatedDelivery: config.provider === "Pathao" ? "Within 24-48 Hours" : "Within 48 Hours",
    message: `Order ${config.orderId} successfully dispatched via ${config.provider} API API tracking code: ${trackingNumber}`,
  };
}

export interface CourierTestResult {
  success: boolean;
  latencyMs: number;
  balanceBdt?: number;
  statusMsg: string;
}

export async function testCourierConnection(
  provider: CourierProvider,
  apiKey: string,
  secretKey?: string,
  storeId?: string
): Promise<CourierTestResult> {
  const startTime = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 350 + Math.random() * 200));
  const latencyMs = Date.now() - startTime;

  if (!apiKey || apiKey.trim().length < 4) {
    return {
      success: false,
      latencyMs,
      statusMsg: `Invalid or missing API key credentials for ${provider}`,
    };
  }

  const mockBalances: Record<CourierProvider, number> = {
    Steadfast: 14250,
    Pathao: 28900,
    RedX: 9500,
    Paperfly: 18400,
  };

  const balanceBdt = mockBalances[provider] || 10000;

  return {
    success: true,
    latencyMs,
    balanceBdt,
    statusMsg: `${provider} Gateway Online • Merchant Store #${storeId || "101"} Operational`,
  };
}
