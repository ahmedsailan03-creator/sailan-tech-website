"use client";

import Link from "next/link";
import { useState } from "react";

const itPlans = [
  {
    name: "Basic Support",
    price: "$199",
    suffix: "/ month",
    description: "A simple starting plan for very small businesses that need reliable help without a large commitment.",
    features: [
      "Up to 2 remote support hours",
      "Priority response",
      "Monthly system check",
      "Email-first support process",
    ],
    featured: false,
  },
  {
    name: "Small Business Support",
    price: "$399",
    suffix: "/ month",
    description: "Built for growing offices that need more consistent support across employees, devices, printers, and Wi-Fi.",
    features: [
      "Up to 4 remote support hours",
      "Printer & Wi-Fi support",
      "Employee account assistance",
      "Device tracking",
      "Website-maintenance discount",
    ],
    featured: true,
  },
  {
    name: "Custom Support",
    price: "$600+",
    suffix: "/ month",
    description: "For businesses with more devices, more users, and a stronger need for ongoing technology management.",
    features: [
      "More supported devices",
      "On-site visits",
      "Website maintenance",
      "Business email administration",
      "Backup monitoring",
      "Additional support hours",
    ],
    featured: false,
  },
];

const webPlans = [
  {
    name: "Starter Website",
    price: "$400–$700",
    suffix: "one-time",
    description: "A clean, professional website for a small business that needs a strong online starting point.",
    features: [
      "Up to 3 pages",
      "Responsive mobile design",
      "Modern business layout",
      "Contact-focused structure",
    ],
    featured: false,
  },
  {
    name: "Business Website",
    price: "$800–$1,500",
    suffix: "one-time",
    description: "A larger, more polished site for businesses that need more pages, stronger presentation, and room to grow.",
    features: [
      "Up to 6 pages",
      "Responsive modern design",
      "More advanced sections",
      "Lead-focused structure",
      "Business branding support",
    ],
    featured: true,
  },
  {
    name: "Website Care Plan",
    price: "$50–$125",
    suffix: "/ month",
    description: "Ongoing help keeping your website current after it launches.",
    features: [
      "Website maintenance",
      "Content updates",
      "Small site changes",
      "Ongoing support",
    ],
    featured: false,
  },
];

export default function PlanSwitcher() {
  const [tab, setTab] = useState<"it" | "web">("it");
  const plans = tab === "it" ? itPlans : webPlans;

  return (
    <section className="pricing-shell">
      <div className="pricing-tabs" role="tablist">
        <button
          className={tab === "it" ? "active" : ""}
          onClick={() => setTab("it")}
        >
          Monthly IT Support
        </button>
        <button
          className={tab === "web" ? "active" : ""}
          onClick={() => setTab("web")}
        >
          Website Plans
        </button>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article
            className={`pricing-card ${plan.featured ? "featured" : ""}`}
            key={plan.name}
          >
            {plan.featured && <div className="pricing-popular">MOST POPULAR</div>}

            <div className="pricing-top">
              <span>SAILAN TECH</span>
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
            </div>

            <div className="pricing-price">
              <strong>{plan.price}</strong>
              <span>{plan.suffix}</span>
            </div>

            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <i>✓</i>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/contact" className={plan.featured ? "primary-button wide" : "secondary-button wide"}>
              Ask About This Plan <b>→</b>
            </Link>

            <div className="pricing-card-glow" />
          </article>
        ))}
      </div>

      <p className="pricing-note">
        Final pricing can vary based on the exact business, number of users,
        devices, project scope, and support needs.
      </p>
    </section>
  );
}
