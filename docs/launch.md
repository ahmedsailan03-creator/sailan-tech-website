# Launch configuration

The repository runs locally with persistent SQLite storage. A Vercel deployment without a production database deliberately exposes a read-only sample storefront: no signups, submissions, sales, or seller payouts. Sample products cannot be purchased even if sales are enabled.

## Database and owner account

1. Create a Turso/libSQL production database in your chosen region. Configure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` through protected environment settings. Use separate databases for preview and production.
2. Run `npm run db:setup` with those environment variables loaded. Initialization is additive; it never drops tables or replaces existing business prices. Seeded products and purchase prices are examples.
3. Run `npm run admin:create` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` provided through the local environment. There are no default credentials and public registration always creates a customer. Remove these bootstrap variables after use. Passwords require at least 12 characters and are stored as salted scrypt hashes.
4. Sign in at `/account`, then open `/admin`. Set approved support contacts, shipping, returns, warranty, privacy, store terms, and device handoff instructions. Use actual business policies; sample copy makes no delivery or coverage guarantees.
5. Add real inventory with uploaded device photographs, real quantities and prices. Sample images are illustrative. Admin uploads accept JPEG/PNG/WebP; resale certificates also accept PDF. Files are limited to 4 MB and stored durably in the database. Certificates require owner or admin authentication.
6. Replace device purchase prices and global adjustments with approved business prices. Set allowed CPU/RAM/GPU values for each computer model; values must match the adjustment table. Unsupported configurations route to manual review. Approve the price policy before offering live purchase estimates.

## Checkout

Set `APP_URL` to the canonical HTTPS storefront origin, `STRIPE_SECRET_KEY` to a secret key, and `STRIPE_WEBHOOK_SECRET` to the signing secret for `/api/webhooks/stripe`. Subscribe to `checkout.session.completed` and `checkout.session.expired`. Use test-mode credentials and test orders before enabling live mode. Do not use production credentials in previews.

Stripe-hosted Checkout collects US shipping details and card payments. Apple Pay and Google Pay appear when enabled and eligible in the merchant account/browser. Configure Stripe Tax and set `STRIPE_AUTOMATIC_TAX=true` if appropriate for the business; the operator must approve its tax setup. PayPal checkout is not implemented; it needs a separate checkout provider adapter. No PayPal button falsely claims it is connected.

Orders reserve stock in a write transaction using server-side prices. Checkout requests persist their exact provider payload and reuse an idempotency key. Signed webhooks validate order, session, currency, subtotal and shipping before marking an order paid. Duplicate and out-of-order events do not decrement or release inventory twice.

If a webhook or network request fails, use **Orders → Reconcile**. This retrieves the provider state and can find an unlinked session by order reference. Unlinked reservations are released only after an exhaustive provider check and at least one hour beyond expiry. Large result sets require an operator to investigate rather than guessing payment status. Reconciliation also runs on a customer's expired pending orders when they retry checkout. Monitor pending orders and webhook failures operationally; no background scheduler is configured. Customers can resume a pending checkout from Orders. A payment return displays confirmation only after the owner-scoped order is paid and then removes its purchased quantities from the cart.

Enable live sales in **Store settings** only after this configuration and end-to-end provider testing. The server refuses enabling sales without payment setup, a canonical origin, support email, privacy policy and terms. Approved pricing is independently required for real seller offers. Payment credentials were not available during implementation, so actual payments, refunds and wallet presentation remain unverified.

## Quotes and payouts

Estimates are calculated on the server in integer cents, with configuration, cosmetic, repair and accessory adjustments plus maximum/margin caps. The accepted quote snapshots the policy and customer details. Activation locks are declined; uncertain lock/liquid-damage/unsupported configurations require manual review.

After inspection, publish an explanation and revised amount. The customer must accept or decline in their account. Admins cannot advance a revised offer on the customer's behalf. Payout controls record a completed payment made externally through an approved provider. They do not transfer funds. Sample quotes cannot be recorded as paid.

`lib/email.ts` contains the exact-logo email template and mail/payout provider interfaces. Email delivery and automatic payout providers are intentionally unconnected. Requests and revised offers appear in the customer account and admin dashboard; no screen claims an email or bank transfer was sent.

## Operations

- Keep database backups, restrict production credentials, and monitor Vercel and Stripe errors.
- Authentication uses seven-day database sessions, HttpOnly cookies, same-site policy, origin checks and persisted rate limits. Enable deployment protection for previews. There is no password-reset or email-verification provider yet; add these before broad public account onboarding.
- Product archiving is reversible by saving the product again. Active checkout stock cannot be edited or archived. An optimistic revision check rejects editors opened before any subsequent inventory change. Fulfilled order data and payment audit records are retained.
- Site rendering is dynamic so inventory, price and policy edits appear without a rebuild. Preview robots are `noindex`; live settings enable indexing. Account/admin routes remain `noindex`.
- Do not expose raw device identifiers, supplier details or acquisition costs in public listings. Public catalog projection strips these fields.

## Verification commands

```sh
npm ci
npm run db:setup
npm test
npm run typecheck
npm run build
npm run test:integration
```

See `docs/verification.md` for the tested scope and remaining provider-dependent checks.
