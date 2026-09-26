"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Upload,
  Smartphone,
  Laptop,
  Gamepad2,
  Wrench,
} from "lucide-react";
import { api, useStore } from "./Store";
export function ServiceForm({
  kind,
}: {
  kind: "repair" | "wholesale" | "support" | "manual-quote";
}) {
  const { user } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const wholesale = kind === "wholesale";
  if (result)
    return (
      <div className="panel stack service-success">
        <div className="success-icon">
          <Check />
        </div>
        <h2>{wholesale ? "Application received." : "Request received."}</h2>
        <p>
          Your reference is <strong>{result}</strong>. Keep it for your records.
        </p>
        <p className="muted">
          Sailan Tech will review your details. If you signed in before
          submitting, you can follow the request in your account.
        </p>
        <Link href="/account" className="button blue">
          View my account <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <form
      className="panel service-form stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const data = new FormData(e.currentTarget);
        try {
          let certificate = "";
          if (file) {
            if (!user)
              throw new Error(
                "Sign in before attaching a resale certificate. You can submit the application without a file.",
              );
            const fd = new FormData();
            fd.set("file", file);
            fd.set("kind", "certificate");
            const res = await fetch("/api/uploads", {
              method: "POST",
              body: fd,
            });
            const upload = await res.json();
            if (!res.ok) throw new Error(upload.error);
            certificate = upload.id;
          }
          const values = Object.fromEntries(data);
          const r = await api<{ reference: string }>("/api/requests", "POST", {
            ...values,
            kind,
            certificate,
            productsInterested: data.getAll("productsInterested"),
            consent: data.get("consent") === "on",
          });
          setResult(r.reference);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>
        {wholesale
          ? "Tell us about your business."
          : kind === "repair"
            ? "Tell us what needs attention."
            : kind === "manual-quote"
              ? "Tell us about your device."
              : "How can we help?"}
      </h2>
      <div className="form-grid">
        {wholesale && (
          <label className="field full-span">
            <span>Business name</span>
            <input name="businessName" required maxLength={200} />
          </label>
        )}
        <label className="field">
          <span>Full name</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            defaultValue={user?.name}
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            required
            maxLength={254}
            defaultValue={user?.email}
          />
        </label>
        <label className="field">
          <span>Phone</span>
          <input
            type="tel"
            name="phone"
            required
            minLength={7}
            maxLength={30}
            defaultValue={user?.phone}
          />
        </label>
        {wholesale ? (
          <>
            <label className="field">
              <span>Website (optional)</span>
              <input name="website" type="url" placeholder="https://" />
            </label>
            <label className="field">
              <span>Business type</span>
              <select name="businessType" required>
                <option value="">Choose one</option>
                {[
                  "Retail store",
                  "Repair business",
                  "Online reseller",
                  "School / organization",
                  "Other business",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Monthly device volume</span>
              <select name="monthlyVolume" required>
                <option value="">Choose volume</option>
                {["1–10", "11–50", "51–100", "100+"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <fieldset className="interest-fields full-span">
              <legend>Products you’re interested in</legend>
              {[
                "Bulk phones",
                "Tablets",
                "MacBooks",
                "Laptops",
                "Repair lots",
                "Mixed electronics",
              ].map((x) => (
                <label className="check-label" key={x}>
                  <input name="productsInterested" type="checkbox" value={x} />
                  {x}
                </label>
              ))}
            </fieldset>
            <label className="field full-span">
              <span>Resale certificate (PDF or image, up to 4 MB)</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <small>
                {user
                  ? "Stored privately for your application."
                  : "Sign in to attach a certificate, or provide it after we review your application."}
              </small>
            </label>
          </>
        ) : (
          <>
            <label className="field">
              <span>
                {kind === "repair" || kind === "manual-quote"
                  ? "Device model"
                  : "Order or quote reference (optional)"}
              </span>
              <input
                name={
                  kind === "repair" || kind === "manual-quote"
                    ? "device"
                    : "reference"
                }
                required={kind === "repair" || kind === "manual-quote"}
                placeholder={kind === "repair" ? "e.g. iPhone 15 Pro" : ""}
                maxLength={200}
              />
            </label>
            {kind === "repair" && (
              <label className="field full-span">
                <span>Repair service</span>
                <select name="service" required>
                  <option value="">Choose a service</option>
                  {[
                    "Screen",
                    "Battery",
                    "Charging Port",
                    "Camera",
                    "Back Glass",
                    "Software",
                    "Data Transfer",
                    "Diagnostics",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}
        <label className="field full-span">
          <span>{wholesale ? "Notes and requirements" : "Tell us more"}</span>
          <textarea
            name="message"
            required
            minLength={8}
            maxLength={6000}
            placeholder={
              wholesale
                ? "Models, quantities, conditions, or your buying requirements."
                : "Include the model, what happened, and anything else we should know."
            }
          />
        </label>
      </div>
      <label className="check-label">
        <input name="consent" type="checkbox" required />
        <span>
          I agree to be contacted about this request and have reviewed the{" "}
          <Link href="/privacy" className="text-link">
            privacy notice
          </Link>
          .
        </span>
      </label>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <button disabled={busy} className="button blue">
        {busy
          ? "Submitting…"
          : wholesale
            ? "Submit wholesale application"
            : "Send request"}{" "}
        <ArrowRight size={17} />
      </button>
      <small>
        Submitting a request does not book a repair or commit you to a purchase.
      </small>
    </form>
  );
}
export function ServicePage({
  kind,
}: {
  kind: "repair" | "wholesale" | "support" | "manual-quote";
}) {
  const wholesale = kind === "wholesale";
  return (
    <div className="wrap page-space">
      <div className="page-head">
        <p className="eyebrow">
          {wholesale
            ? "SAILAN TECH WHOLESALE"
            : kind === "repair"
              ? "SAILAN TECH REPAIRS"
              : "HERE TO HELP"}
        </p>
        <h1>
          {wholesale ? (
            <>
              More devices.
              <br />
              More possibilities.
            </>
          ) : kind === "repair" ? (
            <>
              Give your tech
              <br />a second chance.
            </>
          ) : kind === "manual-quote" ? (
            "Let’s value your device."
          ) : (
            "Let’s get it sorted."
          )}
        </h1>
        <p>
          {wholesale
            ? "Tell us what your business needs. We’ll review your application and discuss available inventory."
            : kind === "repair"
              ? "Phones, tablets, computers, and consoles. Tell us what’s wrong and we’ll help you find the next step."
              : "Ask about a device, your order, a selling estimate, or an existing request."}
        </p>
      </div>
      <div className="service-layout">
        <aside>
          <div className="service-intro">
            <Wrench size={32} strokeWidth={1.2} />
            <h2>
              {wholesale
                ? "Built around your business."
                : kind === "repair"
                  ? "Start with a clear plan."
                  : "A real conversation."}
            </h2>
            <p>
              {wholesale
                ? "Choose the products, quantities, and condition grades that fit your operation. A team member will confirm pricing and availability."
                : kind === "repair"
                  ? "Describe the issue. We’ll review the details and confirm the diagnostic process, pricing, and timing before any repair."
                  : "Include your order or quote reference if you have one so we can find the right details."}
            </p>
          </div>
          {kind === "repair" && (
            <div className="repair-types">
              {[
                [Smartphone, "Phone & tablet"],
                [Laptop, "Laptop & desktop"],
                [Gamepad2, "Gaming console"],
              ].map(([Icon, l]) => {
                const I = Icon as typeof Smartphone;
                return (
                  <div key={String(l)}>
                    <I size={21} />
                    <span>{String(l)}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="notice">
            {wholesale
              ? "Applications are reviewed before wholesale access is approved. Uploading a certificate does not automatically grant tax-exempt status."
              : "Do not include passwords, payment card numbers, or account recovery codes in your message."}
          </div>
          <Link href="/account" className="text-link">
            Track existing requests <ArrowRight size={17} />
          </Link>
        </aside>
        <ServiceForm kind={kind} />
      </div>
    </div>
  );
}
