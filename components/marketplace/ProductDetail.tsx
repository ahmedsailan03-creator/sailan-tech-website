"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Package,
  ShieldCheck,
  Star,
} from "lucide-react";
import { money, type Product, type StoreSettings } from "@/lib/types";
import { api, useStore } from "./Store";
import { ProductCard } from "./ProductCard";
type Review = { id: string; name: string; rating: number; body: string };
export function ProductDetail({
  product: p,
  products,
  settings,
}: {
  product: Product;
  products: Product[];
  settings: StoreSettings;
}) {
  const [photo, setPhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const { add, notify, user } = useStore();
  const router = useRouter();
  const variants = products.filter((x) => x.model === p.model);
  const available = p.quantity > 0 && p.status === "Available";
  const loadReviews = () =>
    api<{ reviews: Review[] }>(`/api/reviews?productId=${p.id}`)
      .then((d) => setReviews(d.reviews))
      .catch(() => {});
  useEffect(() => {
    void loadReviews();
  }, [p.id]);
  return (
    <div className="wrap page-space">
      <div className="breadcrumbs product-crumb">
        <Link href="/shop">Shop</Link>
        <ChevronRight size={12} />
        <Link href={`/shop/${p.category.toLowerCase()}`}>{p.category}</Link>
        <ChevronRight size={12} />
        <span>{p.title}</span>
      </div>
      <div className="product-detail">
        <div className="product-gallery">
          <div className="gallery-main">
            <Image
              src={p.images[photo]}
              alt={
                p.sample
                  ? `Illustrative sample for ${p.title}`
                  : `${p.title}, image ${photo + 1}`
              }
              width={900}
              height={800}
              priority
            />
          </div>
          {p.images.length > 1 && (
            <div className="gallery-thumbs">
              {p.images.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setPhoto(i)}
                  className={photo === i ? "selected" : ""}
                  aria-label={`View photo ${i + 1}`}
                >
                  <Image src={url} width={90} height={80} alt="" />
                </button>
              ))}
            </div>
          )}
          <small>
            {p.sample
              ? "Illustrative image. Sample configuration shown."
              : `${p.images.length} device ${p.images.length === 1 ? "photo" : "photos"}`}
          </small>
        </div>
        <div className="purchase-panel">
          <p className="eyebrow">
            {p.brand.toUpperCase()} · {p.sku}
          </p>
          <h1>{p.title}</h1>
          <p className="product-subtitle">
            {p.storage}
            {p.ram && ` · ${p.ram} RAM`} · {p.color}
          </p>
          <div className="detail-price">
            {money(p.price)}
            {p.discount > 0 && <del>{money(p.price + p.discount)}</del>}
          </div>
          <div className="variant-options">
            {variants.length > 1 ? (
              <label className="field">
                <span>Choose your configuration</span>
                <select
                  value={p.slug}
                  onChange={(e) => router.push(`/product/${e.target.value}`)}
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.slug}>
                      {v.storage} · {v.condition} · {v.color} · {money(v.price)}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="detail-spec-chips">
                <span>{p.storage}</span>
                {p.ram && <span>{p.ram} RAM</span>}
                <span>{p.color}</span>
              </div>
            )}
            <div className="row between condition-row">
              <div>
                <small>Condition</small>
                <strong>{p.condition}</strong>
              </div>
              <Link href="/condition-guide" className="text-link">
                What to expect <ArrowRight size={15} />
              </Link>
            </div>
            {p.carrier && (
              <div className="row between">
                <small>Carrier</small>
                <span>{p.carrier}</span>
              </div>
            )}
          </div>
          {p.sample && (
            <div className="notice">
              Sample listing. You can try the shopping bag; this device cannot
              be purchased.
            </div>
          )}
          <div className="purchase-actions">
            <label className="field quantity-field">
              <span>Quantity</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={!available}
              >
                {Array.from(
                  { length: Math.min(p.quantity, 20) || 1 },
                  (_, i) => (
                    <option key={i}>{i + 1}</option>
                  ),
                )}
              </select>
            </label>
            <button
              className="button blue"
              disabled={!available}
              onClick={() => add(p, quantity)}
            >
              {available ? "Add to bag" : "Currently unavailable"}{" "}
              <ArrowRight size={17} />
            </button>
          </div>
          <button
            className="button outline full"
            disabled={!available}
            onClick={() => {
              add(p, quantity);
              router.push("/checkout");
            }}
          >
            Buy now
          </button>
          <button
            className="text-button row save-product"
            onClick={async () => {
              if (!user) {
                router.push("/account");
                return;
              }
              try {
                await api("/api/favorites", "POST", { productId: p.id });
                notify("Saved to your account.");
              } catch (e) {
                notify((e as Error).message);
              }
            }}
          >
            <Heart size={17} /> Save for later
          </button>
          <div className="product-assurance">
            <div>
              <Package size={19} />
              <p>{settings.shippingText}</p>
            </div>
            <div>
              <ShieldCheck size={19} />
              <p>{settings.warrantyText}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="product-facts">
        <section>
          <h2>A closer look.</h2>
          <p>{p.description}</p>
          <dl>
            {Object.entries({
              ...p.specifications,
              ...(p.cpu ? { Processor: p.cpu } : {}),
              ...(p.gpu ? { Graphics: p.gpu } : {}),
              ...(p.ram ? { Memory: p.ram } : {}),
              Storage: p.storage,
              Condition: p.condition,
              "Battery health": p.batteryHealth,
            })
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
        </section>
        <section>
          <h2>What comes with it.</h2>
          <ul className="included-list">
            {p.included.map((x) => (
              <li key={x}>
                <Check size={16} />
                {x}
              </li>
            ))}
          </ul>
          <details>
            <summary>Shipping</summary>
            <p>{settings.shippingText}</p>
          </details>
          <details>
            <summary>Returns</summary>
            <p>{settings.returnsText}</p>
          </details>
          <details>
            <summary>Warranty</summary>
            <p>{settings.warrantyText}</p>
          </details>
          <details>
            <summary>Device identifiers</summary>
            <p>
              IMEI and serial details are kept private. Live phone listings
              should state their inspection and network status before purchase.
            </p>
          </details>
        </section>
      </div>
      <section className="reviews-section">
        <div>
          <p className="eyebrow">REAL EXPERIENCES</p>
          <h2>Customer reviews.</h2>
          <p className="muted">
            {reviews.length
              ? `${reviews.length} verified purchase reviews.`
              : "No reviews yet. Only verified purchasers can leave a review."}
          </p>
        </div>
        <div>
          {reviews.map((r) => (
            <article className="review" key={r.id}>
              <div className="row">
                {Array.from({ length: r.rating }, (_, i) => (
                  <Star size={15} fill="currentColor" key={i} />
                ))}
                <strong>{r.name}</strong>
              </div>
              <p>{r.body}</p>
            </article>
          ))}
          {user && (
            <form
              className="stack"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api("/api/reviews", "POST", {
                    productId: p.id,
                    rating,
                    body: text,
                  });
                  setText("");
                  notify("Your review has been published.");
                  void loadReviews();
                } catch (e) {
                  notify((e as Error).message);
                }
              }}
            >
              <label className="field">
                <span>Your rating</span>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Your review</span>
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </label>
              <button className="button outline">Submit review</button>
            </form>
          )}
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <h2>Keep exploring.</h2>
          <Link href="/shop" className="text-link">
            All devices <ArrowRight size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x.id !== p.id)
            .slice(0, 3)
            .map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
        </div>
      </section>
    </div>
  );
}
