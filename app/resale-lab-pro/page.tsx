import type { Metadata } from "next";
import Link from "next/link";
import styles from "./product.module.css";

const price = "$19.99";
export const metadata: Metadata = {
  title: "Resale Lab Pro — Offline Electronics Reseller Deal Analyzer",
  description: "Compare electronics deals before buying. Resale Lab Pro analyzes bulk supplier CSVs, estimates fees, repairs and ROI, saves deals locally and exports results. By Sailan Tech Solutions.",
  alternates: { canonical: "https://sailan-tech-website.vercel.app/resale-lab-pro" },
  openGraph: { title: "Resale Lab Pro | Electronics Profit and Bulk Deal Analyzer", description: "An offline browser toolkit for assessing electronics resale deals before buying inventory.", type: "website" }
};

const features = [
  { n:"01", title:"Bulk supplier lists", text:"Import a CSV of up to 2,000 rows and rank opportunities by estimated unit profit." },
  { n:"02", title:"Cost-aware estimates", text:"Factor in acquisition, percentage and fixed fees, shipping, repairs, and a returns reserve." },
  { n:"03", title:"Saved deal board", text:"Store potential buys locally in your browser, compare projected outcomes and export CSVs." },
  { n:"04", title:"Device risk checklist", text:"Remember to check ownership, lock status, battery, display and sold-comparable listings." }
];

export default function ProductPage(){
  return <main className={styles.page}>
    <div className={styles.wrap}>
      <nav className={styles.crumb} aria-label="Breadcrumbs"><Link href="/">Sailan Tech</Link><span>/</span><Link href="/tools/resale-calculator">Free tools</Link><span>/</span><strong>Resale Lab Pro</strong></nav>
      <header className={styles.hero}>
        <div>
          <div className={styles.kicker}>SAILAN TECH SOLUTIONS LLC · DIGITAL SOFTWARE</div>
          <h1>Know the deal.<br/><em>Before you buy.</em></h1>
          <p>Resale Lab Pro is a downloadable, offline electronics reseller toolkit built for evaluating iPhone, laptop and multi-device wholesale offers.</p>
          <div className={styles.pills}><span>Works offline</span><span>Bulk CSV import</span><span>One-time purchase</span><span>No subscription</span></div>
          <div className={styles.price}><strong>{price}</strong><span>Proposed launch price · product available by inquiry while checkout setup is completed</span></div>
          <div className={styles.actions}>
            <a className={styles.primary} href="mailto:ahmed@sailantech.com?subject=Resale%20Lab%20Pro%20purchase%20inquiry">Request purchase details ↗</a>
            <Link className={styles.secondary} href="/tools/resale-calculator">Try the free calculator</Link>
          </div>
          <p className={styles.disclosure}>No payment is collected on this page. A secure self-service checkout and instant delivery are not active yet.</p>
        </div>
        <div className={styles.preview} aria-label="Illustrative interface preview">
          <div className={styles.previewHead}><span>◈</span> <b>RESALE LAB PRO</b><small>OFFLINE WORKSPACE</small></div>
          <div className={styles.previewSub}>Deal analyzer <span>UNIT ESTIMATE</span></div>
          <div className={styles.previewMetric}>$61.90 <small>sample net per unit</small></div>
          <div className={styles.previewGrid}><div>ROI <b>15.4%</b></div><div>MARGIN <b>13.3%</b></div></div>
          <div className={styles.previewBars}><span/><span/><span/><span/></div>
          <p>Sample illustration. Actual outputs depend on the costs you enter.</p>
        </div>
      </header>
      <section className={styles.section}>
        <div className={styles.sectionHead}><span className={styles.kicker}>INSIDE YOUR DOWNLOAD</span><h2>Four tools. One clear decision.</h2></div>
        <div className={styles.features}>{features.map(f=><article key={f.n}><small>{f.n}</small><h3>{f.title}</h3><p>{f.text}</p></article>)}</div>
      </section>
      <section className={styles.split}>
        <div>
          <div className={styles.kicker}>WHO IT'S FOR</div>
          <h2>Built for people who buy inventory to resell.</h2>
          <p>Compare offers, spot thin margins, and avoid forgetting hidden costs. Especially useful for evaluating electronics suppliers and wholesale price lists.</p>
        </div>
        <div className={styles.box}>
          <h3>What you receive</h3>
          <p>A ZIP containing an offline HTML application, styling and code, a quick-start guide, and a sample supplier CSV. Extract it, open index.html in your browser, and enter your own numbers.</p>
          <p><b>Requirements:</b> Modern desktop browser. No Microsoft Excel license or cloud account required.</p>
          <p><b>Data handling:</b> Locally saved deals are in your browser profile and may be cleared. Export backups regularly.</p>
        </div>
      </section>
      <section className={styles.faq}>
        <h2>Clear expectations</h2>
        <div><h3>Is it linked to Amazon, eBay or other marketplaces?</h3><p>No. CSV import and manual entry only. We do not represent a partnership with those platforms.</p></div>
        <div><h3>Does it calculate my real earnings automatically?</h3><p>No. It estimates profit from the purchase price, anticipated sale, and costs you enter. Returns, taxes, financing costs, actual fees and market changes may differ.</p></div>
        <div><h3>Can I resell this software?</h3><p>No. The license is for one purchasing business's internal use. You may not redistribute the code or files.</p></div>
        <div><h3>Can I buy it right now?</h3><p>A self-service checkout is not ready. Use the purchase inquiry link above, or start with our free calculator.</p></div>
      </section>
      <footer className={styles.foot}>© Sailan Tech Solutions LLC · <Link href="/contact">Contact</Link> · <Link href="/tools/resale-calculator">Free profit calculator</Link></footer>
    </div>
  </main>;
}