import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function AboutPage() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="container narrow">
          <p className="kicker">ABOUT SAILAN TECH</p>
          <h1>
            Professional technology support
            <em> without the enterprise headache.</em>
          </h1>
          <p>
            Sailan Tech Solutions is focused on helping businesses keep their
            technology organized, dependable, and ready to support growth.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about-page-grid">
          <Reveal>
            <div className="about-statement">
              <p className="kicker">OUR APPROACH</p>
              <h2>Keep the process simple.</h2>
              <p>
                Businesses should not need an internal IT department just to
                get reliable support. We focus on clear communication,
                practical fixes, and technology that supports the way your
                company actually works.
              </p>
            </div>
          </Reveal>

          <div className="about-values">
            {[
              ["01", "Email first", "We begin with email so there is no pressure and the situation is clear before a call."],
              ["02", "Business focused", "Recommendations are centered on productivity, reliability, and real business needs."],
              ["03", "Clear communication", "We explain what matters without drowning you in unnecessary technical language."],
              ["04", "Built to grow", "Support can expand as your staff, devices, systems, and business needs increase."],
            ].map(([num, title, text]) => (
              <Reveal key={num}>
                <div className="value-card">
                  <span>{num}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section final-cta-section">
        <div className="container">
          <div className="final-cta">
            <p className="kicker">METRO DETROIT</p>
            <h2>Looking for a local IT partner?</h2>
            <p>Start by email and tell us what you need.</p>
            <Link href="/contact" className="primary-button">
              Contact Sailan Tech <b>→</b>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
