"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./ResaleCalculator.module.css";

const money=(n:number)=>n.toLocaleString("en-US",{style:"currency",currency:"USD"});
const safe=(raw:string)=>{const n=Number(raw);return Number.isFinite(n)?Math.max(0,n):0};
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;

export default function ResaleCalculatorPage(){
  const [buy,setBuy]=useState("315");
  const [sell,setSell]=useState("465");
  const [feePct,setFeePct]=useState("12");
  const [flat,setFlat]=useState("0.30");
  const [ship,setShip]=useState("12");
  const [repair,setRepair]=useState("0");
  const [reserve,setReserve]=useState("20");
  const [qty,setQty]=useState("1");
  const [target,setTarget]=useState("20");
  const d=useMemo(()=>{
    const acquired=safe(buy),sale=safe(sell),percent=Math.min(safe(feePct),100),fixed=safe(flat),shipping=safe(ship),repairs=safe(repair),risk=safe(reserve),units=Math.min(10000,Math.max(1,Math.floor(safe(qty))));
    const fees=round(sale*percent/100+fixed);
    const cost=round(acquired+fees+shipping+repairs+risk);
    const net=round(sale-cost);
    const roi=cost>0?round(100*net/cost):0;
    const margin=sale>0?round(100*net/sale):0;
    const verdict=acquired===0||sale===0?"Enter valid buy and sale prices":net<=0?"Estimated loss":roi<safe(target)?"Below target ROI":"Meets target ROI";
    return {acquired,sale,fees,shipping,repairs,risk,cost,net,total:round(net*units),roi,margin,units,verdict};
  },[buy,sell,feePct,flat,ship,repair,reserve,qty,target]);
  const fields:[
    string,string,(v:string)=>void
  ][]=[
    ["Purchase per unit ($)",buy,setBuy],
    ["Expected resale per unit ($)",sell,setSell],
    ["Platform fee (%)",feePct,setFeePct],
    ["Fixed transaction fee ($)",flat,setFlat],
    ["Shipping per unit ($)",ship,setShip],
    ["Repairs per unit ($)",repair,setRepair],
    ["Returns reserve per unit ($)",reserve,setReserve],
    ["Quantity",qty,setQty],
    ["Target ROI (%)",target,setTarget]
  ];
  const statusClass=d.net<0?styles.negative:d.verdict==="Meets target ROI"?styles.positive:"";
  return <main className={styles.wrap}><div className={styles.inner}>
    <header className={styles.hero}><div>
      <div className={styles.kicker}>SAILAN TECH SOLUTIONS / FREE SELLER TOOL</div>
      <h1>Resale profit <em>calculator.</em></h1>
      <p>Stop guessing your margins. Estimate earnings on phones, laptops, gaming systems and other electronics before buying inventory.</p>
      <div className={styles.badges}><span>Instant profit math</span><span>Custom seller fees</span><span>Zero sign-up</span></div>
    </div><div className={styles.heroMark} aria-hidden="true">S</div></header>
    <div className={styles.layout}>
      <section className={styles.panel}><h2>Build your deal</h2><p>Replace the sample inputs with your actual pricing and fees. Calculations update immediately.</p>
        <div className={styles.grid}>{fields.map(([label,value,onChange])=><label key={label}><span>{label}</span><input type="number" min="0" max={label==="Quantity"?"10000":undefined} step={label==="Quantity"?"1":"0.01"} value={value} onChange={e=>onChange(e.target.value)} aria-label={label}/></label>)}</div>
      </section>
      <section className={styles.panel} aria-live="polite">
        <div className={styles.resultHeader}><h2>Estimated outcome</h2><span className={styles.status+" "+statusClass}>{d.verdict.toUpperCase()}</span></div>
        <div className={styles.label}>Net profit — {d.units} unit(s)</div>
        <div className={styles.big+" "+(d.total<0?styles.negative:"")}>{money(d.total)}</div>
        <div className={styles.metrics}>
          <div><small>PER UNIT</small><strong>{money(d.net)}</strong></div>
          <div><small>RETURN ON COST</small><strong>{d.roi.toFixed(1)}%</strong></div>
          <div><small>SALE MARGIN</small><strong>{d.margin.toFixed(1)}%</strong></div>
          <div><small>ALL-IN COST</small><strong>{money(d.cost*d.units)}</strong></div>
        </div>
        <div className={styles.verdict}>{d.verdict==="Meets target ROI"?"The estimate meets your target. Verify activation locks, device testing and sold comps before buying.":d.verdict==="Below target ROI"?"The deal shows a positive estimate but does not reach your target ROI. Negotiate or reassess the costs.":d.verdict==="Estimated loss"?"The estimated deal loses money after expenses. Do not buy based on the current numbers.":"Enter realistic prices to analyze the deal."}</div>
        <div className={styles.breakdown}>
          <div><span>Resale price</span><b>{money(d.sale)}</b></div>
          <div><span>Purchase cost</span><b>−{money(d.acquired)}</b></div>
          <div><span>Platform fees</span><b>−{money(d.fees)}</b></div>
          <div><span>Shipping + repairs</span><b>−{money(d.shipping+d.repairs)}</b></div>
          <div><span>Returns reserve</span><b>−{money(d.risk)}</b></div>
          <div><span>Net / unit</span><b>{money(d.net)}</b></div>
        </div>
      </section>
    </div>
    <section className={styles.promo}>
      <div><div className={styles.kicker}>FOR SERIOUS RESELLERS</div><h2>Need bulk supplier analysis?</h2><p>Resale Lab Pro adds CSV lot analysis, saved-deal comparisons, risk checklists and exports in an offline toolkit. Proposed launch price: $19.99. Secure self-service checkout is not yet active.</p></div>
      <Link href="/resale-lab-pro">Explore the Pro toolkit ↗</Link>
    </section>
    <p className={styles.fine}>New to reseller math? <Link className={styles.link} href="/guides/electronics-resale-profit">Read our step-by-step resale profit guide</Link>.</p>
    <p className={styles.fine}>Sample values are illustrative, not current marketplace fee quotes or verified sold prices. Estimates exclude applicable taxes and do not guarantee earnings. No accounts, uploaded data, or live market pricing are accessed. <Link className={styles.link} href="/">Back to Sailan Tech</Link>.</p>
  </div></main>;
}
