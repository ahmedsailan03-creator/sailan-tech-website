"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Smartphone,
  Laptop,
  Gamepad2,
  Watch,
  Monitor,
  Tablet,
  Search,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";
import {
  sellCategories,
  money,
  type DeviceModel,
  type QuoteInput,
  type Estimate,
  type PricingPolicy,
} from "@/lib/types";
import { api, useStore } from "./Store";
const steps = [
  "Device",
  "Brand",
  "Model",
  "Details",
  "Condition",
  "Included",
  "Your estimate",
];
const blank: QuoteInput = {
  category: "",
  brand: "",
  modelId: "",
  specs: {},
  condition: {},
  accessories: [],
};
import {
  computerCats,
  consoleCats,
  mobileCats,
  accessoryOptions,
} from "@/lib/device";
const icons = (c: string) =>
  computerCats.includes(c)
    ? c === "MacBook" || c === "Laptop"
      ? Laptop
      : Monitor
    : consoleCats.includes(c)
      ? Gamepad2
      : c.includes("Watch") || c === "Smartwatch"
        ? Watch
        : c === "iPad" || c === "Tablet"
          ? Tablet
          : Smartphone;
const questionList: [string, string, string[]][] = [
  ["power", "Does the device power on?", ["Yes", "No"]],
  [
    "screen",
    "Is the screen cracked?",
    ["No", "Small crack", "Major crack", "Screen does not work"],
  ],
  [
    "touch",
    "Does the touchscreen work correctly?",
    ["Yes", "No", "Not applicable"],
  ],
  [
    "biometrics",
    "Does Face ID, Touch ID, or fingerprint unlock work?",
    ["Yes", "No", "Not applicable"],
  ],
  [
    "cosmetics",
    "How much wear is on the body?",
    ["None", "Light", "Moderate", "Heavy"],
  ],
  ["back", "Is the back glass cracked?", ["No", "Yes", "Not applicable"]],
  ["liquid", "Has the device had liquid damage?", ["No", "Yes", "Not sure"]],
  [
    "carrier",
    "Is the device carrier locked?",
    ["Unlocked", "Locked", "Not sure"],
  ],
  [
    "activation",
    "Are owner accounts and activation locks removed?",
    ["Yes", "No", "Not sure"],
  ],
  [
    "battery",
    "What is the battery health?",
    ["90–100%", "80–89%", "Below 80%", "Unknown"],
  ],
];
export function QuoteWizard({
  models,
  policy,
  initialCategory = "",
}: {
  models: DeviceModel[];
  policy: PricingPolicy;
  initialCategory?: string;
}) {
  const [input, setInput] = useState<QuoteInput>(blank);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [result, setResult] = useState<{
    reference: string;
    shippingInstructions: string;
    inspectionInstructions: string;
    sample: boolean;
  } | null>(null);
  const { user } = useStore();
  useEffect(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("sailan-quote-draft") || "null",
      );
      if (saved?.input?.modelId && saved.step < 7) {
        setInput(saved.input);
        setStep(saved.step);
        setEstimate(saved.estimate || null);
      } else if (initialCategory) {
        const c = sellCategories.find(
          (c) => c.toLowerCase() === initialCategory.toLowerCase(),
        );
        if (c) {
          setInput({ ...blank, category: c });
          setStep(1);
        }
      }
    } catch {}
    setReady(true);
  }, [initialCategory]);
  useEffect(() => {
    if (ready)
      sessionStorage.setItem(
        "sailan-quote-draft",
        JSON.stringify({ input, step, estimate }),
      );
  }, [input, step, estimate, ready]);
  const computer = computerCats.includes(input.category),
    consoleDevice = consoleCats.includes(input.category),
    mobile = mobileCats.includes(input.category);
  const brands = [
    ...new Set(
      models
        .filter((m) => m.category === input.category && m.enabled)
        .map((m) => m.brand),
    ),
  ];
  const choices = models.filter(
    (m) =>
      m.category === input.category &&
      m.brand === input.brand &&
      m.enabled &&
      m.name.toLowerCase().includes(search.toLowerCase()),
  );
  const model = models.find((m) => m.id === input.modelId);
  const relevant = questionList.filter(
    ([key]) =>
      !(
        ["screen", "touch", "biometrics", "back", "battery"].includes(key) &&
        consoleDevice
      ) &&
      !(
        ["screen", "touch", "biometrics", "back", "battery"].includes(key) &&
        ["Desktop", "Gaming PC"].includes(input.category)
      ) &&
      !(key === "back" && computer) &&
      !(key === "carrier" && !mobile),
  );
  const setSpec = (key: string, value: string) =>
    setInput({ ...input, specs: { ...input.specs, [key]: value } });
  const chooseModel = (m: DeviceModel) => {
    const na: Record<string, string> = {};
    for (const [k] of questionList) {
      if (!relevant.some(([r]) => r === k)) na[k] = "Not applicable";
    }
    setInput({
      ...input,
      modelId: m.id,
      specs: {
        storage: m.storage[0],
        ...(computer
          ? {
              cpu: m.configurations?.cpu[0] || "",
              ram: m.configurations?.ram[0] || "",
              gpu: m.configurations?.gpu[0] || "",
              screenSize: "Not applicable",
            }
          : {}),
        ...(consoleDevice ? { edition: "Standard", controllers: "0" } : {}),
      },
      condition: na,
    });
    setStep(3);
    setSearch("");
  };
  const next = async () => {
    setError("");
    if (
      step === 3 &&
      (!input.specs.storage ||
        (computer &&
          (!input.specs.ram || !input.specs.cpu || !input.specs.gpu)))
    ) {
      setError("Please complete the device details.");
      return;
    }
    if (step === 4 && relevant.some(([key]) => !input.condition[key])) {
      setError("Please answer each condition question.");
      return;
    }
    if (step === 5) {
      setBusy(true);
      try {
        const r = await api<{ estimate: Estimate }>(
          "/api/quote",
          "POST",
          input,
        );
        setEstimate(r.estimate);
        setStep(6);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    } else setStep(step + 1);
  };
  const reset = () => {
    setInput(blank);
    setStep(0);
    setEstimate(null);
    setResult(null);
    setAccepting(false);
    setError("");
    sessionStorage.removeItem("sailan-quote-draft");
  };
  if (result)
    return (
      <div className="wrap page-space quote-complete">
        <div className="success-icon">
          <Check size={30} />
        </div>
        <p className="eyebrow">
          {result.sample ? "SAMPLE QUOTE SAVED" : "QUOTE ACCEPTED"}
        </p>
        <h1>A new chapter starts here.</h1>
        <p className="large-copy">
          Your reference is <strong>{result.reference}</strong>.
        </p>
        {result.sample && (
          <div className="notice">
            This is a sample workflow. Do not ship or drop off a device for this
            sample quote.
          </div>
        )}
        <div className="next-steps">
          <div>
            <PackageCheck />
            <h2>Get your device ready.</h2>
            <p>{result.shippingInstructions}</p>
          </div>
          <div>
            <ShieldCheck />
            <h2>We’ll confirm the offer.</h2>
            <p>{result.inspectionInstructions}</p>
          </div>
        </div>
        <p className="muted">
          Timing is confirmed when your device handoff is arranged. Track
          updates in your account.
        </p>
        <div className="actions">
          <Link href="/account" className="button blue">
            Track my device <ArrowRight size={17} />
          </Link>
          <button className="text-button" onClick={reset}>
            Quote another device
          </button>
        </div>
      </div>
    );
  return (
    <div className="sell-page">
      <div className="wrap">
        <div className="page-head">
          <p className="eyebrow">SELL TO SAILAN TECH</p>
          <h1>
            Sell your tech.
            <br />
            <span>See what’s possible.</span>
          </h1>
          <p>
            A few details. An instant estimate. A final offer after inspection.
          </p>
        </div>
        <div className="quote-layout">
          <aside className="quote-progress">
            <ol>
              {steps.map((name, i) => (
                <li
                  key={name}
                  className={`${step === i ? "current" : ""} ${step > i ? "done" : ""}`}
                >
                  <button
                    disabled={i > step}
                    onClick={() => {
                      setStep(i);
                      setAccepting(false);
                      setError("");
                    }}
                  >
                    <span>
                      {step > i ? (
                        <Check size={14} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    {name}
                  </button>
                </li>
              ))}
            </ol>
            <div className="quote-progress-note">
              <ShieldCheck size={23} />
              <p>
                Your estimate is based on the details you provide. Final payment
                is confirmed after inspection.
              </p>
            </div>
          </aside>
          <section className="quote-card">
            <div className="quote-top">
              <span>STEP {String(step + 1).padStart(2, "0")} OF 07</span>
              <button onClick={reset} className="text-button">
                <RotateCcw size={14} /> Start over
              </button>
            </div>
            <div className="mobile-progress">
              <div style={{ width: `${((step + 1) / 7) * 100}%` }} />
            </div>
            {step === 0 && (
              <>
                <h2>What are you selling?</h2>
                <p className="muted">Choose your device to get started.</p>
                <div className="device-picker">
                  {sellCategories.map((c) => {
                    const Icon = icons(c);
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          setInput({ ...blank, category: c });
                          setStep(1);
                        }}
                      >
                        <Icon size={30} strokeWidth={1.3} />
                        <span>{c}</span>
                        <ArrowRight size={15} />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h2>Who made your {input.category.toLowerCase()}?</h2>
                <p className="muted">Select the brand on your device.</p>
                <div className="choice-grid">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setInput({ ...input, brand: b, modelId: "" });
                        setStep(2);
                      }}
                    >
                      {b}
                      <ArrowRight size={17} />
                    </button>
                  ))}
                </div>
                {!brands.length && (
                  <div className="empty-state">
                    <h2>Let’s take a closer look.</h2>
                    <p>
                      This category needs a personal quote. Tell us the model
                      and specifications.
                    </p>
                    <Link
                      className="button blue"
                      href="/support?type=manual-quote"
                    >
                      Request a personal quote
                    </Link>
                  </div>
                )}
              </>
            )}
            {step === 2 && (
              <>
                <h2>Which model do you have?</h2>
                <p className="muted">
                  {input.brand} · {input.category}
                </p>
                <label className="catalog-search model-search">
                  <Search size={18} />
                  <input
                    placeholder="Search your model"
                    aria-label="Search device models"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <div className="model-picker">
                  {choices.map((m) => (
                    <button key={m.id} onClick={() => chooseModel(m)}>
                      <span>{m.name}</span>
                      <ArrowRight size={17} />
                    </button>
                  ))}
                </div>
                <Link href="/support?type=manual-quote" className="text-link">
                  Can’t find your model? Request a personal quote.
                </Link>
              </>
            )}
            {step === 3 && (
              <>
                <h2>Make it specific.</h2>
                <p className="muted">{model?.name}</p>
                <div className="form-grid quote-fields">
                  <label className="field">
                    <span>Storage</span>
                    <select
                      value={input.specs.storage || ""}
                      onChange={(e) => setSpec("storage", e.target.value)}
                    >
                      {model?.storage.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  {computer &&
                    (["cpu", "ram", "gpu"] as const).map((key) => (
                      <label className="field" key={key}>
                        <span>{key.toUpperCase()}</span>
                        <select
                          value={input.specs[key] || ""}
                          onChange={(e) => setSpec(key, e.target.value)}
                        >
                          <option value="">Choose {key.toUpperCase()}</option>
                          {(model?.configurations?.[key] || []).map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                    ))}
                  {computer && (
                    <label className="field">
                      <span>Screen size</span>
                      <select
                        value={input.specs.screenSize || ""}
                        onChange={(e) => setSpec("screenSize", e.target.value)}
                      >
                        {[
                          "Not applicable",
                          "13-inch",
                          "14-inch",
                          "15-inch",
                          "16-inch",
                          "17-inch",
                          "Other",
                        ].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {mobile && (
                    <>
                      <label className="field">
                        <span>Network carrier</span>
                        <select
                          value={input.specs.network || ""}
                          onChange={(e) => setSpec("network", e.target.value)}
                        >
                          <option value="">Choose carrier</option>
                          {[
                            "Unlocked",
                            "Verizon",
                            "AT&T",
                            "T-Mobile",
                            "Wi-Fi only",
                            "Other",
                          ].map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        <span>Color</span>
                        <input
                          placeholder="e.g. Natural Titanium"
                          value={input.specs.color || ""}
                          onChange={(e) => setSpec("color", e.target.value)}
                        />
                      </label>
                    </>
                  )}
                  {consoleDevice && (
                    <>
                      <label className="field">
                        <span>Edition</span>
                        <select
                          value={input.specs.edition || "Standard"}
                          onChange={(e) => setSpec("edition", e.target.value)}
                        >
                          {[
                            "Standard",
                            "Digital",
                            "Disc",
                            "Special edition",
                          ].map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        <span>Included controllers</span>
                        <select
                          value={input.specs.controllers || "0"}
                          onChange={(e) =>
                            setSpec("controllers", e.target.value)
                          }
                        >
                          {["0", "1", "2", "3", "4"].map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}
                </div>
                <p className="meta">
                  If your configuration is not listed, request a personal quote
                  for an accurate estimate.
                </p>
              </>
            )}
            {step === 4 && (
              <>
                <h2>A little honesty goes a long way.</h2>
                <p className="muted">
                  Help us understand the condition of your {model?.name}.
                </p>
                <div className="condition-questions">
                  {relevant.map(([key, title, options]) => (
                    <fieldset key={key}>
                      <legend>{title}</legend>
                      <div className="answer-options">
                        {options
                          .filter(
                            (o) =>
                              !(
                                key === "touch" &&
                                mobile &&
                                o === "Not applicable"
                              ),
                          )
                          .map((o) => (
                            <label
                              className={
                                input.condition[key] === o ? "selected" : ""
                              }
                              key={o}
                            >
                              <input
                                type="radio"
                                name={key}
                                value={o}
                                checked={input.condition[key] === o}
                                onChange={() =>
                                  setInput({
                                    ...input,
                                    condition: { ...input.condition, [key]: o },
                                  })
                                }
                              />
                              <span>{o}</span>
                            </label>
                          ))}
                      </div>
                      {key === "activation" && (
                        <small>
                          We cannot buy a device that remains locked to
                          someone’s account.
                        </small>
                      )}
                    </fieldset>
                  ))}
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <h2>What’s coming with it?</h2>
                <p className="muted">
                  Select everything you plan to include, or continue with the
                  device only.
                </p>
                <div className="accessories-picker">
                  {accessoryOptions(input.category).map((a) => (
                    <label
                      className={
                        input.accessories.includes(a) ? "selected" : ""
                      }
                      key={a}
                    >
                      <input
                        type="checkbox"
                        checked={input.accessories.includes(a)}
                        onChange={(e) =>
                          setInput({
                            ...input,
                            accessories: e.target.checked
                              ? [...input.accessories, a]
                              : input.accessories.filter((x) => x !== a),
                          })
                        }
                      />
                      <span>{a}</span>
                      <Check size={16} />
                    </label>
                  ))}
                </div>
                <p className="meta">
                  {input.accessories.length
                    ? `${input.accessories.length} included items selected.`
                    : "Device only selected."}
                </p>
              </>
            )}
            {step === 6 && estimate && (
              <>
                {estimate.eligibility === "eligible" ? (
                  <>
                    <p className="eyebrow estimate-eyebrow">
                      YOUR ESTIMATED SAILAN TECH OFFER
                    </p>
                    <h2 className="estimate-value">{money(estimate.total)}</h2>
                    <p className="estimate-model">
                      {model?.name} · {input.specs.storage}
                    </p>
                    {estimate.sample && (
                      <p className="notice">
                        Example estimate using sample pricing. The owner must
                        approve purchase prices before live offers open.
                      </p>
                    )}
                    <dl className="estimate-breakdown">
                      <div>
                        <dt>Base device value</dt>
                        <dd>{money(estimate.base)}</dd>
                      </div>
                      <div>
                        <dt>Configuration adjustment</dt>
                        <dd>{money(estimate.configuration)}</dd>
                      </div>
                      {estimate.breakdown.map((b, i) => (
                        <div key={i}>
                          <dt>{b.label}</dt>
                          <dd>{money(b.amount)}</dd>
                        </div>
                      ))}
                      {estimate.accessories > 0 && (
                        <div>
                          <dt>Included accessories</dt>
                          <dd>+{money(estimate.accessories)}</dd>
                        </div>
                      )}
                      {estimate.cap < 0 && (
                        <div>
                          <dt>Maximum purchase offer adjustment</dt>
                          <dd>{money(estimate.cap)}</dd>
                        </div>
                      )}
                      <div className="total">
                        <dt>Final estimated quote</dt>
                        <dd>{money(estimate.total)}</dd>
                      </div>
                    </dl>
                    <p className="estimate-disclaimer">
                      This is an estimated quote, not a guaranteed payment. The
                      final offer may change after device inspection. You can
                      accept or decline a revised offer.
                    </p>
                    {!accepting ? (
                      <div className="actions">
                        {user ? (
                          <button
                            className="button blue"
                            onClick={() => setAccepting(true)}
                          >
                            {estimate.sample
                              ? "Save sample quote"
                              : "Accept quote"}{" "}
                            <ArrowRight size={17} />
                          </button>
                        ) : (
                          <Link
                            className="button blue"
                            href="/account?next=sell"
                          >
                            Sign in to accept <ArrowRight size={17} />
                          </Link>
                        )}
                        <button
                          className="text-button"
                          onClick={() => setStep(3)}
                        >
                          Edit device
                        </button>
                      </div>
                    ) : (
                      <form
                        className="stack accept-form"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          setBusy(true);
                          setError("");
                          try {
                            const data = await api<{
                              reference: string;
                              shippingInstructions: string;
                              inspectionInstructions: string;
                              sample: boolean;
                            }>("/api/quotes", "POST", {
                              input,
                              expectedTotal: estimate.total,
                              contact: {
                                name: f.get("name"),
                                email: f.get("email"),
                                phone: f.get("phone"),
                                address: f.get("address"),
                                serial: f.get("serial"),
                                method: f.get("method"),
                                consent: f.get("consent") === "on",
                              },
                            });
                            setResult(data);
                            sessionStorage.removeItem("sailan-quote-draft");
                          } catch (e) {
                            setError((e as Error).message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        <h3>Where should we keep you updated?</h3>
                        <div className="form-grid">
                          {[
                            ["name", "Full name", user?.name || "", "text"],
                            ["email", "Email", user?.email || "", "email"],
                            ["phone", "Phone", user?.phone || "", "tel"],
                            ["serial", "IMEI or serial number", "", "text"],
                          ].map(([name, label, value, type]) => (
                            <label className="field" key={name}>
                              <span>{label}</span>
                              <input
                                required
                                name={name}
                                type={type}
                                defaultValue={value}
                                maxLength={name === "serial" ? 80 : 150}
                              />
                            </label>
                          ))}
                          <label className="field full-span">
                            <span>Mailing address</span>
                            <textarea
                              required
                              name="address"
                              minLength={8}
                              maxLength={600}
                            />
                          </label>
                          <label className="field full-span">
                            <span>How would you like to sell?</span>
                            <select name="method">
                              <option>Ship Device</option>
                              <option>Local Drop-Off</option>
                            </select>
                          </label>
                        </div>
                        <label className="check-label">
                          <input type="checkbox" name="consent" required />
                          <span>
                            I own this device, can remove its account locks, and
                            understand the final offer depends on inspection. I
                            have reviewed the{" "}
                            <Link href="/privacy" className="text-link">
                              privacy notice
                            </Link>
                            .
                          </span>
                        </label>
                        <button className="button blue" disabled={busy}>
                          {busy
                            ? "Saving…"
                            : estimate.sample
                              ? "Save sample quote"
                              : "Confirm estimated quote"}{" "}
                          <ArrowRight size={17} />
                        </button>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="quote-review">
                    <ShieldCheck size={40} strokeWidth={1.2} />
                    <h2>
                      {estimate.eligibility === "declined"
                        ? "Remove the device lock first."
                        : "This one needs a closer look."}
                    </h2>
                    <p>{estimate.reason}</p>
                    <div className="actions">
                      <button
                        className="button outline"
                        onClick={() => setStep(4)}
                      >
                        Edit condition
                      </button>
                      <Link
                        className="text-link"
                        href="/support?type=manual-quote"
                      >
                        Request help <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            <div className="quote-navigation">
              {step > 0 && (
                <button
                  className="text-button"
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                    setAccepting(false);
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {step >= 3 && step < 6 && (
                <button className="button blue" onClick={next} disabled={busy}>
                  {busy
                    ? "Calculating…"
                    : step === 5
                      ? "See my estimate"
                      : "Continue"}{" "}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
