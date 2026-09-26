"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import { money, type Product } from "@/lib/types";
import { api, useStore } from "./Store";
export function ProductCard({ product: p }: { product: Product }) {
  const { notify, user } = useStore();
  return (
    <article className="product-card">
      <div className="product-image">
        <Link href={`/product/${p.slug}`}>
          <Image
            src={p.images[0] || "/brand/sailan-official.png"}
            alt={
              p.sample ? `Illustration for ${p.title} sample listing` : p.title
            }
            width={600}
            height={450}
            sizes="(max-width: 600px) 90vw, 30vw"
          />
        </Link>
        <span className="condition-tag">{p.condition}</span>
        <button
          className="favorite"
          aria-label={`Save ${p.title}`}
          onClick={async () => {
            if (!user) {
              notify("Sign in to save your favorite devices.");
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
          <Heart size={19} />
        </button>
      </div>
      <div className="product-info">
        <p className="meta">
          {p.brand} <span>·</span> {p.storage}
          {p.sample && " · Sample"}
        </p>
        <Link href={`/product/${p.slug}`}>
          <h3>{p.title}</h3>
        </Link>
        <div className="row between">
          <span className="price">
            {money(p.price)}
            {p.discount > 0 && <del>{money(p.price + p.discount)}</del>}
          </span>
          <Link
            className="round-link"
            href={`/product/${p.slug}`}
            aria-label={`View ${p.title}`}
          >
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}
