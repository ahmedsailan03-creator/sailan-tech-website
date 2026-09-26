import type {
  Product,
  PrivateProduct,
  DeviceModel,
  PricingPolicy,
  QuoteInput,
  Estimate,
  StoreSettings,
  User,
} from "./types";
export type BuyQuote = {
  id: string;
  reference: string;
  user_id: string;
  status: string;
  amount: number;
  revised_amount: number | null;
  revision_reason: string;
  created_at: string;
  updated_at: string;
  body: {
    input: QuoteInput;
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
      serial: string;
      method: string;
    };
    model: string;
    estimate: Estimate;
    sample: boolean;
    shippingInstructions: string;
    inspectionInstructions: string;
  };
};
export type PurchaseOrder = {
  id: string;
  reference: string;
  user_id: string;
  status: string;
  total: number;
  stripe_session?: string;
  created_at: string;
  body: {
    items: { id: string; title: string; quantity: number; price: number }[];
    tracking?: string;
    shippingAddress?: unknown;
  };
};
export type ServiceRequest = {
  id: string;
  reference: string;
  user_id: string;
  kind: string;
  status: string;
  created_at: string;
  body: {
    name: string;
    email: string;
    phone: string;
    message: string;
    device?: string;
    service?: string;
    businessName?: string;
    website?: string;
    businessType?: string;
    monthlyVolume?: string;
    productsInterested?: string[];
    certificate?: string;
  };
};
export type Address = {
  id: string;
  body: {
    name: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};
export type Payout = {
  id: string;
  quote_id: string;
  method: string;
  reference: string;
  amount: number;
  created_at: string;
};
export type AccountData = {
  user: User;
  orders: PurchaseOrder[];
  quotes: BuyQuote[];
  requests: ServiceRequest[];
  addresses: Address[];
  favorites: string[];
  payouts: Payout[];
};
export type AdminData = {
  products: PrivateProduct[];
  devices: DeviceModel[];
  policy: PricingPolicy;
  settings: StoreSettings;
  quotes: BuyQuote[];
  orders: PurchaseOrder[];
  requests: ServiceRequest[];
  customers: User[];
  payouts: Payout[];
  promos: {
    code: string;
    percent: number;
    active: number;
    expires_at: string | null;
  }[];
  ready: {
    database: boolean;
    stripe: boolean;
    webhook: boolean;
    origin: boolean;
    email: boolean;
  };
};
export const date = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
