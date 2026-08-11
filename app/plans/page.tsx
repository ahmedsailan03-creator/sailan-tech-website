import PlanSwitcher from "@/components/PlanSwitcher";
import Reveal from "@/components/Reveal";
import Link from "next/link";

export default function PlansPage() {
  return (
    <main className="page-main v4-plans-page">
      <section className="page-hero v4-page-hero">
        <div className="container narrow">
          <p className="kicker">PLANS & PRICING</p>
          <h1>
            Clear starting points
            <em> for growing businesses.</em>
          </h1>
          <p>
            Monthly IT support plans and website packages designed to give
            businesses a clear place to start. Exact pricing can change based
            on scope, users, devices, and support needs.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <PlanSwitcher />
          </Reveal>
        </div>
      </section>

      <section className="section v4-additional-services">
        <div className="container">
          <Reveal>
            <div className="v4-additional-heading">
              <p className="kicker">OTHER SERVICES</p>
              <h2>Need something outside a monthly plan?</h2>
            </div>
          </Reveal>

          <div className="v4-additional-grid">
            {[
              ["Computer diagnosis", "$40–$60"],
              ["Virus / software cleanup", "$75–$150"],
              ["Windows installation", "$100–$175"],
              ["SSD installation & setup", "$100–$200 + parts"],
              ["Data transfer", "$75–$175"],
              ["Printer setup", "$60–$125"],
              ["Wi-Fi setup", "$100–$250"],
              ["On-site support", "$75–$125 / hour"],
            ].map(([service, price]) => (
              <Reveal key={service}>
                <div className="v4-additional-card">
                  <span>{service}</span>
                  <strong>{price}</strong>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="v4-additional-cta">
            <p>
              Don&apos;t see what you need? Send the details by email and get a
              custom quote.
            </p>
            <Link href="/contact" className="primary-button">
              Request a Quote <b>→</b>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
