import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";

export default function ContactPage() {
  return (
    <main className="page-main">
      <section className="page-hero compact">
        <div className="container narrow">
          <p className="kicker">CONTACT</p>
          <h1>
            Start with
            <em> an email.</em>
          </h1>
          <p>
            Tell us what your business needs. We will review it first and only
            move to a call when you are interested or when a call clearly makes
            sense.
          </p>
        </div>
      </section>

      <section className="section contact-page-section">
        <div className="container contact-page-grid">
          <Reveal>
            <div className="contact-info-panel">
              <p className="kicker">SAILAN TECH SOLUTIONS</p>
              <h2>Business IT support for Metro Detroit.</h2>
              <p>
                Use the form to explain your issue, project, or support needs.
                The message will open in your email app so you can send it
                directly.
              </p>

              <div className="contact-info-list">
                <div><span>EMAIL</span><a href="mailto:ahmed@sailantech.com">ahmed@sailantech.com</a></div>
                <div><span>PROCESS</span><b>Email first</b></div>
                <div><span>CALLS</span><b>After interest only</b></div>
                <div><span>AREA</span><b>Metro Detroit, Michigan</b></div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
