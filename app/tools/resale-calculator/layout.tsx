import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
 title: "Free Electronics Resale Profit Calculator | Sailan Tech",
 description: "Calculate electronics resale net profit, ROI, marketplace fees, shipping, repair costs, and returns risk before buying inventory. Free calculator by Sailan Tech.",
 robots: { index: true, follow: true },
 openGraph: {
   title: "Free Electronics Resale Profit Calculator — Sailan Tech",
   description: "Estimate real resale profit after fees, shipping, repairs and risk reserve.",
   type: "website"
 }
};

export default function ResaleCalculatorLayout({ children }: { children: ReactNode }) {
 return children;
}
