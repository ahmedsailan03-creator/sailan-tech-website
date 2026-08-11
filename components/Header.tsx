"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header concept-header">
      <div className="container nav-shell concept-nav-shell">
        <Link href="/" className="brand concept-brand" onClick={close}>
          <span className="brand-logo-shell">
            <Image
              src="/sailan-logo.png"
              alt="Sailan Tech Solutions LLC"
              width={54}
              height={54}
              className="brand-logo"
              priority
            />
          </span>
          <span className="brand-copy">
            <strong>SAILAN</strong>
            <small>TECH SOLUTIONS LLC</small>
          </span>
        </Link>

        <nav className={`main-nav concept-main-nav ${open ? "open" : ""}`}>
          <Link href="/" onClick={close}>Home</Link>
          <Link href="/services" onClick={close}>Services</Link>
          <Link href="/plans" onClick={close}>Plans</Link>
          <Link href="/#process" onClick={close}>Process</Link>
          <Link href="/about" onClick={close}>About</Link>
          <Link href="/contact" onClick={close}>Contact</Link>
          <Link href="/free-it-checkup" className="nav-button concept-nav-button" onClick={close}>
            Get a Free Checkup
          </Link>
        </nav>

        <button
          className={`menu-toggle ${open ? "active" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
