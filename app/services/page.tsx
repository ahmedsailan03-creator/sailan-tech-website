import Link from "next/link";
import Reveal from "@/components/Reveal";
import ServiceIcon from "@/components/ServiceIcon";

const items = [
  {
    icon: "support" as const,
    title: "Business IT Support",
    text: "Day-to-day support for the technology your staff depends on.",
    bullets: ["Remote troubleshooting", "On-site support when needed", "Printer & software issues", "General IT problem solving"],
  },
  {
    icon: "m365" as const,
    title: "Microsoft 365",
    text: "Setup and support for the Microsoft tools your business uses every day.",
    bullets: ["Business email", "Outlook & Teams", "OneDrive", "Users, licensing & permissions"],
  },
  {
    icon: "network" as const,
    title: "Network & Wi-Fi",
    text: "Reliable office connectivity for employees, devices, and business systems.",
    bullets: ["Wi-Fi troubleshooting", "Device connectivity", "Network setup", "Performance improvements"],
  },
  {
    icon: "onboarding" as const,
    title: "Employee Onboarding",
    text: "A cleaner process for getting new employees ready to work.",
    bullets: ["Account creation", "Computer setup", "Application access", "Permissions & email"],
  },
  {
    icon: "devices" as const,
    title: "Computer & Device Support",
    text: "Support for the computers and hardware your business relies on.",
    bullets: ["Computer setup", "Software installation", "Troubleshooting", "Upgrades & maintenance"],
  },
  {
    icon: "web" as const,
    title: "Website Development",
    text: "Professional websites that strengthen how your company looks online.",
    bullets: ["Responsive design", "Fast modern builds", "Lead-focused layouts", "Business branding"],
  },
];

export default function ServicesPage() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="container narrow">
          <p className="kicker">SERVICES</p>
          <h1>
            Business technology that
            <em> works like it should.</em>
          </h1>
          <p>
            Practical IT support for small and growing businesses across Metro
            Detroit — with an email-first process and no random cold calls.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container detailed-services">
          {items.map((item, index) => (
            <Reveal key={item.title}>
              <article className="detail-service-card">
                <div className="detail-service-icon">
                  <ServiceIcon type={item.icon} />
                </div>
                <div className="detail-service-copy">
                  <span>0{index + 1}</span>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                  <ul>
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>✓ {bullet}</li>
                    ))}
                  </ul>
                  <Link href="/contact" className="card-link">
                    Ask about this service <b>→</b>
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section mini-cta-section">
        <div className="container mini-cta">
          <div>
            <p className="kicker">NOT SURE WHAT YOU NEED?</p>
            <h2>Start with the free IT checkup.</h2>
          </div>
          <Link href="/free-it-checkup" className="primary-button">
            Free IT Checkup <b>→</b>
          </Link>
        </div>
      </section>
    </main>
  );
}
