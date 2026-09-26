# Verification record

Checked 2026-09-26 against `marketplace-brief.txt`.

- The original logo and `public/brand/sailan-official.png` have identical SHA-256: `f3338298a184b2a234b98d9d8554448413ee3f32a90283c9457d47810310f140`. The uploaded GitHub blob also matches the local Git object SHA. Full asset appears in navigation, mobile menu, footer, account, checkout, admin, icon metadata and email template.
- 31 domain, security and database tests passed. Coverage includes activation locks, unsupported specifications/accessories, deductions/caps, passwords, role/owner enforcement, server prices, atomic reservations, duplicate events, payment validation, cart cleanup, mixed paid/expired reservations and stale admin edits, and resuming an order after a missed paid webhook.
- The isolated production-server HTTP integration suite passed all 9 workflow scenarios (10 reported tests including the suite). It creates a disposable database and generated test credentials, then verifies registration/login/logout, admin role rejection, price-change detection, cross-customer isolation, inspection/revised-offer acceptance, blocked sample payouts, addresses/favorites, repair/wholesale requests, private certificates, product CRUD/private-field projection, review eligibility, origin checks and live-payment gates. The fixture is removed after completion.
- Next.js production build and TypeScript checks passed. Pages that read inventory/prices/settings render dynamically.
- Desktop browser checks: homepage/navigation; multi-term search (`512GB unlocked`); shop storage filter; product variants/details; add to bag; subtotal/shipping; checkout configuration gate; full seven-step device estimate; repair submission and reference; wholesale form; public account/admin entry points. No real customer or payment data was used.
- The seven-step iPhone flow returned **$514** from sample base $520, configuration +$40, light wear -$56 and accessories +$10. Sample-pricing and final-inspection notices were visible.
- Mobile checks used a 390px embedded viewport (375px content width after the scrollbar): menu, shop filters, product navigation, add to bag and quote category/brand steps. The document scroll width matched its client width on homepage, shop, product and quote views. No horizontal page overflow was observed. The temporary same-origin development-only frame setting and test harness were removed. Production framing protection remains `DENY`.
- Repair form submission produced a persisted `ST-HELP` reference. That local QA request was then removed. HTTP checks separately verified wholesale storage and certificate ownership.
- Browser console review found extension-origin diagnostics, with no site application errors observed.
- Independent code review found four checkout/inventory issues. Fixed with optimistic product revisions, consistent expiry availability, owner-scoped resume checkout, and verified payment confirmation/cart cleanup. Regression tests reproduce and cover the two stock failures.

## Limits

No payment credentials or persistent production database were supplied. Real Stripe charges, wallets, tax settings, refunds, email delivery and banking transfers are not tested or claimed. Browser credential policy prevented automated entry into protected customer/admin sessions; their mutations and access controls were tested through real HTTP requests instead. Mobile checks were responsive browser views, not tests on physical iOS/Android devices.

See `launch.md` for precise remaining activation steps. The published branch preview is intentionally closed to live transactions.
