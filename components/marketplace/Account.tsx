"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Smartphone,
  Heart,
  MapPin,
  UserRound,
  LifeBuoy,
  Wallet,
  LogOut,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Brand } from "./Brand";
import { api, useStore } from "./Store";
import { money, type Product } from "@/lib/types";
import { type AccountData, date } from "@/lib/views";
import { ProductCard } from "./ProductCard";
export function AuthCard({
  admin = false,
  next = "",
  configured = true,
}: {
  admin?: boolean;
  next?: string;
  configured?: boolean;
}) {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { refreshUser } = useStore();
  const router = useRouter();
  return (
    <div className="auth-layout wrap">
      <div className="auth-story">
        <p className="eyebrow">
          {admin ? "SAILAN TECH ADMIN" : "YOUR SAILAN TECH ACCOUNT"}
        </p>
        <h1>
          {admin ? (
            <>
              Your store.
              <br />
              All in view.
            </>
          ) : (
            <>
              Your tech.
              <br />
              Your next chapter.
            </>
          )}
        </h1>
        <p>
          {admin
            ? "Manage inventory, purchase pricing, inspections, and customer requests."
            : "Keep your orders, selling quotes, saved devices, and support requests in one place."}
        </p>
        <div className="auth-features">
          <span>
            <Package size={19} /> Track every order
          </span>
          <span>
            <Smartphone size={19} /> Follow your device sale
          </span>
          <span>
            <Heart size={19} /> Save your next upgrade
          </span>
        </div>
      </div>
      <div className="auth-card">
        <Brand />
        <h2>
          {register
            ? "Make yourself at home."
            : admin
              ? "Administrator sign in."
              : "Welcome back."}
        </h2>
        <p className="muted">
          {register
            ? "Create your Sailan Tech account."
            : "Sign in with your email and password."}
        </p>
        {!configured && (
          <p className="notice">
            Accounts open after store setup is complete. You can explore the
            shop and instant estimate now.
          </p>
        )}
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const f = new FormData(e.currentTarget);
            try {
              await api(
                register ? "/api/auth/register" : "/api/auth/login",
                "POST",
                {
                  email: f.get("email"),
                  password: f.get("password"),
                  ...(register ? { name: f.get("name") } : {}),
                },
              );
              await refreshUser();
              if (next === "sell") router.push("/sell");
              else if (next === "checkout") router.push("/checkout");
              else if (admin || next === "admin") router.push("/admin");
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {register && (
            <label className="field">
              <span>Full name</span>
              <input
                name="name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
              />
            </label>
          )}
          <label className="field">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={12}
              maxLength={128}
              autoComplete={register ? "new-password" : "current-password"}
            />
            {register && <small>Use at least 12 characters.</small>}
          </label>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy || !configured} className="button blue full">
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}{" "}
            <ArrowRight size={17} />
          </button>
        </form>
        {!admin && (
          <button
            className="text-button"
            onClick={() => {
              setRegister(!register);
              setError("");
            }}
          >
            {register
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </button>
        )}
        {admin && (
          <p className="meta">
            Administrator access is restricted to the store owner and authorized
            staff.
          </p>
        )}
        <Link href="/support" className="auth-help">
          Need help accessing your account?
        </Link>
      </div>
    </div>
  );
}
const tabs = [
  ["Overview", Package],
  ["Orders", Package],
  ["Sell your tech", Smartphone],
  ["Payments", Wallet],
  ["Saved items", Heart],
  ["Addresses", MapPin],
  ["Support", LifeBuoy],
  ["Profile", UserRound],
] as const;
export function Account({
  products,
  configured,
  next,
  checkoutReturned = false,
  checkoutOrderId,
}: {
  products: Product[];
  configured: boolean;
  next?: string;
  checkoutReturned?: boolean;
  checkoutOrderId?: string;
}) {
  const { user, refreshUser, notify, completePurchase } = useStore();
  const [data, setData] = useState<AccountData | null>(null);
  const [tab, setTab] = useState(checkoutReturned ? "Orders" : "Overview");
  const [paymentChecks, setPaymentChecks] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      setData(await api<AccountData>("/api/account"));
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    if (user) void load();
  }, [user]);
  const checkoutOrder = data?.orders.find((o) => o.id === checkoutOrderId);
  const paymentConfirmed =
    checkoutOrder &&
    ["Paid", "Shipped", "Completed"].includes(checkoutOrder.status);
  useEffect(() => {
    if (paymentConfirmed && checkoutOrder)
      completePurchase(checkoutOrder.id, checkoutOrder.body.items);
    else if (checkoutReturned && user && paymentChecks < 10) {
      const timer = setTimeout(() => {
        setPaymentChecks((n) => n + 1);
        void load();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [
    paymentConfirmed,
    checkoutOrder,
    checkoutReturned,
    user,
    paymentChecks,
    completePurchase,
  ]);
  const action = async (url: string, method: string, body?: unknown) => {
    setError("");
    setBusy(true);
    try {
      await api(url, method, body);
      await load();
      notify("Saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (!user) return <AuthCard configured={configured} next={next} />;
  return (
    <div className="wrap page-space">
      <div className="account-heading">
        <div>
          <p className="eyebrow">YOUR ACCOUNT</p>
          <h1>Hi, {user.name.split(" ")[0]}.</h1>
          <p className="muted">Everything for your next chapter.</p>
        </div>
        <button
          className="text-button row"
          onClick={async () => {
            await api("/api/auth/logout", "POST");
            await refreshUser();
            setData(null);
          }}
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
      <div className="account-layout">
        <nav className="account-nav" aria-label="Account sections">
          {tabs.map(([name, Icon]) => (
            <button
              className={tab === name ? "active" : ""}
              onClick={() => setTab(name)}
              key={name}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
          {user.role === "admin" && (
            <Link href="/admin">
              Store administration <ArrowRight size={16} />
            </Link>
          )}
        </nav>
        <section className="account-content">
          {checkoutReturned && (
            <div className="notice" role="status">
              {paymentConfirmed
                ? `Payment confirmed. Your order is ${checkoutOrder?.reference}. Follow its progress below.`
                : checkoutOrder?.status === "Expired"
                  ? "This checkout expired without a confirmed payment."
                  : data && !checkoutOrder
                    ? "This order was not found in your account. Contact support if you need help."
                    : "We are waiting for payment confirmation. Your order will update once the payment provider confirms it."}
              {!paymentConfirmed && (
                <button className="text-button" onClick={() => void load()}>
                  Refresh order status
                </button>
              )}
            </div>
          )}
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          {!data ? (
            <div className="loading">Loading your account…</div>
          ) : (
            <>
              {tab === "Overview" && (
                <>
                  <div className="account-summary">
                    {[
                      ["Orders", data.orders.length],
                      ["Device quotes", data.quotes.length],
                      ["Saved items", data.favorites.length],
                    ].map(([l, n]) => (
                      <div key={l}>
                        <span>{l}</span>
                        <strong>{n}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="account-welcome">
                    <h2>What’s next for your tech?</h2>
                    <p>
                      Browse your next upgrade, or see what your current device
                      could be worth.
                    </p>
                    <div className="actions">
                      <Link href="/shop" className="button blue">
                        Shop devices <ArrowRight size={17} />
                      </Link>
                      <Link href="/sell" className="text-link">
                        Get a selling estimate <ArrowRight size={17} />
                      </Link>
                    </div>
                  </div>
                </>
              )}
              {tab === "Orders" && (
                <>
                  <h2 className="section-subhead">Your orders</h2>
                  {!data.orders.length ? (
                    <Empty
                      text="Your orders will appear here after checkout."
                      href="/shop"
                      label="Explore the shop"
                    />
                  ) : (
                    data.orders.map((o) => (
                      <article className="account-record" key={o.id}>
                        <div className="row between">
                          <div>
                            <h3>{o.reference}</h3>
                            <small>{date(o.created_at)}</small>
                          </div>
                          <span className="status-pill">{o.status}</span>
                        </div>
                        {o.body.items.map((i) => (
                          <div className="record-line" key={i.id}>
                            <span>
                              {i.title} × {i.quantity}
                            </span>
                            <span>{money(i.price * i.quantity)}</span>
                          </div>
                        ))}
                        <div className="record-line">
                          <strong>Total</strong>
                          <strong>{money(o.total)}</strong>
                        </div>
                        {o.body.tracking && (
                          <p className="notice">
                            Shipping reference: {o.body.tracking}
                          </p>
                        )}
                        {o.status === "Pending payment" && (
                          <div className="stack">
                            <p className="meta">
                              Payment has not been confirmed. This is not a
                              completed purchase.
                            </p>
                            <button
                              className="button outline small"
                              disabled={busy}
                              onClick={async () => {
                                setBusy(true);
                                setError("");
                                try {
                                  const r = await api<{ url: string }>(
                                    `/api/orders/${o.id}/resume`,
                                    "POST",
                                    {},
                                  );
                                  window.location.assign(r.url);
                                } catch (e) {
                                  setError((e as Error).message);
                                } finally {
                                  setBusy(false);
                                }
                              }}
                            >
                              Resume checkout <ArrowRight size={16} />
                            </button>
                          </div>
                        )}
                      </article>
                    ))
                  )}
                </>
              )}
              {tab === "Sell your tech" && (
                <>
                  <div className="row between">
                    <h2 className="section-subhead">Your devices & quotes</h2>
                    <Link href="/sell" className="text-link">
                      New quote <ArrowRight size={16} />
                    </Link>
                  </div>
                  {!data.quotes.length ? (
                    <Empty
                      text="Your accepted estimates and inspection updates will appear here."
                      href="/sell"
                      label="Get an estimate"
                    />
                  ) : (
                    data.quotes.map((q) => (
                      <article className="account-record" key={q.id}>
                        <div className="row between">
                          <div>
                            <p className="meta">
                              {q.reference} · {date(q.created_at)}
                            </p>
                            <h3>{q.body.model}</h3>
                          </div>
                          <strong>{money(q.amount)}</strong>
                        </div>
                        <span className="status-pill">{q.status}</span>
                        {q.body.sample && (
                          <p className="notice">
                            Sample quote. Do not ship or drop off a device for
                            this record.
                          </p>
                        )}
                        <p className="meta">
                          {q.body.input.specs.storage} ·{" "}
                          {q.body.customer.method}
                        </p>
                        <div className="tracking-steps">
                          {[
                            "Quote Accepted",
                            "Awaiting Device",
                            "Device Received",
                            "Inspection",
                            "Offer Accepted",
                            "Paid",
                            "Completed",
                          ].map((s) => (
                            <span
                              className={q.status === s ? "current" : ""}
                              key={s}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        {q.status === "Revised Offer" && (
                          <div className="revised-offer">
                            <h4>Your inspection offer</h4>
                            <div className="revision-prices">
                              <span>
                                Original estimate
                                <strong>{money(q.body.estimate.total)}</strong>
                              </span>
                              <ArrowRight size={20} />
                              <span>
                                Revised offer
                                <strong>{money(q.revised_amount || 0)}</strong>
                              </span>
                            </div>
                            <p>{q.revision_reason}</p>
                            <div className="actions">
                              <button
                                disabled={busy}
                                className="button blue small"
                                onClick={() =>
                                  action(`/api/quotes/${q.id}`, "PATCH", {
                                    action: "accept-revision",
                                  })
                                }
                              >
                                Accept revised offer
                              </button>
                              <button
                                disabled={busy}
                                className="button outline small"
                                onClick={() =>
                                  action(`/api/quotes/${q.id}`, "PATCH", {
                                    action: "decline-revision",
                                  })
                                }
                              >
                                Decline offer
                              </button>
                            </div>
                          </div>
                        )}
                        <details>
                          <summary>Device handoff & next steps</summary>
                          <p>{q.body.shippingInstructions}</p>
                          <p>{q.body.inspectionInstructions}</p>
                          {q.status === "Awaiting Device" &&
                            q.body.customer.method === "Ship Device" &&
                            !q.body.sample && (
                              <button
                                className="button outline small"
                                disabled={busy}
                                onClick={() =>
                                  action(`/api/quotes/${q.id}`, "PATCH", {
                                    action: "mark-shipped",
                                  })
                                }
                              >
                                I have shipped my device
                              </button>
                            )}
                        </details>
                        {q.status === "Cancelled" && (
                          <p className="meta">
                            This quote is closed. Contact support to arrange the
                            next step if your device was already received.
                          </p>
                        )}
                      </article>
                    ))
                  )}
                </>
              )}
              {tab === "Payments" && (
                <>
                  <h2 className="section-subhead">Seller payments</h2>
                  {!data.payouts.length ? (
                    <Empty text="Confirmed seller payments will appear here. Estimates are not completed payments." />
                  ) : (
                    data.payouts.map((p) => (
                      <article className="account-record" key={p.id}>
                        <div className="row between">
                          <h3>{money(p.amount)}</h3>
                          <span className="status-pill">Paid · {p.method}</span>
                        </div>
                        <p className="meta">
                          {date(p.created_at)} · Reference {p.reference}
                        </p>
                      </article>
                    ))
                  )}
                </>
              )}
              {tab === "Saved items" && (
                <>
                  <h2 className="section-subhead">Your shortlist</h2>
                  {!data.favorites.length ? (
                    <Empty
                      text="Save a device using the heart icon to find it here."
                      href="/shop"
                      label="Find your next device"
                    />
                  ) : (
                    <div className="product-grid saved-grid">
                      {products
                        .filter((p) => data.favorites.includes(p.id))
                        .map((p) => (
                          <div key={p.id}>
                            <ProductCard product={p} />
                            <button
                              className="text-button"
                              onClick={() =>
                                action(`/api/favorites/${p.id}`, "DELETE")
                              }
                            >
                              Remove from saved
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
              {tab === "Addresses" && (
                <>
                  <h2 className="section-subhead">Your addresses</h2>
                  <div className="address-list">
                    {data.addresses.map((a) => (
                      <article className="panel" key={a.id}>
                        <h3>{a.body.name}</h3>
                        <p>
                          {a.body.line1}
                          <br />
                          {a.body.line2 && (
                            <>
                              {a.body.line2}
                              <br />
                            </>
                          )}
                          {a.body.city}, {a.body.state} {a.body.postalCode}
                        </p>
                        <button
                          className="text-button"
                          onClick={() =>
                            action(`/api/addresses/${a.id}`, "DELETE")
                          }
                        >
                          Remove address
                        </button>
                      </article>
                    ))}
                  </div>
                  <form
                    className="panel stack"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const f = e.currentTarget;
                      await action("/api/addresses", "POST", {
                        ...Object.fromEntries(new FormData(f)),
                        country: "US",
                      });
                    }}
                  >
                    <h3>Add an address</h3>
                    <div className="form-grid">
                      {[
                        ["name", "Recipient name"],
                        ["line1", "Street address"],
                        ["line2", "Apartment / suite (optional)"],
                        ["city", "City"],
                        ["state", "State"],
                        ["postalCode", "ZIP code"],
                      ].map(([name, label]) => (
                        <label className="field" key={name}>
                          <span>{label}</span>
                          <input
                            name={name}
                            required={name !== "line2"}
                            maxLength={200}
                          />
                        </label>
                      ))}
                    </div>
                    <button className="button blue" disabled={busy}>
                      Save address
                    </button>
                  </form>
                </>
              )}
              {tab === "Support" && (
                <>
                  <div className="row between">
                    <h2 className="section-subhead">Your requests</h2>
                    <Link href="/support" className="text-link">
                      Get help <ArrowRight size={16} />
                    </Link>
                  </div>
                  {!data.requests.length ? (
                    <Empty
                      text="Repair, wholesale, and support requests submitted while signed in appear here."
                      href="/support"
                      label="Contact support"
                    />
                  ) : (
                    data.requests.map((r) => (
                      <article className="account-record" key={r.id}>
                        <div className="row between">
                          <h3>{r.reference}</h3>
                          <span className="status-pill">{r.status}</span>
                        </div>
                        <p className="meta">
                          {r.kind} · {date(r.created_at)}
                        </p>
                        <p>{r.body.message}</p>
                      </article>
                    ))
                  )}
                </>
              )}
              {tab === "Profile" && (
                <form
                  className="panel stack"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await action(
                      "/api/profile",
                      "PATCH",
                      Object.fromEntries(new FormData(e.currentTarget)),
                    );
                    await refreshUser();
                  }}
                >
                  <h2 className="section-subhead">Your details</h2>
                  <label className="field">
                    <span>Full name</span>
                    <input
                      name="name"
                      defaultValue={data.user.name}
                      required
                      minLength={2}
                    />
                  </label>
                  <label className="field">
                    <span>Email</span>
                    <input value={data.user.email} readOnly />
                    <small>
                      Contact support if you need to update your sign-in email.
                    </small>
                  </label>
                  <label className="field">
                    <span>Phone</span>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={data.user.phone}
                    />
                  </label>
                  <button className="button blue" disabled={busy}>
                    Save details
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
function Empty({
  text,
  href,
  label,
}: {
  text: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <Package size={32} strokeWidth={1.2} />
      <h2>Nothing here yet.</h2>
      <p>{text}</p>
      {href && (
        <Link href={href} className="button outline">
          {label} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
