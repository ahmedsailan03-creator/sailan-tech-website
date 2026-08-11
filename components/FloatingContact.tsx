"use client";

import Image from "next/image";

export default function FloatingContact() {
  return (
    <div className="floating-contact" aria-label="Contact Sailan Tech">
      <a
        href="mailto:ahmed@sailantech.com"
        className="floating-contact-button"
        aria-label="Email Sailan Tech"
        title="Email Sailan Tech"
      >
        <span className="floating-contact-icon">
          <Image
            src="/contact-icons/email.png"
            alt="Email"
            width={22}
            height={22}
          />
        </span>
        <span className="floating-contact-label">Email</span>
      </a>

      <a
        href="tel:+13138014941"
        className="floating-contact-button"
        aria-label="Call Sailan Tech"
        title="Call 313-801-4941"
      >
        <span className="floating-contact-icon">
          <Image
            src="/contact-icons/phone.png"
            alt="Phone"
            width={22}
            height={22}
          />
        </span>
        <span className="floating-contact-label">Call</span>
      </a>

      <a
        href="https://wa.me/13138014941"
        target="_blank"
        rel="noreferrer"
        className="floating-contact-button whatsapp"
        aria-label="WhatsApp Sailan Tech"
        title="WhatsApp Sailan Tech"
      >
        <span className="floating-contact-icon">
          <Image
            src="/contact-icons/whatsapp.png"
            alt="WhatsApp"
            width={22}
            height={22}
          />
        </span>
        <span className="floating-contact-label">WhatsApp</span>
      </a>
    </div>
  );
}
