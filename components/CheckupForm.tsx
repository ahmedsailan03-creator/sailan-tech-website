"use client";

import { FormEvent } from "react";

const checks = [
  "Microsoft 365 / email",
  "Employee accounts & permissions",
  "Computers & devices",
  "Wi-Fi / network",
  "Backups",
  "Basic security setup",
  "Website / digital presence",
  "General IT organization",
];

export default function CheckupForm() {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const selected = checks.filter((item) => data.get(item) === "on");

    const body = encodeURIComponent(
`Free Business IT Checkup Request

Name: ${String(data.get("name") || "")}
Company: ${String(data.get("company") || "")}
Email: ${String(data.get("email") || "")}
Employees: ${String(data.get("employees") || "")}

Areas they want reviewed:
${selected.map((x) => `- ${x}`).join("\n") || "- General review"}

Notes:
${String(data.get("notes") || "")}`
    );

    window.location.href =
      `mailto:ahmed@sailantech.com?subject=${encodeURIComponent(
        "Free Business IT Checkup Request"
      )}&body=${body}`;
  }

  return (
    <form className="form-card checkup-form" onSubmit={submit}>
      <div className="form-grid-2">
        <label>
          <span>Your name</span>
          <input name="name" required placeholder="John Smith" />
        </label>
        <label>
          <span>Company</span>
          <input name="company" required placeholder="Company name" />
        </label>
      </div>

      <div className="form-grid-2">
        <label>
          <span>Business email</span>
          <input name="email" type="email" required placeholder="john@company.com" />
        </label>
        <label>
          <span>Approx. employees</span>
          <select name="employees" defaultValue="1-10">
            <option>1-10</option>
            <option>11-25</option>
            <option>26-50</option>
            <option>51-100</option>
            <option>100+</option>
          </select>
        </label>
      </div>

      <div>
        <span className="field-title">What should we look at?</span>
        <div className="check-grid">
          {checks.map((item) => (
            <label className="check-item" key={item}>
              <input type="checkbox" name={item} />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <label>
        <span>Anything we should know?</span>
        <textarea
          name="notes"
          rows={6}
          placeholder="Recurring issues, upcoming changes, concerns, or anything else..."
        />
      </label>

      <button className="primary-button wide" type="submit">
        Request My Free IT Checkup <b>→</b>
      </button>
    </form>
  );
}
