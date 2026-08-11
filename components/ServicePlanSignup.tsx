"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";

const services = [
  { name: "Business IT Support", image: "/signup/service-it-support.png" },
  { name: "Microsoft 365", image: "/signup/service-microsoft365.png" },
  { name: "Network & Wi-Fi", image: "/signup/service-network-wifi.png" },
  { name: "Employee Onboarding", image: "/signup/service-onboarding.png" },
  { name: "Computer Setup & Repair", image: "/signup/service-computer-repair.png" },
  { name: "Website Development", image: "/signup/service-website-dev.png" },
  { name: "Cybersecurity Basics", image: "/signup/service-cybersecurity.png" },
  { name: "Backup & Data Transfer", image: "/signup/service-backup-transfer.png" },
  { name: "Printer & Peripheral Setup", image: "/signup/service-printer-setup.png" },
  { name: "Business Email & Domain Support", image: "/signup/service-email-domain.png" },
];

const plans = [
  {
    id: "basic",
    name: "Basic Support",
    price: "$199/mo",
    description: "For small businesses that need a simple, reliable IT support starting point.",
    features: [
      "Up to 2 remote support hours",
      "Priority response",
      "Monthly system check",
      "Email-first support",
    ],
  },
  {
    id: "small-business",
    name: "Small Business Support",
    price: "$399/mo",
    description: "For growing offices with more users, devices, printers, and ongoing support needs.",
    features: [
      "Up to 4 remote support hours",
      "Printer & Wi-Fi support",
      "Employee account assistance",
      "Device tracking",
      "Website maintenance discount",
    ],
    popular: true,
  },
  {
    id: "custom",
    name: "Custom Support",
    price: "$600+/mo",
    description: "For businesses that need more users, more devices, more support, or on-site service.",
    features: [
      "More supported devices",
      "On-site visits",
      "Website maintenance",
      "Business email administration",
      "Backup monitoring",
      "Additional support hours",
    ],
  },
];

