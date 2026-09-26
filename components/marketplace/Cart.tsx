"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Trash2, LockKeyhole } from "lucide-react";
import { type Product, type StoreSettings, money } from "@/lib/types";
import { api, useStore } from "./Store";
import { Brand } from "./Brand";
export function Cart({
  products,
  settings,
  checkout = false,
  paymentReady = false,
}: {
  products: Product[];
  settings: StoreSettings;
  checkout?: boolean;
  paymentReady?: boolean;
}) {
  const { cart, setQuantity, user } = useStore();
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applied, setApplied] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lines = cart.map((l) => ({
    ...l,
    product: products.find((p) => p.id === l.id),
  }));
  const subtotal = lines.reduce(
    (sum, l) =>
      sum +
      (l.product
        ? Math.round(l.product.price * (1 - discount / 100)) * l.quantity
        : 0),
    0,
  );
  const blocked = lines.some((l) => !l.product || l.product.sample);
  const reserved = lines.some(
    (l) =>
      l.product &&
      (l.quantity > l.product.quantity || l.product.status !== "Available"),
  );
  if (!cart.length)
    return (
      <div className="wrap page-space">
        <div className="page-head">
          <p className="eyebrow">YOUR BAG</p>
          <h1>A little room for possibility.</h1>
        </div>
        <div className="empty-state">
          <ShoppingBag size={45} strokeWidth={1} />
          <h2>Your bag is empty.</h2>
          <p>Find the device that feels right for your next chapter.</p>
          <Link href="/shop" className="button blue">
            Explore devices <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  return (
    <div className="wrap page-space">
      <div className="page-head">
        <p className="eyebrow">{checkout ? "CHECKOUT" : "YOUR BAG"}</p>
        <h1>
          {checkout ? "One step closer." : "Good choices. Great possibilities."}
        </h1>
      </div>
      <div className="cart-layout">
        <div>
          {checkout && (
            <div className="checkout-brand">
              <Brand />
              <span>
                <LockKeyhole size={17} /> Payment details stay with the payment
                provider.
              </span>
            </div>
          )}
          <div className="cart-items">
            {lines.map((l) => (
              <article className="cart-line" key={l.id}>
                {l.product ? (
                  <>
                    <Link href={`/product/${l.product.slug}`}>
                      <Image
                        src={l.product.images[0]}
                        alt={l.product.title}
                        width={170}
                        height={150}
                      />
                    </Link>
                    <div>
                      <Link href={`/product/${l.product.slug}`}>
                        <h2>{l.product.title}</h2>
                      </Link>
                      <p>
                        {l.product.storage} · {l.product.condition}
                      </p>
                      <p>
                        {l.product.color}
                        {l.product.sample && " · Sample listing"}
                      </p>
                      <div className="row cart-quantity">
                        <label>
                          Quantity{" "}
                          <select
                            aria-label={`Quantity for ${l.product.title}`}
                            value={l.quantity}
                            onChange={(e) =>
                              setQuantity(l.id, Number(e.target.value))
                            }
                          >
                            {Array.from(
                              {
                                length: Math.max(
                                  l.quantity,
                                  Math.min(l.product.quantity, 20),
                                ),
                              },
                              (_, i) => (
                                <option key={i}>{i + 1}</option>
                              ),
                            )}
                          </select>
                        </label>
                        <button
                          className="text-button"
                          onClick={() => setQuantity(l.id, 0)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <strong>{money(l.product.price * l.quantity)}</strong>
                  </>
                ) : (
                  <>
                    <p>This device is no longer listed.</p>
                    <button
                      className="icon-button"
                      onClick={() => setQuantity(l.id, 0)}
                      aria-label="Remove unavailable device"
                    >
                      <Trash2 />
                    </button>
                  </>
                )}
              </article>
            ))}
          </div>
          {checkout && (
            <div className="panel stack checkout-info">
              <h2 className="section-subhead">Delivery & payment</h2>
              <p>
                Confirm your shipping address and available payment options at
                secure checkout. Cards and eligible Apple Pay or Google Pay
                wallets are supported through Stripe.
              </p>
              <p className="muted">{settings.shippingText}</p>
              <p className="muted">{settings.returnsText}</p>
              {!user && (
                <Link href="/account?next=checkout" className="button outline">
                  Sign in to continue <ArrowRight size={17} />
                </Link>
              )}
            </div>
          )}
          <Link href="/shop" className="text-link" style={{ marginTop: 25 }}>
            Keep exploring <ArrowRight size={16} />
          </Link>
        </div>
        <aside className="order-summary">
          <h2>Order summary</h2>
          <div>
            <span>Subtotal{discount > 0 && ` (${discount}% off)`}</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div>
            <span>Estimated shipping</span>
            <span>{money(settings.shippingCents)}</span>
          </div>
          <div>
            <span>Tax</span>
            <span>Calculated at checkout</span>
          </div>
          <hr className="divider" />
          <div className="summary-total">
            <span>Estimated total</span>
            <strong>{money(subtotal + settings.shippingCents)}</strong>
          </div>
          <form
            className="promo-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              try {
                const r = await api<{ percent: number; code: string }>(
                  "/api/promo",
                  "POST",
                  { code: promo },
                );
                setDiscount(r.percent);
                setApplied(r.code);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <label className="field">
              <span>Promo code</span>
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Enter code"
              />
            </label>
            <button className="button outline small">Apply</button>
          </form>
          {applied && (
            <small>
              {applied} applied. Final totals are confirmed at checkout.
            </small>
          )}
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          {blocked && (
            <p className="notice">
              Your bag includes sample or unavailable inventory. Purchases open
              once live devices are listed.
            </p>
          )}
          {!blocked && reserved && (
            <p className="notice">
              Some devices may be reserved. Continue to payment to resume your
              checkout or confirm availability.
            </p>
          )}
          {checkout ? (
            <button
              className="button blue full"
              disabled={busy || !user || blocked || !paymentReady}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  const r = await api<{ url: string }>(
                    "/api/checkout",
                    "POST",
                    { items: cart, promo: applied },
                  );
                  if (r.url) window.location.assign(r.url);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy
                ? "Opening secure checkout…"
                : paymentReady
                  ? "Continue to payment"
                  : "Payment setup pending"}{" "}
              <LockKeyhole size={17} />
            </button>
          ) : (
            <Link href="/checkout" className="button blue full">
              Continue to checkout <ArrowRight size={17} />
            </Link>
          )}
          <small>Final shipping and tax are confirmed before payment.</small>
        </aside>
      </div>
    </div>
  );
}
