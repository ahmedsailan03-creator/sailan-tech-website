"use client";

import { FormEvent } from "react";

export default function ContactForm() {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") || "");
    const company = String(data.get("company") || "");
    const email = String(data.get("email") || "");
    const service = String(data.get("service") || "");
    const message = String(data.get("message") || "");

    const subject = encodeURIComponent(
      `Website IT Support Inquiry${company ? ` - ${company}` : ""}`
    );

    const body = encodeURIComponent(
`Name: ${name}
Company: ${company}
Email: ${email}
Service: ${service}

Message:
${message}`
    );

    window.location.href =
      `mailto:ahmed@sailantech.com?subject=${subject}&body=${body}`;
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="form-grid-2">
        <label>
          <span>Your name</span>
          <input name="name" required placeholder="John Smith" />
        </label>
        <label>
          <span>Company</span>
          <input name="company" placeholder="Company name" />
        </label>
      </div>

      <label>
        <span>Business email</span>
        <input
          name="email"
          type="email"
          required
          placeholder="john@company.com"
        />
      </label>

      <label>
        <span>What do you need help with?</span>
        <select name="service" defaultValue="Business IT Support">
          <option>Business IT Support</option>
          <option>Microsoft 365</option>
          <option>Network & Wi-Fi</option>
          <option>Employee Onboarding</option>
          <option>Computer / Device Support</option>
          <option>Website Development</option>
          <option>Other</option>
        </select>
      </label>

      <label>
        <span>Tell us what is going on</span>
        <textarea
          name="message"
          rows={7}
          required
          placeholder="Describe the issue, project, or support you need..."
        />
      </label>

      <button className="primary-button wide" type="submit">
        Start by Email <b>→</b>
      </button>
      <p className="form-small">
        We start by email. A call is only scheduled after there is interest or
        when it is clearly the best next step.
      </p>
    </form>
  );
}
