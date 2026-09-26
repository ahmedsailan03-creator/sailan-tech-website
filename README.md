# Sailan Tech Marketplace

A branded electronics marketplace for Sailan Tech Solutions LLC, built with Next.js, React, TypeScript, libSQL and Stripe Checkout. The uploaded official logo is used without modification.

## Run locally

```sh
npm ci
npm run db:setup
npm run dev
```

Open the address printed by the development server. Sample catalog records are labeled and cannot be purchased. SQLite persists in `data/marketplace.db` (gitignored). Environment names are documented in `.env.example`; Node does not automatically load that file for the setup scripts, so supply the variables through your shell or environment manager.

Create the owner account using `npm run admin:create` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` supplied securely in the environment. No default login exists.

## Included

- Responsive storefront, category/specification filters, search overlay, product variants/gallery, condition guide, favorites and persistent cart.
- Seven-stage device quotation with editable model prices, configuration options, deductions, caps, inspection/revised offers and customer tracking.
- Customer accounts, orders, addresses, profile, support, repairs and wholesale applications with private certificate uploads.
- Server-protected admin products, inventory, photos, prices, quotes, inspections, external payment records, requests, customers, promos and store policies.
- Server-priced stock reservations, Stripe-hosted checkout integration and signed, idempotent payment webhooks.
- Real database schema, validation, rate limiting, hashed sessions, salted passwords, origin checks and audit records.

## Verify

```sh
npm test
npm run typecheck
npm run build
npm run test:integration
```

See [launch configuration](docs/launch.md) for production database/payment setup and precise integration limits. See [verification](docs/verification.md) for actual checks. The branch preview preserves the existing production website until the owner chooses to promote the marketplace.

The full build brief is in `docs/marketplace-brief.txt`; design and implementation decisions are in `docs/superpowers/`. Generic showcase renders are illustrative sample artwork, with provenance in `docs/showcase-provenance.json`.
