import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Smartphone,
  Laptop,
  Gamepad2,
  Tablet,
  Monitor,
  Headphones,
  ShieldCheck,
  PackageCheck,
  RefreshCw,
} from "lucide-react";
import { getProducts } from "@/lib/database";
import { artwork } from "@/lib/catalog";
import { ProductCard } from "@/components/marketplace/ProductCard";
export default async function Home() {
  const products = await getProducts();
  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">THE SAILAN TECH MARKETPLACE</p>
            <h1>
              Premium tech.
              <br />
              <span>Better value.</span>
            </h1>
            <p className="hero-description">
              A new home for the tech you want.
              <br />A next chapter for the tech you own.
            </p>
            <div className="actions">
              <Link className="button blue" href="/shop">
                Shop devices <ArrowUpRight size={18} />
              </Link>
              <Link className="text-link light" href="/sell">
                Sell to Sailan Tech <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-bottom">
              <span>PHONES. COMPUTERS. GAMING.</span>
              <span>01 / THE COLLECTION</span>
            </div>
          </div>
          <div className="hero-art">
            <Image
              src={artwork.logo}
              alt="Official Sailan Tech Solutions LLC PC and wordmark"
              width={900}
              height={900}
              priority
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
      <section className="category-strip wrap" aria-label="Shop categories">
        {[
          [Smartphone, "iPhone", "iphone"],
          [Tablet, "iPad & tablets", "tablets"],
          [Laptop, "MacBook", "macbook"],
          [Monitor, "Computers", "computers"],
          [Gamepad2, "Gaming", "gaming"],
          [Headphones, "Accessories", "accessories"],
        ].map(([Icon, label, slug]) => {
          const I = Icon as typeof Smartphone;
          return (
            <Link href={`/shop/${slug}`} key={String(slug)}>
              <I size={27} strokeWidth={1.3} />
              <span>{String(label)}</span>
              <ArrowUpRight size={14} />
            </Link>
          );
        })}
      </section>
      <section className="wrap section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR EVERYDAY UPGRADE</p>
            <h2>
              Great tech. <span>Fresh possibilities.</span>
            </h2>
          </div>
          <Link className="text-link" href="/shop">
            Explore the shop <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="showcase-grid">
          <Link href="/shop/iphone" className="showcase-card">
            <div>
              <p className="eyebrow">IPHONE</p>
              <h3>
                Everything you love.
                <br />
                More within reach.
              </h3>
              <span className="text-link">
                Explore iPhone <ArrowRight size={17} />
              </span>
            </div>
            <Image
              src={artwork.phone}
              alt="Original illustrative smartphone showcase"
              width={900}
              height={600}
            />
          </Link>
          <Link href="/shop/macbook" className="showcase-card">
            <div>
              <p className="eyebrow">MACBOOK</p>
              <h3>A brilliant next move.</h3>
              <p>For the work. And everything after.</p>
              <span className="text-link">
                Explore Mac <ArrowRight size={17} />
              </span>
            </div>
            <Image
              src={artwork.laptop}
              alt="Original illustrative silver laptop showcase"
              width={900}
              height={600}
            />
          </Link>
        </div>
      </section>
      <section className="gaming-banner">
        <div className="wrap gaming-inner">
          <div>
            <p className="eyebrow">PLAY YOUR NEXT CHAPTER</p>
            <h2>
              Less waiting.
              <br />
              More playing.
            </h2>
            <p>Consoles, gaming PCs, and your next favorite accessory.</p>
            <Link className="button white" href="/shop/gaming">
              Explore gaming <ArrowUpRight size={18} />
            </Link>
          </div>
          <Image
            src={artwork.gaming}
            alt="Original white and charcoal gaming controller illustration"
            width={900}
            height={600}
          />
        </div>
      </section>
      <section className="wrap section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A LOOK INSIDE THE COLLECTION</p>
            <h2>Worth a closer look.</h2>
          </div>
          <Link href="/deals" className="text-link">
            Latest deals <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="product-grid home-products">
          {products
            .filter((p) => p.featured)
            .slice(0, 3)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
        <p className="catalog-note">
          Sample listings and illustrative images. Live availability will be
          confirmed before purchases open.
        </p>
      </section>
      <section className="refurb-section wrap">
        <div>
          <p className="eyebrow">UNDERSTAND WHAT YOU’RE BUYING</p>
          <h2>
            Another life.
            <br />
            The same possibilities.
          </h2>
        </div>
        <div>
          <p className="large-copy">
            From open box to refurbished, a clear condition grade helps you find
            the right fit for your budget.
          </p>
          <Link className="text-link" href="/condition-guide">
            Explore our grading guide <ArrowRight size={18} />
          </Link>
          <div className="grade-line">
            <span>Open Box</span>
            <span>Excellent</span>
            <span>Good</span>
            <span>Fair</span>
          </div>
        </div>
      </section>
      <section className="sell-banner">
        <div className="wrap">
          <p className="eyebrow">SELL TO SAILAN TECH</p>
          <h2>
            Your old tech.
            <br />
            <span>Your next possibility.</span>
          </h2>
          <p>
            Tell us about your device. See an instant estimate.
            <br />
            Decide what comes next.
          </p>
          <Link className="button blue" href="/sell">
            Get my quote <ArrowUpRight size={18} />
          </Link>
          <small>Final offer confirmed after inspection.</small>
        </div>
      </section>
      <section className="wrap trust-row">
        {[
          [
            PackageCheck,
            "Know your device",
            "Clear condition grades and device details.",
          ],
          [
            ShieldCheck,
            "Buy with clarity",
            "Review the device’s terms before checkout.",
          ],
          [
            RefreshCw,
            "Keep tech moving",
            "Buy, sell, or request a repair in one place.",
          ],
        ].map(([Icon, title, copy]) => {
          const I = Icon as typeof ShieldCheck;
          return (
            <div key={String(title)}>
              <I size={27} strokeWidth={1.4} />
              <h3>{String(title)}</h3>
              <p>{String(copy)}</p>
            </div>
          );
        })}
      </section>
    </>
  );
}
