import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer v4-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <Image
              src="/sailan-logo.png"
              alt="Sailan Tech Solutions"
              width={84}
              height={84}
            />
          </div>
          <div>
            <h3>SAILAN TECH SOLUTIONS LLC</h3>
            <p>
              Business IT support, Microsoft 365, networking, computer
              support, employee onboarding, and web technology for Metro
              Detroit businesses.
            </p>
          </div>
        </div>

        <div className="footer-links">
          <div>
            <strong>Explore</strong>
            <Link href="/services">Services</Link>
            <Link href="/plans">Plans</Link>
            <Link href="/free-it-checkup">Free IT Checkup</Link>
            <Link href="/about">About</Link>
          </div>
          <div>
            <strong>Contact</strong>
            <Link href="/contact">Start by Email</Link>
            <a href="mailto:ahmed@sailantech.com">ahmed@sailantech.com</a>
            <span>Metro Detroit, Michigan</span>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Sailan Tech Solutions LLC.</span>
        <span>Email-first • Calls after interest</span>
      </div>
    </footer>
  );
}
