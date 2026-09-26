import { z } from "zod";
import {
  categories,
  conditions,
  productStatuses,
  sellCategories,
} from "./types";
const text = z.string().trim().max(300);
const amount = z.number().int().min(0).max(100000000);
const record = z.record(z.string().max(80), z.string().max(1000));
export const credentials = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(12).max(128),
  name: z.string().trim().min(2).max(100).optional(),
});
export const quoteInput = z.object({
  category: z.enum(sellCategories),
  brand: text.min(1),
  modelId: text.min(1),
  specs: record,
  condition: record,
  accessories: z.array(text).max(10),
});
export const contact = z.object({
  name: text.min(2),
  email: z.string().email().max(254),
  phone: z.string().trim().min(7).max(30),
  address: z.string().trim().min(8).max(600),
  serial: z.string().trim().min(4).max(80),
  method: z.enum(["Ship Device", "Local Drop-Off"]),
  consent: z.literal(true),
});
export const addressSchema = z.object({
  name: text.min(2),
  line1: text.min(3),
  line2: text.optional().default(""),
  city: text.min(2),
  state: text.min(2),
  postalCode: text.min(3),
  country: z.literal("US"),
});
export const productSchema = z.object({
  revision: z.number().int().min(0).default(0),
  id: text.optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(150),
  sku: text.min(1),
  title: text.min(2),
  brand: text.min(1),
  model: text.min(1),
  category: z.enum(categories),
  condition: z.enum(conditions),
  storage: text.default(""),
  ram: text.default(""),
  cpu: text.default(""),
  gpu: text.default(""),
  carrier: text.default(""),
  color: text.default(""),
  batteryHealth: text.default(""),
  price: amount,
  quantity: z.number().int().min(0).max(100000),
  status: z.enum(productStatuses),
  description: z.string().max(10000),
  images: z
    .array(
      z
        .string()
        .max(300)
        .refine(
          (s) =>
            /^\/(brand|showcase)\/[\w.-]+$/.test(s) ||
            /^\/api\/images\/[\w-]+$/.test(s),
          "Use an uploaded product image.",
        ),
    )
    .min(1)
    .max(12),
  specifications: record,
  included: z.array(text).max(30),
  featured: z.boolean(),
  sample: z.boolean(),
  discount: amount,
  soldCount: z.number().int().min(0).default(0),
  createdAt: z.string().optional(),
  cost: amount.default(0),
  supplier: text.default(""),
  purchaseDate: text.default(""),
  imei: text.default(""),
  serial: text.default(""),
  weight: text.default(""),
});
export const deviceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(sellCategories),
  brand: text.min(1),
  name: text.min(1),
  base: amount,
  enabled: z.boolean(),
  storage: z.array(text).min(1).max(15),
  expectedResale: amount.optional(),
  configurations: z
    .object({
      cpu: z.array(text).max(30),
      ram: z.array(text).max(30),
      gpu: z.array(text).max(30),
    })
    .optional(),
});
const moneyRecord = z.record(
  z.string().max(100),
  z.number().int().min(0).max(10000000),
);
export const policySchema = z
  .object({
    multipliers: z.record(z.string(), z.number().min(0).max(1)),
    deductions: moneyRecord,
    accessories: moneyRecord,
    storage: moneyRecord,
    ram: moneyRecord,
    cpu: moneyRecord,
    gpu: moneyRecord,
    partsMultiplier: z.number().min(0).max(1),
    maxOffer: amount,
    minMargin: amount,
    feesPercent: z.number().min(0).max(100),
    shipping: amount,
    approved: z.boolean(),
  })
  .refine(
    (p) =>
      ["None", "Light", "Moderate", "Heavy"].every((k) => k in p.multipliers),
    "All cosmetic multipliers are required.",
  );
export const settingsSchema = z.object({
  live: z.boolean(),
  shippingCents: amount,
  shippingText: z.string().max(5000),
  returnsText: z.string().max(5000),
  warrantyText: z.string().max(5000),
  inspectionText: z.string().max(5000),
  dropoffInstructions: z.string().max(5000),
  shipInstructions: z.string().max(5000),
  supportEmail: z.union([z.literal(""), z.string().email()]),
  privacyText: z.string().max(20000),
  termsText: z.string().max(20000),
});
export const serviceSchema = z
  .object({
    kind: z.enum(["repair", "wholesale", "support", "manual-quote"]),
    name: text.min(2),
    email: z.string().email().max(254),
    phone: text.min(7),
    device: text.optional(),
    service: text.optional(),
    message: z.string().trim().min(8).max(6000),
    businessName: text.optional(),
    website: z.union([z.literal(""), z.url()]).optional(),
    businessType: text.optional(),
    monthlyVolume: text.optional(),
    productsInterested: z.array(text).max(15).optional(),
    certificate: text.optional(),
    reference: text.optional(),
    consent: z.literal(true),
  })
  .superRefine((v, c) => {
    if (
      v.kind === "wholesale" &&
      (!v.businessName || !v.businessType || !v.monthlyVolume)
    )
      c.addIssue({
        code: "custom",
        message: "Business name, type, and monthly volume are required.",
      });
    if (v.kind === "repair" && (!v.device || !v.service))
      c.addIssue({
        code: "custom",
        message: "Choose a device and repair service.",
      });
  });
