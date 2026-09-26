import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap section">
      <div className="empty-state">
        <p className="eyebrow">404</p>
        <h1>This page has moved on.</h1>
        <p>Let’s get you back to the collection.</p>
        <Link href="/shop" className="button blue">
          Explore the shop
        </Link>
      </div>
    </div>
  );
}
