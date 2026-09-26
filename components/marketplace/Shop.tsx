"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import { categories, money, type Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
const routeFilter = (p: Product, slug: string) =>
  !slug || slug === "all"
    ? true
    : slug === "iphone"
      ? p.title.includes("iPhone")
      : slug === "ipad"
        ? p.title.includes("iPad")
        : slug === "macbook"
          ? p.category === "MacBooks"
          : slug === "computers"
            ? ["Desktops", "Laptops"].includes(p.category)
            : slug === "deals"
              ? p.discount > 0 || p.condition === "Open Box"
              : p.category.toLowerCase().replace(/ /g, "-") === slug;
export function Shop({
  products,
  category = "",
  initialQuery = "",
  deals = false,
}: {
  products: Product[];
  category?: string;
  initialQuery?: string;
  deals?: boolean;
}) {
  const [q, setQ] = useState(initialQuery);
  const [sort, setSort] = useState("Featured");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const source = products.filter((p) => routeFilter(p, category));
  const fields = [
    "category",
    "brand",
    "model",
    "condition",
    "storage",
    "ram",
    "cpu",
    "gpu",
    "carrier",
    "color",
    "status",
  ];
  const results = useMemo(
    () =>
      source
        .filter((p) =>
          q
            .toLowerCase()
            .split(/\s+/)
            .every((term) =>
              `${p.title} ${p.brand} ${p.category} ${p.cpu} ${p.gpu} ${p.storage} ${p.ram} ${p.carrier} ${p.condition}`
                .toLowerCase()
                .includes(term),
            ),
        )
        .filter((p) =>
          Object.entries(filters).every(
            ([k, v]) => !v || String(p[k as keyof Product]) === v,
          ),
        )
        .filter((p) => !maxPrice || p.price <= Number(maxPrice) * 100)
        .sort((a, b) =>
          sort === "Price low to high"
            ? a.price - b.price
            : sort === "Price high to low"
              ? b.price - a.price
              : sort === "Newest"
                ? b.createdAt.localeCompare(a.createdAt)
                : sort === "Best selling"
                  ? b.soldCount - a.soldCount
                  : Number(b.featured) - Number(a.featured),
        ),
    [source, q, filters, maxPrice, sort],
  );
  const title = deals
    ? "A little less. A lot to love."
    : category
      ? (
          {
            iphone: "Find your next iPhone.",
            ipad: "Room for more possibilities.",
            macbook: "Your next MacBook.",
            gaming: "Your next level.",
            computers: "Ready for what’s next.",
          } as Record<string, string>
        )[category] ||
        `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")}.`
      : "Find your next great device.";
  return (
    <div className="wrap page-space">
      <div className="page-head">
        <p className="eyebrow">{deals ? "THE DEALS EDIT" : "THE COLLECTION"}</p>
        <h1>{title}</h1>
        <p>Explore the details. Compare the condition. Find the right fit.</p>
      </div>
      <nav className="category-tabs" aria-label="Product categories">
        <Link className={!category ? "active" : ""} href="/shop">
          All devices
        </Link>
        {categories.map((c) => (
          <Link
            className={
              category === c.toLowerCase().replace(/ /g, "-") ? "active" : ""
            }
            href={`/shop/${c === "MacBooks" ? "macbook" : c.toLowerCase().replace(/ /g, "-")}`}
            key={c}
          >
            {c}
          </Link>
        ))}
      </nav>
      <div className="shop-toolbar">
        <label className="catalog-search">
          <Search size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the collection"
            aria-label="Search the collection"
          />
        </label>
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={17} /> Filters
        </button>
        <label className="sort-control">
          Sort by{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
          >
            {[
              "Featured",
              "Newest",
              "Price low to high",
              "Price high to low",
              "Best selling",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="shop-layout">
        <aside className={`shop-filters ${showFilters ? "open" : ""}`}>
          <div className="row between">
            <h2>Filter by</h2>
            <button
              className="text-button"
              onClick={() => {
                setFilters({});
                setMaxPrice("");
                setQ("");
              }}
            >
              Reset
            </button>
          </div>
          <label className="field">
            <span>Maximum price ($)</span>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="No limit"
            />
          </label>
          {fields.map((key) => {
            const values = [
              ...new Set(
                source
                  .map((p) => String(p[key as keyof Product]))
                  .filter(Boolean),
              ),
            ];
            if (!values.length) return null;
            return (
              <label className="field" key={key}>
                <span>
                  {(
                    {
                      ram: "RAM",
                      cpu: "CPU",
                      gpu: "GPU",
                      status: "Availability",
                    } as Record<string, string>
                  )[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <select
                  value={filters[key] || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, [key]: e.target.value })
                  }
                >
                  <option value="">All</option>
                  {values.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            );
          })}
        </aside>
        <section>
          <div className="results-count">
            {results.length} {results.length === 1 ? "device" : "devices"}
            {Object.values(filters).some(Boolean) && " · filters applied"}
          </div>
          {results.length ? (
            <div className="product-grid">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={35} strokeWidth={1} />
              <h2>No matches just yet.</h2>
              <p>
                Try a different filter, or ask us about the device you’re
                looking for.
              </p>
              <button
                className="button outline"
                onClick={() => {
                  setFilters({});
                  setQ("");
                  setMaxPrice("");
                }}
              >
                Clear filters
              </button>
              <Link className="text-link" href="/support">
                Ask Sailan Tech <ArrowRight size={16} />
              </Link>
            </div>
          )}
          <p className="catalog-note">
            Sample listings use illustrative images and cannot be purchased.
          </p>
        </section>
      </div>
    </div>
  );
}