export default function ServicePlanSignup() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("small-business");
  const [showCustom, setShowCustom] = useState(false);
  const [customServices, setCustomServices] = useState<string[]>([]);
  const [customDraft, setCustomDraft] = useState("");

  const selectedPlanName = useMemo(
    () => plans.find((plan) => plan.id === selectedPlan)?.name || "None selected",
    [selectedPlan]
  );

  function toggleService(service: string) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service]
    );
  }

  function addCustomService() {
    const value = customDraft.trim();
    if (!value) return;

    setCustomServices((current) =>
      current.includes(value) ? current : [...current, value]
    );
    setCustomDraft("");
  }

  function removeCustomService(service: string) {
    setCustomServices((current) => current.filter((item) => item !== service));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") || "");
    const company = String(data.get("company") || "");
    const email = String(data.get("email") || "");
    const phone = String(data.get("phone") || "");
    const employees = String(data.get("employees") || "");
    const notes = String(data.get("notes") || "");

    const allServices = [...selectedServices, ...customServices];

    const subject = encodeURIComponent(
      `Sailan Tech Signup Request - ${company || name}`
    );

    const body = encodeURIComponent(
`New Sailan Tech Website Signup

Name: ${name}
Company: ${company}
Email: ${email}
Phone: ${phone}
Approx. Employees: ${employees}

Selected Plan:
${selectedPlanName}

Selected Services:
${allServices.length ? allServices.map((service) => `- ${service}`).join("\n") : "- No service selected"}

Additional Notes:
${notes || "None"}

Preferred Process:
Email first. Call only after interest / when needed.`
    );

    window.location.href =
      `mailto:ahmed@sailantech.com?subject=${subject}&body=${body}`;
  }

  return (
    <section className="signup-builder">
      <div className="signup-builder-head">
        <p className="concept-kicker">BUILD YOUR SUPPORT SETUP</p>
        <h2>Pick your services. Choose a plan. Send your request.</h2>
        <p>
          Select everything your business needs. You can choose multiple
          services, add something custom, and send the full request directly
          to Sailan Tech.
        </p>
      </div>

      <form className="signup-form" onSubmit={submit}>
        <div className="signup-block">
          <div className="signup-block-title">
            <span>01</span>
            <div>
              <h3>Choose your services</h3>
              <p>Select as many as you need.</p>
            </div>
          </div>

          <div className="service-picker-grid">
            {services.map((service, index) => {
              const active = selectedServices.includes(service.name);

              return (
                <button
                  className={`service-picker ${active ? "active" : ""}`}
                  type="button"
                  key={service.name}
                  onClick={() => toggleService(service.name)}
                >
                  <div className="service-picker-image-wrap">
                    <Image
                      src={service.image}
                      alt={service.name}
                      width={320}
                      height={180}
                      className="service-picker-image"
                    />
                    <span className="service-picker-image-overlay" />
                  </div>

                  <div className="service-picker-content">
                    <span className="service-picker-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="service-picker-name">{service.name}</span>
                    <span className="service-picker-check">{active ? "✓" : "+"}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="custom-service-area">
            {!showCustom ? (
              <button
                type="button"
                className="add-service-button"
                onClick={() => setShowCustom(true)}
              >
                + Add a service not listed
              </button>
            ) : (
              <div className="custom-service-input-row">
                <input
                  value={customDraft}
                  onChange={(event) => setCustomDraft(event.target.value)}
                  placeholder="Example: Camera system setup"
                />
                <button type="button" onClick={addCustomService}>
                  Add Service
                </button>
              </div>
            )}

            {customServices.length > 0 && (
              <div className="custom-service-tags">
                {customServices.map((service) => (
                  <button
                    type="button"
                    key={service}
                    onClick={() => removeCustomService(service)}
                  >
                    {service} <span>×</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="signup-block">
          <div className="signup-block-title">
            <span>02</span>
            <div>
              <h3>Choose a support plan</h3>
              <p>You can change or customize this after we review your needs.</p>
            </div>
          </div>

          <div className="signup-plan-grid">
            {plans.map((plan) => {
              const active = selectedPlan === plan.id;

              return (
                <button
                  type="button"
                  key={plan.id}
                  className={`signup-plan-card ${active ? "active" : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <span className="signup-plan-popular">MOST POPULAR</span>
                  )}

                  <span className="signup-plan-radio">
                    <i />
                  </span>

                  <h4>{plan.name}</h4>
                  <strong>{plan.price}</strong>
                  <p>{plan.description}</p>

                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>✓ {feature}</li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        <div className="signup-block signup-contact-block">
          <div className="signup-block-title">
            <span>03</span>
            <div>
              <h3>Tell us about your business</h3>
              <p>Your request opens in email so you can send it directly.</p>
            </div>
          </div>

          <div className="signup-fields">
            <label>
              <span>Your name</span>
              <input name="name" placeholder="John Smith" required />
            </label>

            <label>
              <span>Company name</span>
              <input name="company" placeholder="Company LLC" required />
            </label>

            <label>
              <span>Business email</span>
              <input
                name="email"
                type="email"
                placeholder="john@company.com"
                required
              />
            </label>

            <label>
              <span>Phone number</span>
              <input name="phone" type="tel" placeholder="313-555-0123" />
            </label>

            <label>
              <span>Approx. employees</span>
              <select name="employees" defaultValue="1-10">
                <option>1-10</option>
                <option>11-25</option>
                <option>26-50</option>
                <option>51-100</option>
                <option>100+</option>
              </select>
            </label>

            <label className="signup-notes">
              <span>Anything else?</span>
              <textarea
                name="notes"
                rows={5}
                placeholder="Tell us about the issue, project, timeline, or anything else we should know..."
              />
            </label>
          </div>

          <div className="signup-summary">
            <div>
              <span>PLAN</span>
              <strong>{selectedPlanName}</strong>
            </div>

            <div>
              <span>SERVICES</span>
              <strong>{selectedServices.length + customServices.length}</strong>
            </div>

            <div>
              <span>CONTACT</span>
              <strong>Email First</strong>
            </div>
          </div>

          <button className="signup-submit" type="submit">
            Send My Request to Sailan Tech <span>→</span>
          </button>

          <p className="signup-submit-note">
            This sends the request to <strong>ahmed@sailantech.com</strong>.
            We start by email and only move to a call after interest or when a
            call clearly makes sense.
          </p>
        </div>
      </form>
    </section>
  );
}
