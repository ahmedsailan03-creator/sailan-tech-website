export const categories = [
  "Phones",
  "Tablets",
  "MacBooks",
  "Laptops",
  "Desktops",
  "Gaming",
  "Monitors",
  "Wearables",
  "Accessories",
  "Repair Devices",
  "Wholesale",
] as const;
export const sellCategories = [
  "iPhone",
  "Samsung",
  "Other Phone",
  "iPad",
  "Tablet",
  "MacBook",
  "Laptop",
  "Desktop",
  "Gaming PC",
  "PlayStation",
  "Xbox",
  "Nintendo",
  "Apple Watch",
  "Smartwatch",
  "Other Electronics",
] as const;
export const conditions = [
  "Brand New",
  "Open Box",
  "Excellent",
  "Good",
  "Fair",
  "Repair / Parts",
] as const;
export const productStatuses = [
  "Available",
  "Reserved",
  "Sold",
  "Repair",
  "Incoming",
] as const;
export const buyStatuses = [
  "Quote Created",
  "Quote Accepted",
  "Awaiting Device",
  "Device In Transit",
  "Device Received",
  "Inspection",
  "Revised Offer",
  "Offer Accepted",
  "Payment Processing",
  "Paid",
  "Completed",
  "Cancelled",
] as const;
export type BuyStatus = (typeof buyStatuses)[number];
export type Product = {
  revision: number;
  id: string;
  slug: string;
  sku: string;
  title: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  storage: string;
  ram: string;
  cpu: string;
  gpu: string;
  carrier: string;
  color: string;
  batteryHealth: string;
  price: number;
  quantity: number;
  status: string;
  description: string;
  images: string[];
  specifications: Record<string, string>;
  included: string[];
  featured: boolean;
  sample: boolean;
  discount: number;
  soldCount: number;
  createdAt: string;
};
export type PrivateProduct = Product & {
  cost: number;
  supplier: string;
  purchaseDate: string;
  imei: string;
  serial: string;
  weight: string;
};
export type DeviceModel = {
  id: string;
  category: string;
  brand: string;
  name: string;
  base: number;
  enabled: boolean;
  storage: string[];
  expectedResale?: number;
  configurations?: { cpu: string[]; ram: string[]; gpu: string[] };
};
export type PricingPolicy = {
  multipliers: Record<string, number>;
  deductions: Record<string, number>;
  accessories: Record<string, number>;
  storage: Record<string, number>;
  ram: Record<string, number>;
  cpu: Record<string, number>;
  gpu: Record<string, number>;
  partsMultiplier: number;
  maxOffer: number;
  minMargin: number;
  feesPercent: number;
  shipping: number;
  approved: boolean;
};
export type QuoteInput = {
  category: string;
  brand: string;
  modelId: string;
  specs: Record<string, string>;
  condition: Record<string, string>;
  accessories: string[];
};
export type Estimate = {
  eligibility: "eligible" | "declined" | "review";
  reason?: string;
  base: number;
  configuration: number;
  condition: number;
  accessories: number;
  cap: number;
  total: number;
  breakdown: { label: string; amount: number }[];
  sample: boolean;
};
export type User = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone: string;
  createdAt: string;
};
export type StoreSettings = {
  live: boolean;
  shippingCents: number;
  shippingText: string;
  returnsText: string;
  warrantyText: string;
  inspectionText: string;
  dropoffInstructions: string;
  shipInstructions: string;
  supportEmail: string;
  privacyText: string;
  termsText: string;
};
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
