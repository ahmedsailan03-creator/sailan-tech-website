import Image from "next/image";
import Link from "next/link";
import ServicePlanSignup from "@/components/ServicePlanSignup";

const trustItems = [
  {
    title: "FAST RESPONSE",
    text: "Real people. Real support.",
  },
  {
    title: "SECURE BY DESIGN",
    text: "Your business stays protected.",
  },
  {
    title: "MODERN WORKPLACES",
    text: "Microsoft 365 & cloud support.",
  },
  {
    title: "RELIABLE & LOCAL",
    text: "Built for Metro Detroit businesses.",
  },
];

const services = [
  {
    number: "01",
    title: "IT SUPPORT",
    text: "Fast, expert help for your everyday business technology.",
    image: "/concept/service-it-support.png",
  },
  {
    number: "02",
    title: "MICROSOFT 365",
    text: "Email, Teams, OneDrive, setup, training, and support.",
    image: "/concept/service-m365.png",
  },
  {
    number: "03",
    title: "NETWORK & WI-FI",
    text: "Reliable office networks, better connectivity, and fewer problems.",
    image: "/concept/service-network.png",
  },
  {
    number: "04",
    title: "EMPLOYEE ONBOARDING",
    text: "Accounts, email, devices, and permissions set up properly.",
    image: "/concept/service-onboarding.png",
  },
  {
    number: "05",
    title: "WEBSITE DEVELOPMENT",
    text: "Modern business websites designed to help you grow online.",
    image: "/concept/service-web.png",
  },
  {
    number: "06",
    title: "COMPUTER SOLUTIONS",
    text: "Setups, upgrades, repairs, and long-term support for your systems.",
    image: "/concept/service-computer.png",
  },
];

const process = [
  {
    step: "01",
    title: "Start by email",
    text: "You send the business details, problem, or project so we understand the need first.",
  },
  {
    step: "02",
    title: "We review the fit",
    text: "We look at the support request, website project, or technology goals and respond clearly.",
  },
  {
    step: "03",
    title: "Call after interest",
    text: "Once there is a real fit, we move to a call or visit and discuss the best next step.",
  },
];

export default function Home() {
  return (
    <main className="concept-home">
      <section className="concept-hero">
        <div className="concept-grid-overlay" />

        <div className="container concept-hero-grid">
          <div className="concept-copy">
            <p className="concept-kicker">SMART TECHNOLOGY. STRONGER BUSINESS.</p>

            <h1 className="concept-title">
              <span className="light">PREMIUM IT SUPPORT.</span>
              <span className="gold">MODERN DIGITAL SOLUTIONS.</span>
            </h1>

            <p className="concept-lead">
              Sailan Tech Solutions LLC delivers secure, reliable, and modern IT
              support for businesses of every size. From Microsoft 365 and
              networking to websites and employee onboarding, we keep your
              technology running so you can focus on growth.
            </p>

            <div className="concept-cta-row">
              <Link href="/free-it-checkup" className="concept-primary-button">
                Get a Free Checkup <b>→</b>
              </Link>

              <Link href="/about" className="concept-story-link">
                <span className="play-ring">
                  <i>▶</i>
                </span>
                <span>
                  <strong>Watch Our Story</strong>
                  <small>Why businesses trust us</small>
                </span>
              </Link>
            </div>

            <div className="concept-trust-grid">
              {trustItems.map((item) => (
                <div className="concept-trust-item" key={item.title}>
                  <span className="concept-trust-icon">✦</span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="concept-visual">
            <div className="concept-visual-frame">
              <div className="concept-visual-glow concept-visual-glow-a" />
              <div className="concept-visual-glow concept-visual-glow-b" />
              <Image
                src="/concept/hero-scene.png"
                alt="Sailan Tech premium IT support hero scene"
                width={960}
                height={518}
                className="concept-hero-image"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="concept-services">
        <div className="container">
          <div className="concept-section-head">
            <p className="concept-kicker center">WHAT WE DO</p>
            <h2>SOLUTIONS THAT POWER MODERN BUSINESS</h2>
            <p>
              Comprehensive IT services designed to keep your business secure,
              productive, and future-ready.
            </p>
          </div>

          <div className="concept-card-grid">
            {services.map((service) => (
              <article className="concept-service-card" key={service.title}>
                <div className="concept-service-image-wrap">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={280}
                    height={132}
                    className="concept-service-image"
                  />
                </div>

                <div className="concept-service-content">
                  <span className="concept-service-number">{service.number}</span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <Link href="/services" className="concept-service-link">
                    Learn More <b>→</b>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="concept-signup-section" id="signup">
        <div className="container">
          <ServicePlanSignup />
        </div>
      </section>

      <section id="process" className="concept-process">
        <div className="container">
          <div className="concept-process-head">
            <p className="concept-kicker center">HOW IT WORKS</p>
            <h2>EMAIL-FIRST OUTREACH. CALLS ONLY AFTER INTEREST.</h2>
            <p>
              A cleaner sales process that respects your time and the client&apos;s time.
            </p>
          </div>

          <div className="concept-process-grid">
            {process.map((item) => (
              <article className="concept-process-card" key={item.step}>
                <span className="concept-process-step">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="concept-bottom-cta">
            <div>
              <p className="concept-kicker">READY TO START?</p>
              <h3>Let&apos;s build your business technology the right way.</h3>
            </div>

            <div className="concept-bottom-actions">
              <Link href="/contact" className="concept-primary-button">
                Contact Sailan Tech <b>→</b>
              </Link>
              <Link href="/plans" className="concept-secondary-button">
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
