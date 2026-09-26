"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  UserRound,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { Brand } from "./Brand";
import { useStore } from "./Store";
import { money, type Product } from "@/lib/types";
const links = [
  ["Shop", "/shop"],
  ["iPhone", "/shop/iphone"],
  ["iPad", "/shop/ipad"],
  ["Mac", "/shop/macbook"],
  ["Computers", "/shop/computers"],
  ["Gaming", "/shop/gaming"],
  ["Accessories", "/shop/accessories"],
  ["Deals", "/deals"],
  ["Sell to Sailan Tech", "/sell"],
  ["Repairs", "/repairs"],
  ["Wholesale", "/wholesale"],
  ["Support", "/support"],
];
export function Shell({
  children,
  products,
  live,
}: {
  children: React.ReactNode;
  products: Product[];
  live: boolean;
}) {
  const [search, setSearch] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const { cart } = useStore();
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    setSearch(false);
    setMobile(false);
  }, [path]);
  useEffect(() => {
    if (search) dialog.current?.showModal();
    else dialog.current?.close();
  }, [search]);
  useEffect(() => {
    if (mobile) menu.current?.showModal();
    else menu.current?.close();
  }, [mobile]);
  const matches = products
    .filter((p) =>
      q
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .every((term) =>
          `${p.title} ${p.brand} ${p.storage} ${p.cpu} ${p.condition} ${p.carrier}`
            .toLowerCase()
            .includes(term),
        ),
    )
    .slice(0, 4);
  const count = cart.reduce((n, x) => n + x.quantity, 0);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="utility">
        <span>SAILAN TECH SOLUTIONS LLC</span>
        <span>
          {live
            ? "Buy. Sell. Make more of your tech."
            : "Preview store · Sample inventory · Purchases not yet open"}
        </span>
        <Link href="/condition-guide">
          Our condition guide <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="store-header">
        <div className="header-main wrap">
          <Brand />
          <div className="header-note">
            Good tech deserves
            <br />
            <strong>another great chapter.</strong>
          </div>
          <div className="header-actions">
            <button
              className="icon-button search-trigger"
              onClick={() => setSearch(true)}
              aria-label="Search devices"
            >
              <Search size={20} />
              <span>Search</span>
            </button>
            <Link
              className="icon-button"
              href="/account"
              aria-label="Your account"
            >
              <UserRound size={21} />
            </Link>
            <Link
              className="icon-button bag"
              href="/cart"
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag size={21} />
              {count > 0 && <span className="bag-count">{count}</span>}
            </Link>
            <button
              className="icon-button mobile-toggle"
              onClick={() => setMobile(true)}
              aria-label="Open navigation"
            >
              <Menu size={23} />
            </button>
          </div>
        </div>
        <nav className="desktop-nav wrap" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link
              key={href}
              className={path === href ? "active" : ""}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="store-footer">
        <div className="wrap footer-top">
          <div>
            <Brand large />
            <p>
              Technology for your next chapter.
              <br />
              Operated by Sailan Tech Solutions LLC.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            {[
              ["Shop all devices", "/shop"],
              ["Latest deals", "/deals"],
              ["Sell your tech", "/sell"],
              ["Wholesale", "/wholesale"],
            ].map(([l, h]) => (
              <Link href={h} key={h}>
                {l}
              </Link>
            ))}
          </div>
          <div>
            <h3>Here to help</h3>
            {[
              ["Support", "/support"],
              ["Repairs", "/repairs"],
              ["Condition guide", "/condition-guide"],
              ["Shipping", "/shipping"],
              ["Returns", "/returns"],
              ["Warranty", "/warranty"],
            ].map(([l, h]) => (
              <Link href={h} key={h}>
                {l}
              </Link>
            ))}
          </div>
          <div>
            <h3>Sailan Tech</h3>
            {[
              ["About us", "/about"],
              ["Your account", "/account"],
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
            ].map(([l, h]) => (
              <Link href={h} key={h}>
                {l}
              </Link>
            ))}
            <Link href="/admin" className="muted">
              Store management
            </Link>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} Sailan Tech Solutions LLC.</span>
          <span>
            Michigan, USA <span className="footer-dot">·</span> USD $
          </span>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="search-dialog"
        onCancel={() => setSearch(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSearch(false);
        }}
      >
        <div className="search-content">
          <div className="row between">
            <p className="eyebrow">FIND YOUR NEXT DEVICE</p>
            <button
              className="icon-button"
              onClick={() => setSearch(false)}
              aria-label="Close search"
            >
              <X />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(false);
              router.push(`/shop?q=${encodeURIComponent(q)}`);
            }}
          >
            <label className="search-input">
              <Search size={26} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="iPhone, MacBook, 512GB unlocked…"
                aria-label="Search products"
              />
              <button
                className="icon-button"
                aria-label="View all search results"
              >
                <ArrowRight />
              </button>
            </label>
          </form>
          <p className="meta">
            {q
              ? `${matches.length} suggested results`
              : "A few places to start"}
          </p>
          <div className="search-results">
            {matches.map((p) => (
              <Link
                href={`/product/${p.slug}`}
                onClick={() => setSearch(false)}
                key={p.id}
              >
                <Image
                  src={p.images[0]}
                  alt="Illustrative device image"
                  width={90}
                  height={70}
                />
                <span>
                  <strong>{p.title}</strong>
                  <small>
                    {p.storage} · {p.condition}
                  </small>
                </span>
                <b>{money(p.price)}</b>
              </Link>
            ))}
            {matches.length === 0 && (
              <p>No matching devices. Try a model, brand, or storage size.</p>
            )}
          </div>
        </div>
      </dialog>
      <dialog
        ref={menu}
        className="mobile-menu"
        onCancel={() => setMobile(false)}
      >
        <div className="row between">
          <Brand />
          <button
            className="icon-button"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          <Link href="/account" onClick={() => setMobile(false)}>
            Your account <ArrowUpRight size={20} />
          </Link>
          {links.map(([l, h]) => (
            <Link key={h} href={h} onClick={() => setMobile(false)}>
              {l}
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </nav>
      </dialog>
    </>
  );
}
