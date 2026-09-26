const escape = (v: string) =>
  v.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function emailTemplate({
  name,
  title,
  message,
  reference,
  appUrl,
}: {
  name: string;
  title: string;
  message: string;
  reference: string;
  appUrl: string;
}) {
  const origin = new URL(appUrl).origin;
  return `<html><body style="margin:0;background:#f4f5f7;font-family:Arial,sans-serif;color:#17191d"><main style="max-width:560px;margin:40px auto;background:white;padding:36px"><img src="${escape(origin)}/brand/sailan-official.png" width="90" height="90" alt="Sailan Tech Solutions LLC"><h1>${escape(title)}</h1><p>Hello ${escape(name)},</p><p>${escape(message)}</p><p>Reference: <strong>${escape(reference)}</strong></p><a href="${escape(origin)}/account">View your Sailan Tech account</a><p style="font-size:12px;color:#777">Sailan Tech Solutions LLC. Estimated offers are subject to inspection.</p></main></body></html>`;
}
// Mail is deliberately not auto-sent. Connect a verified sender/provider and an
// idempotent outbox before enabling transactional delivery in a live store.
export interface MailProvider {
  send(input: {
    to: string;
    subject: string;
    html: string;
    idempotencyKey: string;
  }): Promise<{ id: string }>;
}
export interface PayoutProvider {
  create(input: {
    quoteId: string;
    amountCents: number;
    currency: "usd";
    recipientToken: string;
    idempotencyKey: string;
  }): Promise<{ id: string; status: "processing" | "paid" | "failed" }>;
}
