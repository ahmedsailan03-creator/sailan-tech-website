# Sailan Tech Marketplace Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. User has authorized implementation without further planning approval.

**Goal:** Build the complete branded buy/sell application and a reviewable Vercel preview.

**Architecture:** Next.js pages share a single brand component and storefront shell. Server APIs use validated domain services and libSQL transactions. Deployment is fail-closed without production database/payment configuration.

**Tech Stack:** Next.js 16.3, React 19.2, TypeScript, libSQL, Zod, Stripe, Node test runner.

**Spec:** docs/superpowers/specs/2026-09-26-marketplace-design.md

## Global Constraints
- Preserve supplied logo bytes; never substitute or regenerate the logo.
- Integer cents; server-authoritative prices; no fake reviews or transactions.
- Admin routes require server-side admin role; customer data is scoped by owner.
- Existing live website is preserved by publishing a preview branch.

## Review Focus
- Tampered quote inputs, invalid device/brand pairings, or activation locks must never yield an acceptable purchase offer.
- Concurrent checkout attempts must not oversell inventory or fulfill twice.
- Cross-user references and direct admin API calls must not reveal or modify protected data.
- Missing provider configuration and sample inventory must never look like completed transactions.
- Mobile forms, modals, and empty states must be usable with keyboard and touch.

### Task 1: Domain and persistence
Files: lib/types.ts, lib/catalog.ts, lib/quote.ts, lib/database.ts, lib/auth.ts, lib/validation.ts, tests/domain.test.ts, tests/database.test.ts, scripts/setup.ts.
Interfaces: Product, DeviceModel, PricingPolicy, QuoteInput, calculateQuote(input, model, policy), getDb(), currentUser(), requireUser().
- [x] Add failing quote tests for lock, deduction, cap, and no-power behavior; run `npm test`.
- [x] Implement domain and durable schema with explicit initialization; add database authorization and reservation tests.
- [x] Run `npm test`; commit the domain foundation.

### Task 2: Branded storefront and service flows
Files: app/layout.tsx, app/page.tsx, app/globals.css, components/marketplace/*, app/shop/[[...category]]/page.tsx, app/product/[slug]/page.tsx, app/sell/[[...category]]/page.tsx, app/cart/page.tsx, app/checkout/page.tsx, app/[information]/page.tsx.
Interfaces: Shared Brand, ProductCard, StoreProvider; catalog API; quote API; persistent service-request API.
- [x] Implement navigation, search, homepage, filters, product variants/gallery, cart, grading, repairs, wholesale, and support.
- [x] Implement seven-stage quote flow using server-side estimates and persisted acceptance.
- [x] Verify storefront, service forms, and responsive layouts in browser; run type check.

### Task 3: Accounts, administration, and commerce
Files: app/account/page.tsx, app/admin/page.tsx, components/marketplace/Account.tsx, components/marketplace/Admin.tsx, app/api/[...path]/route.ts, lib/commerce.ts, lib/services.ts, lib/email.ts.
Interfaces: Auth APIs, owner-scoped account API, role-gated admin CRUD, signed Stripe webhook, immutable audit log.
- [x] Add tests for unauthorized access, owner scoping, revision acceptance, and atomic inventory changes.
- [x] Implement account profile/address/favorites/orders, admin products/prices/quotes/inspections/payouts/service requests, and uploads.
- [x] Implement checkout reservation/session/webhook with server prices, idempotency, and configuration gates.
- [x] Run full tests and browser account/admin checks.

### Task 4: Delivery
Files: README.md, .env.example, docs/launch.md, tests/verification-report.md.
- [x] Run tests, type check, production build, desktop/mobile browser checks, and independent review.
- [x] Fix material findings; commit and push branch; deploy Vercel preview and verify terminal status.
- [x] Document precise launch dependencies and report working features without claiming live payment verification.

## Verification notes

See `docs/verification.md` for evidence and limitations. Account/admin protected browser sessions were replaced by isolated real-HTTP integration checks because browser credential entry requires the user. Physical-device and live-provider checks remain launch prerequisites. Preview publication status is recorded in the delivery response.
