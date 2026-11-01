import type { Metadata } from "next";
import Link from "next/link";
import styles from "./remote.module.css";

export const metadata: Metadata={
title:"Remote IT Help — Flat $59 Support Session | Sailan Tech",
description:"Request a flat-rate $59 remote Windows, Microsoft 365, printer, and home-office troubleshooting session from Sailan Tech. By appointment, email-first.",
alternates:{canonical:"https://sailan-tech-website.vercel.app/remote-it-help"}
};

const services=[
["Windows and laptops","Slow computers, basic troubleshooting, settings, drivers and common software issues"],
["Email and Microsoft 365","Outlook setup, account troubleshooting, Teams, OneDrive and standard sign-in issues"],
["Wi-Fi and printers","Home-office connectivity, printing, scanner setup, and local network diagnostics"],
["Small-business technology","Basic IT configuration, software installation and desktop productivity fixes"]
];
export default function RemoteITHelp(){
return <main className={styles.page}><div className={styles.wrap}>
<div className={styles.crumb}><Link href="/">Sailan Tech</Link><span>/</span> Remote IT Help</div>
<section className={styles.hero}>
<div className={styles.mainCol}>
<p className={styles.eyebrow}>SAILAN TECH SOLUTIONS LLC · FLAT-RATE SUPPORT</p>
<h1>Tech headache?<br/><em>Get it handled.</em></h1>
<p className={styles.lead}>Remote troubleshooting for Windows computers, Microsoft 365, printers, Wi-Fi, and small-business technology. A clear price, no surprise subscription.</p>
<div className={styles.pills}><span>Remote assistance</span><span>One-time session</span><span>Email-first booking</span></div>
<div className={styles.actions}><a className={styles.primary} href="mailto:ahmed@sailantech.com?subject=Remote%20IT%20Help%20%E2%80%94%20%2459%20Session&body=Please%20describe%20your%20issue%3A%0A%0ADevice%20and%20operating%20system%3A%0A%0APreferred%20time%3A%0A">Request a support session</a><Link className={styles.secondary} href="/contact">Other business inquiries</Link></div>
<p className={styles.fine}>Session availability is confirmed by email. No payment is collected on this webpage; payment details are provided after scope and scheduling are agreed.</p>
</div>
<aside className={styles.rate}><p className={styles.rateEyebrow}>REMOTE TECH RESCUE</p><strong>$59</strong><span>Flat rate · up to 45 minutes</span><hr/><div><b>What's included</b><p>Initial issue review, one scheduled remote session, basic troubleshooting, and a summary of what was done.</p></div><div><b>Before we begin</b><p>You approve any remote access. No passwords, recovery codes or sensitive records are requested by email.</p></div><div className={styles.note}>If the issue requires replacement hardware, on-site service, additional sessions or advanced repairs, you receive a separate quote first.</div></aside>
</section>
<section className={styles.section}><p className={styles.eyebrow}>WHAT WE CAN HELP WITH</p><h2>Real fixes for everyday tech problems.</h2><div className={styles.cards}>{services.map(([title,desc],i)=><article key={title}><small>0{i+1}</small><h3>{title}</h3><p>{desc}</p></article>)}</div></section>
<section className={styles.process}><h2>How it works</h2><div><article><span>01</span><b>Tell us what's wrong</b><p>Describe your device and problem. Never email your password or verification codes.</p></article><article><span>02</span><b>Confirm the appointment</b><p>We'll confirm the scope, availability, and a payment method before starting.</p></article><article><span>03</span><b>Get remote assistance</b><p>We troubleshoot with your permission. Work requiring more time needs your approval.</p></article></div></section>
<p className={styles.fine}>No guarantee of a specific repair outcome or same-day availability. This offer is for authorized troubleshooting only; no account-security bypass, recovery without ownership verification, or handling regulated records. © Sailan Tech Solutions LLC.</p>
</div></main>
}