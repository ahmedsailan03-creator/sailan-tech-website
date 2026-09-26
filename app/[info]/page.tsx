import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { getSettings } from "@/lib/database";
const titles: Record<string, string> = {
  "condition-guide": "Know exactly what to expect.",
  shipping: "Getting your tech to you.",
  returns: "Returns, clearly explained.",
  warranty: "Understand your coverage.",
  privacy: "Your information. Handled with care.",
  terms: "The details that matter.",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const { info } = await params;
  return { title: titles[info] || "Information" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const { info } = await params;
  if (!titles[info]) notFound();
  const s = await getSettings();
  const text = (
    {
      shipping: s.shippingText,
      returns: s.returnsText,
      warranty: s.warrantyText,
      privacy:
        s.privacyText ||
        "This marketplace is in preview. The store’s final privacy policy must be published before live sales open. If you use the local test version, forms store the information you enter so the requested account, quote, or support workflow can operate. Do not enter sensitive personal information into a preview.",
      terms:
        s.termsText ||
        "This marketplace is in preview. Sample listings, illustrative product images, and example quotes are not offers for live purchases. Final sales, shipping, returns, warranty, and device-buyback terms must be published by Sailan Tech Solutions LLC before the store opens.",
    } as Record<string, string>
  )[info];
  return (
    <div className="wrap info-page page-space">
      <div className="page-head">
        <p className="eyebrow">{info.replace(/-/g, " ").toUpperCase()}</p>
        <h1>{titles[info]}</h1>
      </div>
      {info === "condition-guide" ? (
        <>
          <p className="large-copy">
            Condition should never be a guessing game. Every live listing should
            describe its own cosmetic wear, functionality, battery health, and
            included accessories.
          </p>
          <div className="grading-list">
            {[
              [
                "Brand New",
                "Unused, with packaging and included accessories specified in the listing. Packaging status must be stated.",
              ],
              [
                "Open Box",
                "Packaging has been opened. The listing should disclose any use, testing, marks, or missing original accessories.",
              ],
              [
                "Excellent",
                "Fully functional with minimal visible wear. Review the device photos and the listed battery health.",
              ],
              [
                "Good",
                "Fully functional with visible everyday wear, such as light scratches or small marks.",
              ],
              [
                "Fair",
                "Functional with noticeable cosmetic wear, scratches, or dents. Any exceptions must be specifically disclosed.",
              ],
              [
                "Repair / Parts",
                "Has a disclosed fault or has not passed full functionality checks. Buy only with the stated repair needs and limitations in mind.",
              ],
            ].map(([title, copy], i) => (
              <section key={title}>
                <span>0{i + 1}</span>
                <h2>{title}</h2>
                <p>{copy}</p>
              </section>
            ))}
          </div>
          <div className="notice">
            A cosmetic grade alone does not certify battery capacity, water
            resistance, manufacturer warranty, or carrier compatibility. Check
            the individual listing.
          </div>
        </>
      ) : (
        <article className="policy-copy">
          {text.split("\n").map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </article>
      )}
      <Link href="/support" className="text-link info-support">
        Questions? Ask Sailan Tech <ArrowRight size={17} />
      </Link>
    </div>
  );
}
