"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Smartphone,
  SlidersHorizontal,
  ShoppingBag,
  LifeBuoy,
  Users,
  Settings,
  Plus,
  ArrowUpRight,
  X,
  Check,
  Upload,
  Search,
  Tag,
  Wallet,
} from "lucide-react";
import { Brand } from "./Brand";
import { api, useStore } from "./Store";
import {
  money,
  categories,
  conditions,
  productStatuses,
  sellCategories,
  type PrivateProduct,
  type DeviceModel,
  type PricingPolicy,
} from "@/lib/types";
import { type AdminData, type BuyQuote, date } from "@/lib/views";
import { transitions } from "@/lib/flow";
const tabs = [
  ["Overview", LayoutDashboard],
  ["Products", Package],
  ["Sell to Sailan Tech", Smartphone],
  ["Purchase pricing", SlidersHorizontal],
  ["Orders", ShoppingBag],
  ["Requests", LifeBuoy],
  ["Customers", Users],
  ["Discounts", Tag],
  ["Payments", Wallet],
  ["Store settings", Settings],
] as const;
const emptyProduct: PrivateProduct = {
  revision: 0,
  id: "",
  slug: "",
  sku: "",
  title: "",
  brand: "",
  model: "",
  category: "Phones",
  condition: "Excellent",
  storage: "",
  ram: "",
  cpu: "",
  gpu: "",
  carrier: "",
  color: "",
  batteryHealth: "",
  price: 0,
  quantity: 1,
  status: "Incoming",
  description: "",
  images: ["/brand/sailan-official.png"],
  specifications: {},
  included: [],
  featured: false,
  sample: true,
  discount: 0,
  soldCount: 0,
  createdAt: "",
  cost: 0,
  supplier: "",
  purchaseDate: "",
  imei: "",
  serial: "",
  weight: "",
};
export function Admin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState("Overview");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<PrivateProduct | null>(null);
  const [search, setSearch] = useState("");
  const [quote, setQuote] = useState<BuyQuote | null>(null);
  const { notify } = useStore();
  const router = useRouter();
  const load = async () => {
    setData(await api<AdminData>("/api/admin"));
  };
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  const save = async (url: string, body: unknown, method = "POST") => {
    setBusy(true);
    setError("");
    try {
      await api(url, method, body);
      await load();
      router.refresh();
      notify("Changes saved.");
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  if (!data)
    return (
      <div className="wrap section">
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="loading">Loading store administration…</div>
        )}
      </div>
    );
  const paid = data.orders.filter((o) =>
    ["Paid", "Shipped", "Completed"].includes(o.status),
  );
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(now);
  const period = (days: number) =>
    paid
      .filter((o) => Date.parse(o.created_at) >= Date.now() - days * 86400000)
      .reduce((n, o) => n + o.total, 0);
  const revenue = paid.reduce((n, o) => n + o.total, 0);
  const activeQuotes = data.quotes.filter(
    (q) => !["Completed", "Cancelled"].includes(q.status),
  );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand />
        <p className="admin-label">STORE MANAGEMENT</p>
        <nav aria-label="Admin sections">
          {tabs.map(([name, Icon]) => (
            <button
              key={name}
              className={tab === name ? "active" : ""}
              onClick={() => {
                setTab(name);
                setError("");
                setQuote(null);
              }}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
        </nav>
        <Link href="/" className="text-link">
          View storefront <ArrowUpRight size={16} />
        </Link>
      </aside>
      <div className="admin-main">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">SAILAN TECH SOLUTIONS LLC</p>
            <h1>{tab === "Overview" ? "Your store, at a glance." : tab}</h1>
          </div>
          <span className="status-pill">
            {data.settings.live ? "Store open" : "Preview mode"}
          </span>
        </div>
        {error && (
          <div className="error-message admin-error" role="alert">
            {error}
          </div>
        )}
        {tab === "Overview" && (
          <>
            <div className="admin-metrics">
              {[
                [
                  "Today’s revenue",
                  money(
                    paid
                      .filter(
                        (o) =>
                          new Intl.DateTimeFormat("en-CA", {
                            timeZone: "America/New_York",
                          }).format(new Date(o.created_at)) === today,
                      )
                      .reduce((n, o) => n + o.total, 0),
                  ),
                ],
                ["Last 7 days", money(period(7))],
                [
                  "This month",
                  money(
                    paid
                      .filter(
                        (o) =>
                          new Intl.DateTimeFormat("en-CA", {
                            timeZone: "America/New_York",
                          })
                            .format(new Date(o.created_at))
                            .slice(0, 7) === today.slice(0, 7),
                      )
                      .reduce((n, o) => n + o.total, 0),
                  ),
                ],
                [
                  "Average paid order",
                  money(paid.length ? Math.round(revenue / paid.length) : 0),
                ],
              ].map(([l, v]) => (
                <div key={l}>
                  <span>{l}</span>
                  <strong>{v}</strong>
                  <small>Confirmed orders only</small>
                </div>
              ))}
            </div>
            <div className="admin-overview-grid">
              <div className="panel">
                <h2 className="section-subhead">What needs your attention</h2>
                {[
                  ["Orders", data.orders.length, "Orders"],
                  [
                    "Active device quotes",
                    activeQuotes.length,
                    "Sell to Sailan Tech",
                  ],
                  [
                    "Awaiting inspection",
                    data.quotes.filter((q) =>
                      ["Device Received", "Inspection"].includes(q.status),
                    ).length,
                    "Sell to Sailan Tech",
                  ],
                  [
                    "Repair requests",
                    data.requests.filter(
                      (r) =>
                        r.kind === "repair" &&
                        !["Completed", "Closed"].includes(r.status),
                    ).length,
                    "Requests",
                  ],
                  [
                    "Wholesale applications",
                    data.requests.filter(
                      (r) =>
                        r.kind === "wholesale" &&
                        !["Completed", "Closed"].includes(r.status),
                    ).length,
                    "Requests",
                  ],
                  [
                    "Low stock (2 or fewer)",
                    data.products.filter((p) => !p.sample && p.quantity <= 2)
                      .length,
                    "Products",
                  ],
                ].map(([l, n, t]) => (
                  <button
                    className="attention-row"
                    key={l}
                    onClick={() => setTab(String(t))}
                  >
                    <span>{l}</span>
                    <strong>{n}</strong>
                    <ArrowUpRight size={15} />
                  </button>
                ))}
              </div>
              <div className="panel">
                <h2 className="section-subhead">Launch setup</h2>
                <p className="muted admin-note">
                  Sales stay closed until required business settings and
                  integrations are ready.
                </p>
                {[
                  ["Persistent database", data.ready.database],
                  ["Payment provider", data.ready.stripe],
                  ["Signed payment notifications", data.ready.webhook],
                  ["Checkout website address", data.ready.origin],
                  ["Approved purchase pricing", data.policy.approved],
                  [
                    "Live product inventory",
                    data.products.some((p) => !p.sample && p.quantity > 0),
                  ],
                  [
                    "Published store terms",
                    Boolean(
                      data.settings.privacyText && data.settings.termsText,
                    ),
                  ],
                ].map(([l, v]) => (
                  <div className="setup-row" key={String(l)}>
                    <span>{String(l)}</span>
                    <span className={v ? "configured" : ""}>
                      {v ? <Check size={15} /> : "Pending"}
                    </span>
                  </div>
                ))}
                <button
                  className="text-button"
                  onClick={() => setTab("Store settings")}
                >
                  Open store settings
                </button>
              </div>
            </div>
            <div className="admin-summary-line">
              <span>{data.products.length} listings</span>
              <span>
                {data.products.reduce((n, p) => n + p.quantity, 0)} units in
                inventory
              </span>
              <span>
                {data.products.reduce((n, p) => n + p.soldCount, 0)} products
                sold
              </span>
              <span>{data.customers.length} customers & staff</span>
            </div>
          </>
        )}
        {tab === "Products" && (
          <>
            <div className="admin-toolbar">
              <label className="catalog-search">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, SKU, brand"
                />
              </label>
              <button
                className="button blue"
                onClick={() => setEditor({ ...emptyProduct })}
              >
                <Plus size={17} /> Add product
              </button>
            </div>
            <div className="table-scroll panel table-panel">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Condition</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.products
                    .filter((p) =>
                      `${p.title} ${p.sku} ${p.brand}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.title}</strong>
                          <small className="block">
                            {p.storage} · {p.sample ? "Sample" : "Live"}
                          </small>
                        </td>
                        <td>{p.sku}</td>
                        <td>{p.condition}</td>
                        <td>{money(p.price)}</td>
                        <td>{p.quantity}</td>
                        <td>
                          <span className="status-pill">{p.status}</span>
                        </td>
                        <td>
                          <button
                            className="text-button"
                            onClick={() => setEditor(p)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {tab === "Sell to Sailan Tech" && (
          <>
            {quote ? (
              <QuoteAdmin
                quote={data.quotes.find((q) => q.id === quote.id) || quote}
                busy={busy}
                save={save}
                back={() => setQuote(null)}
              />
            ) : (
              <>
                <p className="admin-note muted">
                  Manage incoming devices, inspect condition, send revised
                  offers to the customer’s account, and record completed
                  payouts.
                </p>
                <div className="table-scroll panel table-panel">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Reference / device</th>
                        <th>Customer</th>
                        <th>Estimate</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {data.quotes.map((q) => (
                        <tr key={q.id}>
                          <td>
                            {q.reference}
                            <small className="block">
                              {q.body.model}
                              {q.body.sample ? " · Sample" : ""}
                            </small>
                          </td>
                          <td>{q.body.customer.name}</td>
                          <td>{money(q.amount)}</td>
                          <td>
                            <span className="status-pill">{q.status}</span>
                          </td>
                          <td>
                            <button
                              className="text-button"
                              onClick={() => setQuote(q)}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!data.quotes.length && (
                    <AdminEmpty text="Accepted device quotes will appear here." />
                  )}
                </div>
              </>
            )}
          </>
        )}
        {tab === "Purchase pricing" && (
          <Pricing data={data} save={save} busy={busy} />
        )}
        {tab === "Orders" && (
          <div className="stack">
            {!data.orders.length ? (
              <AdminEmpty text="Orders will appear after a customer starts checkout." />
            ) : (
              data.orders.map((o) => (
                <article className="panel stack" key={o.id}>
                  <div className="row between">
                    <h2 className="section-subhead">
                      {o.reference} · {money(o.total)}
                    </h2>
                    <span className="status-pill">{o.status}</span>
                  </div>
                  <p className="meta">
                    {date(o.created_at)} · Customer{" "}
                    {data.customers.find((c) => c.id === o.user_id)?.email ||
                      o.user_id}
                  </p>
                  {o.body.items.map((i) => (
                    <div className="record-line" key={i.id}>
                      <span>
                        {i.title} × {i.quantity}
                      </span>
                      <strong>{money(i.price * i.quantity)}</strong>
                    </div>
                  ))}
                  {Boolean(o.body.shippingAddress) && (
                    <details>
                      <summary>Shipping address</summary>
                      <pre className="record-json">
                        {JSON.stringify(o.body.shippingAddress, null, 2)}
                      </pre>
                    </details>
                  )}
                  {o.status === "Pending payment" && (
                    <button
                      className="button outline small"
                      disabled={busy}
                      onClick={() =>
                        save(
                          `/api/admin/orders/${o.id}`,
                          { action: "reconcile" },
                          "PATCH",
                        )
                      }
                    >
                      Check provider payment status
                    </button>
                  )}
                  {o.status === "Paid" && (
                    <form
                      className="row"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        void save(
                          `/api/admin/orders/${o.id}`,
                          { status: "Shipped", tracking: f.get("tracking") },
                          "PATCH",
                        );
                      }}
                    >
                      <label className="field grow">
                        <span>Tracking reference</span>
                        <input required name="tracking" />
                      </label>
                      <button className="button blue" disabled={busy}>
                        Mark shipped
                      </button>
                    </form>
                  )}
                  {o.body.tracking && <p>Tracking: {o.body.tracking}</p>}
                  {o.status === "Shipped" && (
                    <button
                      className="button outline"
                      disabled={busy}
                      onClick={() =>
                        save(
                          `/api/admin/orders/${o.id}`,
                          { status: "Completed" },
                          "PATCH",
                        )
                      }
                    >
                      Mark completed
                    </button>
                  )}
                </article>
              ))
            )}
          </div>
        )}
        {tab === "Requests" && (
          <div className="stack">
            {!data.requests.length ? (
              <AdminEmpty text="Repair, wholesale, and support requests will appear here." />
            ) : (
              data.requests.map((r) => (
                <article className="panel stack" key={r.id}>
                  <div className="row between">
                    <div>
                      <p className="eyebrow">
                        {r.kind.toUpperCase()} · {r.reference}
                      </p>
                      <h2 className="section-subhead">
                        {r.body.businessName || r.body.name}
                      </h2>
                    </div>
                    <select
                      className="admin-select"
                      aria-label={`Status for ${r.reference}`}
                      value={r.status}
                      disabled={busy}
                      onChange={(e) =>
                        save(
                          `/api/admin/requests/${r.id}`,
                          { status: e.target.value },
                          "PATCH",
                        )
                      }
                    >
                      {[
                        "New",
                        "In review",
                        "Contacted",
                        "Approved",
                        "Completed",
                        "Closed",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                  <p>{r.body.message}</p>
                  <div className="request-details">
                    <span>{r.body.name}</span>
                    <span>{r.body.email}</span>
                    <span>{r.body.phone}</span>
                    <span>
                      {r.body.device} {r.body.service}
                    </span>
                    {r.body.businessType && (
                      <span>
                        {r.body.businessType} · {r.body.monthlyVolume}{" "}
                        devices/month
                      </span>
                    )}
                    {r.body.productsInterested && (
                      <span>{r.body.productsInterested.join(", ")}</span>
                    )}
                  </div>
                  {r.body.website && (
                    <p className="meta">Website: {r.body.website}</p>
                  )}
                  {r.body.certificate && (
                    <a
                      className="text-link"
                      href={`/api/files/${r.body.certificate}`}
                    >
                      Download resale certificate
                    </a>
                  )}
                  <small>{date(r.created_at)}</small>
                </article>
              ))
            )}
          </div>
        )}
        {tab === "Customers" && (
          <div className="table-scroll panel table-panel">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Quotes</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || "—"}</td>
                    <td>{c.role}</td>
                    <td>
                      {data.orders.filter((o) => o.user_id === c.id).length}
                    </td>
                    <td>
                      {data.quotes.filter((q) => q.user_id === c.id).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "Discounts" && (
          <div className="stack">
            <form
              className="panel stack"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void save("/api/admin/promos", {
                  code: f.get("code"),
                  percent: Number(f.get("percent")),
                  active: true,
                  expiresAt: f.get("expires")
                    ? new Date(String(f.get("expires"))).toISOString()
                    : "",
                });
              }}
            >
              <h2 className="section-subhead">Create or update a promo code</h2>
              <div className="form-grid">
                <label className="field">
                  <span>Code</span>
                  <input
                    name="code"
                    required
                    pattern="[A-Za-z0-9_-]+"
                    maxLength={30}
                  />
                </label>
                <label className="field">
                  <span>Discount (%)</span>
                  <input
                    name="percent"
                    type="number"
                    required
                    min="1"
                    max="90"
                  />
                </label>
                <label className="field">
                  <span>Expires (optional)</span>
                  <input name="expires" type="date" />
                </label>
              </div>
              <button className="button blue" disabled={busy}>
                Save discount
              </button>
            </form>
            {data.promos.map((p) => (
              <div className="panel row between" key={p.code}>
                <span>
                  <strong>{p.code}</strong> · {p.percent}% off{" "}
                  {p.expires_at && `· Ends ${date(p.expires_at)}`}
                </span>
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() =>
                    save("/api/admin/promos", {
                      code: p.code,
                      percent: p.percent,
                      active: !p.active,
                      expiresAt: p.expires_at || "",
                    })
                  }
                >
                  {p.active ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        )}
        {tab === "Payments" && (
          <>
            <p className="notice">
              These are records of completed payments made through an external
              provider. This dashboard does not transfer money.
            </p>
            <div
              className="table-scroll panel table-panel"
              style={{ marginTop: 24 }}
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quote</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>External reference</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payouts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {
                          data.quotes.find((q) => q.id === p.quote_id)
                            ?.reference
                        }
                      </td>
                      <td>{money(p.amount)}</td>
                      <td>{p.method}</td>
                      <td>{p.reference}</td>
                      <td>{date(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.payouts.length && (
                <AdminEmpty text="No completed seller payments have been recorded." />
              )}
            </div>
          </>
        )}
        {tab === "Store settings" && (
          <form
            className="panel stack"
            key={JSON.stringify(data.settings)}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void save("/api/admin/settings", {
                ...Object.fromEntries(f),
                live: f.get("live") === "on",
                shippingCents: Math.round(Number(f.get("shippingCents")) * 100),
              });
            }}
          >
            <h2 className="section-subhead">Store policies & operations</h2>
            <p className="admin-note muted">
              Publish only terms you have approved for your business. Customers
              see these on product pages, checkout, and information pages.
            </p>
            <div className="form-grid">
              <label className="field">
                <span>Support email</span>
                <input
                  type="email"
                  name="supportEmail"
                  defaultValue={data.settings.supportEmail}
                />
              </label>
              <label className="field">
                <span>Standard shipping ($)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="shippingCents"
                  defaultValue={data.settings.shippingCents / 100}
                />
              </label>
              {[
                ["shippingText", "Shipping terms"],
                ["returnsText", "Returns terms"],
                ["warrantyText", "Warranty terms"],
                ["inspectionText", "Inspection process"],
                ["dropoffInstructions", "Local drop-off instructions"],
                ["shipInstructions", "Device shipping instructions"],
                ["privacyText", "Privacy policy"],
                ["termsText", "Store terms"],
              ].map(([key, label]) => (
                <label className="field full-span" key={key}>
                  <span>{label}</span>
                  <textarea
                    name={key}
                    defaultValue={String(
                      data.settings[key as keyof typeof data.settings],
                    )}
                    rows={key.includes("Text") ? 4 : 3}
                  />
                </label>
              ))}
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                name="live"
                defaultChecked={data.settings.live}
              />
              <span>
                Open the store for live purchases. Payment setup and published
                policies are required.
              </span>
            </label>
            <button className="button blue" disabled={busy}>
              Save store settings
            </button>
          </form>
        )}
      </div>
      {editor && (
        <ProductEditor
          value={editor}
          busy={busy}
          error={error}
          close={() => {
            setEditor(null);
            setError("");
          }}
          onSave={async (p) => {
            if (await save("/api/admin/products", p)) setEditor(null);
          }}
          onDelete={async () => {
            if (
              await save(
                `/api/admin/products/${editor.id}`,
                undefined,
                "DELETE",
              )
            )
              setEditor(null);
          }}
        />
      )}
    </div>
  );
}
function AdminEmpty({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <Package size={30} strokeWidth={1.2} />
      <h2>Nothing here yet.</h2>
      <p>{text}</p>
    </div>
  );
}
function ProductEditor({
  value,
  busy,
  error,
  close,
  onSave,
  onDelete,
}: {
  value: PrivateProduct;
  busy: boolean;
  error: string;
  close: () => void;
  onSave: (p: PrivateProduct) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [p, setP] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [archive, setArchive] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const set = (key: keyof PrivateProduct, v: unknown) =>
    setP((current) => ({ ...current, [key]: v }));
  return (
    <dialog ref={ref} className="admin-dialog" onCancel={close}>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          void onSave(p);
        }}
      >
        <div className="row between">
          <h2>{p.id ? "Edit product" : "Add product"}</h2>
          <button
            type="button"
            className="icon-button"
            onClick={close}
            aria-label="Close product editor"
          >
            <X />
          </button>
        </div>
        <div className="form-grid">
          {[
            ["title", "Product title"],
            ["sku", "SKU"],
            ["slug", "URL slug"],
            ["brand", "Brand"],
            ["model", "Model"],
            ["storage", "Storage"],
            ["ram", "RAM"],
            ["cpu", "CPU"],
            ["gpu", "GPU"],
            ["color", "Color"],
            ["carrier", "Carrier"],
            ["batteryHealth", "Battery health"],
            ["imei", "IMEI (private)"],
            ["serial", "Serial number (private)"],
            ["supplier", "Supplier (private)"],
            ["purchaseDate", "Purchase date"],
            ["weight", "Weight"],
          ].map(([key, label]) => (
            <label className="field" key={key}>
              <span>{label}</span>
              <input
                required={["title", "sku", "slug", "brand", "model"].includes(
                  key,
                )}
                value={String(p[key as keyof PrivateProduct])}
                onChange={(e) =>
                  set(key as keyof PrivateProduct, e.target.value)
                }
                placeholder={
                  key === "slug" ? "iphone-15-pro-256gb-unlocked" : ""
                }
              />
            </label>
          ))}
          {[
            ["category", "Category", categories],
            ["condition", "Condition", conditions],
            ["status", "Inventory status", productStatuses],
          ].map(([key, label, options]) => (
            <label className="field" key={String(key)}>
              <span>{String(label)}</span>
              <select
                value={String(p[key as keyof PrivateProduct])}
                onChange={(e) =>
                  set(key as keyof PrivateProduct, e.target.value)
                }
              >
                {(options as readonly string[]).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          {[
            ["price", "Sale price ($)"],
            ["cost", "Acquisition cost ($)"],
            ["discount", "Comparison discount ($)"],
          ].map(([key, label]) => (
            <label className="field" key={key}>
              <span>{label}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={Number(p[key as keyof PrivateProduct]) / 100}
                onChange={(e) =>
                  set(
                    key as keyof PrivateProduct,
                    Math.round(Number(e.target.value) * 100),
                  )
                }
              />
            </label>
          ))}
          <label className="field">
            <span>Quantity</span>
            <input
              type="number"
              min="0"
              step="1"
              value={p.quantity}
              onChange={(e) => set("quantity", Number(e.target.value))}
            />
          </label>
          <label className="field full-span">
            <span>Description</span>
            <textarea
              value={p.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </label>
          <label className="field full-span">
            <span>What’s included (one per line)</span>
            <textarea
              value={p.included.join("\n")}
              onChange={(e) => set("included", e.target.value.split("\n"))}
            />
          </label>
          <label className="field full-span">
            <span>Specifications (Label: value, one per line)</span>
            <textarea
              defaultValue={Object.entries(p.specifications)
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n")}
              onChange={(e) =>
                set(
                  "specifications",
                  Object.fromEntries(
                    e.target.value
                      .split("\n")
                      .filter((s) => s.includes(":"))
                      .map((s) => {
                        const i = s.indexOf(":");
                        return [s.slice(0, i).trim(), s.slice(i + 1).trim()];
                      }),
                  ),
                )
              }
            />
          </label>
        </div>
        <div className="admin-images">
          {p.images.map((src, i) => (
            <div key={src}>
              <img src={src} alt={`Product image ${i + 1}`} />
              <button
                type="button"
                onClick={() =>
                  set(
                    "images",
                    p.images.filter((_, n) => n !== i),
                  )
                }
                aria-label={`Remove image ${i + 1}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <label className="field">
          <span>
            {uploading
              ? "Uploading…"
              : "Upload actual device photos (PNG, JPEG, WebP; 4 MB max each)"}
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            disabled={uploading}
            onChange={async (e) => {
              setUploading(true);
              setLocalError("");
              try {
                const urls = [];
                for (const file of Array.from(e.target.files || [])) {
                  const f = new FormData();
                  f.set("file", file);
                  f.set("kind", "image");
                  const r = await fetch("/api/uploads", {
                    method: "POST",
                    body: f,
                  });
                  const d = await r.json();
                  if (!r.ok) throw new Error(d.error);
                  urls.push(d.url);
                }
                set(
                  "images",
                  [
                    ...p.images.filter((x) => !x.includes("/brand/")),
                    ...urls,
                  ].slice(0, 12),
                );
              } catch (e) {
                setLocalError((e as Error).message);
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        <div className="row">
          <label className="check-label">
            <input
              type="checkbox"
              checked={p.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />{" "}
            Featured product
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={p.sample}
              onChange={(e) => set("sample", e.target.checked)}
            />{" "}
            Sample listing (cannot be purchased)
          </label>
        </div>
        {(error || localError) && (
          <p role="alert" className="error-message">
            {error || localError}
          </p>
        )}
        <div className="row between">
          <button disabled={busy || uploading} className="button blue">
            Save product
          </button>
          {p.id && (
            <button
              type="button"
              className="text-button danger-text"
              onClick={() => setArchive(true)}
            >
              Archive product
            </button>
          )}
        </div>
        {archive && (
          <div className="notice">
            Remove this listing from the store? Order history will be preserved.
            <div className="row" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="button outline small"
                disabled={busy}
                onClick={onDelete}
              >
                Confirm archive
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => setArchive(false)}
              >
                Keep listing
              </button>
            </div>
          </div>
        )}
      </form>
    </dialog>
  );
}
function QuoteAdmin({
  quote: q,
  busy,
  save,
  back,
}: {
  quote: BuyQuote;
  busy: boolean;
  save: (u: string, b: unknown, m?: string) => Promise<boolean>;
  back: () => void;
}) {
  const change = (body: unknown) =>
    save(`/api/admin/quotes/${q.id}`, body, "PATCH");
  return (
    <div className="stack">
      <button
        className="text-button"
        style={{ justifySelf: "start" }}
        onClick={back}
      >
        ← All device quotes
      </button>
      <div className="panel stack">
        <div className="row between">
          <div>
            <p className="eyebrow">{q.reference}</p>
            <h2>{q.body.model}</h2>
          </div>
          <strong className="quote-admin-value">{money(q.amount)}</strong>
        </div>
        <span className="status-pill">{q.status}</span>
        {q.body.sample && (
          <p className="notice">
            Sample workflow. Do not request a real device or record a payout.
          </p>
        )}
        <div className="quote-admin-details">
          <div>
            <h3>Customer & handoff</h3>
            <p>
              {q.body.customer.name}
              <br />
              {q.body.customer.email}
              <br />
              {q.body.customer.phone}
              <br />
              {q.body.customer.address}
            </p>
            <p>{q.body.customer.method}</p>
            <p className="meta">Device identifier: {q.body.customer.serial}</p>
          </div>
          <div>
            <h3>Reported device details</h3>
            <dl>
              {Object.entries({
                ...q.body.input.specs,
                ...q.body.input.condition,
              }).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        {(transitions[q.status as keyof typeof transitions] || []).filter(
          (s) => s !== "Revised Offer",
        ).length > 0 && (
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              void change({
                action: "status",
                status: new FormData(e.currentTarget).get("status"),
              });
            }}
          >
            <label className="field grow">
              <span>Next status</span>
              <select name="status">
                {(transitions[q.status as keyof typeof transitions] || [])
                  .filter((s) => s !== "Revised Offer")
                  .map((s) => (
                    <option key={s}>{s}</option>
                  ))}
              </select>
            </label>
            <button className="button outline" disabled={busy}>
              Update status
            </button>
          </form>
        )}
      </div>
      {q.status === "Inspection" && (
        <div className="panel stack">
          <h2 className="section-subhead">Inspection result</h2>
          <button
            className="button outline"
            disabled={busy}
            onClick={() => change({ action: "inspect-match" })}
          >
            Matches description · confirm original offer
          </button>
          <hr className="divider" />
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void change({
                action: "revise",
                amount: Math.round(Number(f.get("amount")) * 100),
                reason: f.get("reason"),
              });
            }}
          >
            <h3>Condition differs</h3>
            <label className="field">
              <span>Revised offer ($)</span>
              <input
                type="number"
                required
                min="0"
                step=".01"
                name="amount"
                defaultValue={q.amount / 100}
              />
            </label>
            <label className="field">
              <span>Explain the inspection difference</span>
              <textarea
                required
                name="reason"
                placeholder="e.g. Battery below 80%, heavy frame damage"
              />
            </label>
            <p className="meta">
              The customer will see the revised offer in their account and must
              accept it before payment can proceed.
            </p>
            <button className="button blue" disabled={busy}>
              Publish revised offer
            </button>
          </form>
        </div>
      )}
      {q.status === "Revised Offer" && (
        <div className="notice">
          Awaiting the customer’s decision on {money(q.revised_amount || 0)}.
          Reason: {q.revision_reason}
        </div>
      )}
      {q.status === "Payment Processing" && (
        <form
          className="panel stack"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void change({
              action: "payout",
              method: f.get("method"),
              reference: f.get("reference"),
            });
          }}
        >
          <h2 className="section-subhead">Record completed external payment</h2>
          <p className="notice">
            Pay the seller through your approved provider first. This action
            records the payment; it does not transfer funds.
          </p>
          <label className="field">
            <span>Payment method</span>
            <select name="method">
              {["ACH", "PayPal", "Business Check", "Other"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Provider transaction or check reference</span>
            <input required name="reference" minLength={3} />
          </label>
          <label className="check-label">
            <input required type="checkbox" /> I verified that this payment has
            been completed.
          </label>
          <button className="button blue" disabled={busy || q.body.sample}>
            Record {money(q.amount)} as paid
          </button>
        </form>
      )}
    </div>
  );
}
function Pricing({
  data,
  save,
  busy,
}: {
  data: AdminData;
  save: (u: string, b: unknown, m?: string) => Promise<boolean>;
  busy: boolean;
}) {
  const [model, setModel] = useState<DeviceModel | null>(null);
  const [policy, setPolicy] = useState<PricingPolicy>(data.policy);
  const [search, setSearch] = useState("");
  const [numberKey, setNumberKey] = useState("");
  const [newGroup, setNewGroup] = useState<keyof PricingPolicy>("storage");
  return (
    <div className="stack">
      <div className="admin-toolbar">
        <label className="catalog-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a device price"
          />
        </label>
        <button
          className="button blue"
          onClick={() =>
            setModel({
              id: "",
              name: "",
              brand: "Apple",
              category: "iPhone",
              base: 0,
              enabled: true,
              storage: ["256GB"],
            })
          }
        >
          <Plus size={17} /> Add device
        </button>
      </div>
      {model && (
        <form
          className="panel stack"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await save("/api/admin/devices", model)) setModel(null);
          }}
        >
          <div className="row between">
            <h2 className="section-subhead">Device purchase price</h2>
            <button
              type="button"
              onClick={() => setModel(null)}
              className="icon-button"
              aria-label="Close device editor"
            >
              <X />
            </button>
          </div>
          <div className="form-grid">
            {[
              ["id", "Device key (lowercase and hyphens)"],
              ["name", "Model"],
              ["brand", "Brand"],
            ].map(([key, label]) => (
              <label key={key} className="field">
                <span>{label}</span>
                <input
                  required
                  value={String(model[key as keyof DeviceModel])}
                  onChange={(e) =>
                    setModel({ ...model, [key]: e.target.value })
                  }
                />
              </label>
            ))}
            <label className="field">
              <span>Category</span>
              <select
                value={model.category}
                onChange={(e) =>
                  setModel({ ...model, category: e.target.value })
                }
              >
                {sellCategories.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Base purchase price ($)</span>
              <input
                required
                type="number"
                min="0"
                step=".01"
                value={model.base / 100}
                onChange={(e) =>
                  setModel({
                    ...model,
                    base: Math.round(Number(e.target.value) * 100),
                  })
                }
              />
            </label>
            <label className="field">
              <span>Expected resale value ($, optional)</span>
              <input
                type="number"
                min="0"
                step=".01"
                value={model.expectedResale ? model.expectedResale / 100 : ""}
                onChange={(e) =>
                  setModel({
                    ...model,
                    expectedResale: e.target.value
                      ? Math.round(Number(e.target.value) * 100)
                      : undefined,
                  })
                }
              />
            </label>
            <label className="field full-span">
              <span>Storage choices, separated by commas</span>
              <input
                required
                value={model.storage.join(",")}
                onChange={(e) =>
                  setModel({
                    ...model,
                    storage: e.target.value.split(",").map((v) => v.trim()),
                  })
                }
              />
            </label>
            {["MacBook", "Laptop", "Desktop", "Gaming PC"].includes(
              model.category,
            ) &&
              (["cpu", "ram", "gpu"] as const).map((key) => (
                <label className="field" key={key}>
                  <span>Approved {key.toUpperCase()} choices (commas)</span>
                  <input
                    required
                    value={(model.configurations?.[key] || []).join(",")}
                    onChange={(e) =>
                      setModel({
                        ...model,
                        configurations: {
                          cpu: [],
                          ram: [],
                          gpu: [],
                          ...model.configurations,
                          [key]: e.target.value.split(",").map((v) => v.trim()),
                        },
                      })
                    }
                  />
                  <small>
                    Match an option in the adjustment rules below. Unlisted
                    configurations need review.
                  </small>
                </label>
              ))}
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={model.enabled}
              onChange={(e) =>
                setModel({ ...model, enabled: e.target.checked })
              }
            />{" "}
            Available in instant quotes
          </label>
          <button className="button blue" disabled={busy}>
            Save device pricing
          </button>
        </form>
      )}
      <div className="table-scroll panel table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Brand / category</th>
              <th>Base purchase price</th>
              <th>Enabled</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.devices
              .filter((d) =>
                `${d.name} ${d.brand}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>
                    {d.brand} · {d.category}
                  </td>
                  <td>{money(d.base)}</td>
                  <td>{d.enabled ? "Yes" : "No"}</td>
                  <td>
                    <button className="text-button" onClick={() => setModel(d)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <form
        className="panel stack"
        onSubmit={(e) => {
          e.preventDefault();
          void save("/api/admin/policy", policy);
        }}
      >
        <h2 className="section-subhead">Offer rules & adjustments</h2>
        <p className="admin-note muted">
          The base value is adjusted by configuration and condition. When
          expected resale value is provided, the offer is capped after fees,
          shipping, and your minimum margin.
        </p>
        {(
          [
            "multipliers",
            "deductions",
            "accessories",
            "storage",
            "ram",
            "cpu",
            "gpu",
          ] as const
        ).map((group) => (
          <fieldset className="pricing-group" key={group}>
            <legend>
              {
                {
                  multipliers: "Cosmetic condition (% of configured base)",
                  deductions: "Repair & condition deductions ($)",
                  accessories: "Included accessories ($)",
                  storage: "Storage adjustments ($)",
                  ram: "RAM adjustments ($)",
                  cpu: "CPU adjustments ($)",
                  gpu: "GPU adjustments ($)",
                }[group]
              }
            </legend>
            <div className="form-grid">
              {Object.entries(policy[group]).map(([key, value]) => (
                <label className="field" key={key}>
                  <span>{key}</span>
                  <input
                    type="number"
                    min="0"
                    step={group === "multipliers" ? "1" : ".01"}
                    max={group === "multipliers" ? 100 : undefined}
                    value={
                      group === "multipliers"
                        ? Math.round(value * 100)
                        : value / 100
                    }
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        [group]: {
                          ...policy[group],
                          [key]:
                            group === "multipliers"
                              ? Number(e.target.value) / 100
                              : Math.round(Number(e.target.value) * 100),
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="form-grid">
          {[
            [
              "partsMultiplier",
              "Parts-only offer (% of configured base)",
              true,
            ],
            ["maxOffer", "Maximum offer ($)", false],
            ["minMargin", "Minimum target margin ($)", false],
            ["feesPercent", "Expected marketplace fees (%)", "percent"],
            ["shipping", "Expected resale shipping cost ($)", false],
          ].map(([key, label, percent]) => (
            <label className="field" key={String(key)}>
              <span>{String(label)}</span>
              <input
                type="number"
                min="0"
                step=".01"
                max={percent ? 100 : undefined}
                value={
                  percent === true
                    ? Number(policy[key as keyof PricingPolicy]) * 100
                    : percent === "percent"
                      ? Number(policy[key as keyof PricingPolicy])
                      : Number(policy[key as keyof PricingPolicy]) / 100
                }
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    [String(key)]:
                      percent === true
                        ? Number(e.target.value) / 100
                        : percent === "percent"
                          ? Number(e.target.value)
                          : Math.round(Number(e.target.value) * 100),
                  })
                }
              />
            </label>
          ))}
        </div>
        <div className="row pricing-add">
          <label className="field">
            <span>Add a configurable option</span>
            <select
              value={newGroup}
              onChange={(e) =>
                setNewGroup(e.target.value as keyof PricingPolicy)
              }
            >
              {[
                "deductions",
                "accessories",
                "storage",
                "ram",
                "cpu",
                "gpu",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="field grow">
            <span>Option name</span>
            <input
              value={numberKey}
              onChange={(e) => setNumberKey(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="button outline small"
            onClick={() => {
              if (numberKey.trim()) {
                setPolicy({
                  ...policy,
                  [newGroup]: {
                    ...(policy[newGroup] as Record<string, number>),
                    [numberKey.trim()]: 0,
                  },
                });
                setNumberKey("");
              }
            }}
          >
            Add
          </button>
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            checked={policy.approved}
            onChange={(e) =>
              setPolicy({ ...policy, approved: e.target.checked })
            }
          />{" "}
          These are approved business purchase prices, not sample values.
        </label>
        <button className="button blue" disabled={busy}>
          Save all offer rules
        </button>
      </form>
    </div>
  );
}
