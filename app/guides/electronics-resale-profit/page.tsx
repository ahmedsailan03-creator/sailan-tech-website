import type { Metadata } from "next";
import Link from "next/link";
import styles from "./guide.module.css";

const url = "https://sailan-tech-website.vercel.app/guides/electronics-resale-profit";
export const metadata: Metadata = {
  title: "Electronics Resale Profit: Calculate Fees, ROI and Real Margin",
  description: "Learn how to estimate electronics resale profit after purchase cost, selling fees, shipping, repairs and returns reserve. Includes a worked example and free calculator.",
  alternates: { canonical: url },
  openGraph: {
    title: "How to Calculate Electronics Resale Profit Before Buying Inventory",
    description: "A step-by-step example covering selling fees, true costs, profit, ROI and margin.",
    type: "article",
    url
  }
};

const rows = [
  ["Expected selling price", "$465.00", "revenue"],
  ["Acquisition cost", "−$315.00", "cost"],
  ["Selling fee (12%)", "−$55.80", "cost"],
  ["Fixed transaction fee", "−$0.30", "cost"],
  ["Shipping", "−$12.00", "cost"],
  ["Returns/risk reserve", "−$20.00", "cost"],
  ["Estimated net profit", "$61.90", "result"]
] as const;

const schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Calculate Electronics Resale Profit Before Buying Inventory",
  description: "A worked example for estimating electronics resale profit, fees, ROI and margin.",
  mainEntityOfPage: url,
  datePublished: "2026-11-01",
  dateModified: "2026-11-01",
  author: { "@type": "Organization", name: "Sailan Tech Solutions LLC" },
  publisher: { "@type": "Organization", name: "Sailan Tech Solutions LLC" }
};

export default function ResaleProfitGuide() {
  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <article className={styles.wrap}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumbs"><Link href="/">Sailan Tech</Link><span>/</span><Link href="/tools/resale-calculator">Free tools</Link><span>/</span>Resale profit guide</nav>
        <header className={styles.hero}>
          <p className={styles.kicker}>FREE GUIDE · ELECTRONICS RESELLING</p>
          <h1>Calculate your resale profit <em>before you buy.</em></h1>
          <p className={styles.lead}>A good selling price does not guarantee a good deal. Here is a practical way to estimate what you keep after fees, shipping, repairs and the risk of returns.</p>
          <div className={styles.actions}><Link href="/tools/resale-calculator" className={styles.primary}>Use the free profit calculator</Link><Link href="/resale-lab-pro" className={styles.secondary}>Explore the offline Pro toolkit</Link></div>
          <p className={styles.note}>Published November 1, 2026 · 4-minute read · Sample figures, not live market quotes</p>
        </header>

        <section className={styles.section}>
          <h2>1. Start with net profit, not the sale price</h2>
          <p>When evaluating a phone, laptop or bulk lot, begin with the realistic selling price. Then subtract the acquisition cost and every cost required to complete the sale. A simple planning formula is:</p>
          <div className={styles.formula}>Estimated net profit = sale price − purchase cost − selling fees − shipping − repairs − risk reserve</div>
          <p>A returns reserve is an estimate for possible future losses, not necessarily money you will spend on every sale. If your actual fees or expenses change, so does the result.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Worked example: one used device</h2>
          <p>Imagine a device purchased for $315 and expected to sell for $465. Assume a 12% selling fee, a $0.30 fixed fee, $12 shipping and a $20 returns/risk allowance. These are illustrative inputs, not a quote from any sales platform.</p>
          <div className={styles.tableWrap}><table><caption>Illustrative per-unit resale calculation</caption><thead><tr><th scope="col">Line item</th><th scope="col">Amount</th></tr></thead><tbody>{rows.map(([label,amount,kind])=><tr key={label} className={kind==="result"?styles.total:undefined}><th scope="row">{label}</th><td>{amount}</td></tr>)}</tbody></table></div>
          <p>That leaves <strong>$61.90 estimated net profit</strong> on a $465 sale. It does not mean $61.90 is guaranteed: taxes, unexpected repairs, unsold inventory, refunds and price changes can reduce it.</p>
        </section>

        <section className={styles.section}>
          <h2>3. ROI and profit margin are different</h2>
          <div className={styles.metrics}>
            <div><span>Return on estimated cost</span><strong>15.4%</strong><p>$61.90 ÷ $403.10 total modeled cost</p></div>
            <div><span>Profit margin on sale</span><strong>13.3%</strong><p>$61.90 ÷ $465.00 selling price</p></div>
          </div>
          <p>ROI compares profit with the modeled cost of completing the sale; margin compares profit with the selling price. If your target is 20% ROI, this example falls short even though it shows a positive profit.</p>
        </section>

        <section className={styles.section}>
          <h2>4. Check risks before committing money</h2>
          <ul className={styles.checks}>
            <li>Verify ownership and activation/management lock status before purchase.</li>
            <li>Inspect battery, display, ports, cameras and any known defects.</li>
            <li>Use completed-sale comparables, not just optimistic asking prices.</li>
            <li>Confirm fees, postage, sales taxes and return rules for your actual sales channel.</li>
            <li>For bulk lots, calculate the profit on every unit, including damaged or unsellable items.</li>
          </ul>
        </section>

        <section className={styles.cta}>
          <p className={styles.kicker}>FREE FIRST, PRO WHEN YOU NEED IT</p>
          <h2>Run your own numbers.</h2>
          <p>Our free calculator estimates profit, ROI and margin using your costs. Resale Lab Pro adds bulk CSV analysis, local deal saving and exports. Its proposed launch price is $19.99; self-service payment is not active yet.</p>
          <div className={styles.actions}><Link href="/tools/resale-calculator" className={styles.primary}>Open free calculator</Link><Link href="/resale-lab-pro" className={styles.secondary}>View Resale Lab Pro</Link></div>
        </section>
        <p className={styles.note}>Educational estimates only. This guide is not a guarantee of profit or a substitute for independent due diligence. © Sailan Tech Solutions LLC.</p>
      </article>
    </main>
  );
}
