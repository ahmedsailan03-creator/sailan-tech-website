# Sailan Tech Marketplace

The authoritative requirements are in `docs/marketplace-brief.txt`. The user explicitly authorized building, testing, committing, and deploying without stopping at planning. This spec records implementation decisions, rather than adding another approval gate.

## Experience
An original, restrained electronics marketplace with white, charcoal, and light gray surfaces; blue accents; large product imagery; responsive navigation. The exact supplied PNG is immutable and shared by navigation, mobile menu, footer, account, checkout, admin, favicon, and transactional email templates. Its SHA-256 is f3338298a184b2a234b98d9d8554448413ee3f32a90283c9457d47810310f140.

## Architecture
Next.js App Router, React, TypeScript, Tailwind-compatible CSS, and libSQL. Local development uses a durable SQLite file; Vercel uses a configured Turso/libSQL database over HTTPS. Production never silently stores business records on ephemeral disk. Schema initialization is explicit. Database-backed sessions use cryptographically random tokens stored hashed, scrypt passwords, server-side roles, origin checks, and persisted rate limits. Admin creation is an operator CLI action, never public registration.

Commerce stores money as integer cents, validates inventory and prices on the server, reserves inventory transactionally, and confirms payment only from signed Stripe events. Stripe Checkout supports configured wallets; PayPal is a provider boundary, not a fake button. Missing live configuration keeps purchases disabled. Sample catalog records and illustrative images are identified as such and cannot be charged.

Quotes are computed server-side from editable device prices and policies. Activation-locked devices are declined; uncertain locks, unsupported models, and liquid damage require review. Accepted quotes retain a price/policy snapshot. Customer and admin status transitions enforce ownership and permitted transitions. Inspection revisions require a reason and explicit customer acceptance. Payout records track manual/provider activity and do not initiate banking transfers.

Customer accounts expose orders, quotes, revised offers, saved products, addresses, profile, and support requests. Admin manages product variants as distinct SKUs, inventory, pricing, quotes, inspections, manual payout records, service requests, customers, discounts, and store settings. Sensitive device identifiers and cost fields never enter public product responses. Images and resale certificates use validated, authenticated upload endpoints.

## Launch boundaries
No company history, inventory, reviews, delivery times, return periods, warranty promises, or banking transfers are invented. Policy pages use configurable business terms, with honest pre-launch states until approved. Real inventory, pricing approval, fulfillment policies, a persistent production database, payment credentials, and an admin owner must be configured before accepting live transactions. Email templates exist; actual mail delivery requires a provider. Preview deployment does not replace the existing production business site.

## Verification
Unit tests cover quote deductions/eligibility/caps, price validation, ownership/status transitions, and password verification. Database integration checks cover accounts, persistent quotes, inventory reservations, review ownership, and admin access. Browser checks cover desktop/mobile storefront, navigation, search, product/cart, seven-stage quotes, accounts, repairs, wholesale, and admin. Build and type checking are required. Provider-dependent payment execution remains unverified until credentials exist.
