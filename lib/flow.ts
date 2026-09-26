import type { BuyStatus } from "./types";
export const transitions: Record<BuyStatus, BuyStatus[]> = {
  "Quote Created": ["Quote Accepted", "Cancelled"],
  "Quote Accepted": ["Awaiting Device", "Cancelled"],
  "Awaiting Device": ["Device In Transit", "Device Received", "Cancelled"],
  "Device In Transit": ["Device Received", "Cancelled"],
  "Device Received": ["Inspection", "Cancelled"],
  Inspection: ["Offer Accepted", "Revised Offer", "Cancelled"],
  "Revised Offer": [],
  "Offer Accepted": ["Payment Processing", "Cancelled"],
  "Payment Processing": [],
  Paid: ["Completed"],
  Completed: [],
  Cancelled: [],
};
