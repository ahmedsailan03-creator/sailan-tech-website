import CheckupForm from "@/components/CheckupForm";
import Reveal from "@/components/Reveal";

export default function FreeITCheckupPage() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="container narrow">
          <p className="kicker">FREE BUSINESS IT CHECKUP</p>
          <h1>
            See what may be holding
            <em> your technology back.</em>
          </h1>
          <p>
            A simple review of your current setup so you can spot avoidable
            problems, weak organization, or areas that deserve attention.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container checkup-page-grid">
          <Reveal>
            <div>
              <p className="kicker">WHAT WE REVIEW</p>
              <h2 className="subpage-title">
                A practical look at the basics.
              </h2>

              <div className="audit-list">
                {[
                  ["01", "Microsoft 365", "Email, user accounts, permissions, Teams, OneDrive, and general organization."],
                  ["02", "Employee setup", "How easily new users get accounts, devices, applications, and access."],
                  ["03", "Computers & devices", "Common issues, setup consistency, and obvious pain points."],
                  ["04", "Network & Wi-Fi", "Basic connectivity, reliability, and office network concerns."],
                  ["05", "Backups & security basics", "A high-level look at whether basic protections are in place."],
                  ["06", "Website & digital presence", "How professional and useful your business appears online."],
                ].map(([num, title, text]) => (
                  <div className="audit-item" key={num}>
                    <span>{num}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="sticky-form">
              <CheckupForm />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
