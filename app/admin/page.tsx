import Link from "next/link";
import { Admin } from "@/components/marketplace/Admin";
import { AuthCard } from "@/components/marketplace/Account";
import { currentUser } from "@/lib/auth";
import { databaseConfigured } from "@/lib/database";
export const metadata = {
  title: "Store administration",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await currentUser();
  if (!user) return <AuthCard admin configured={databaseConfigured()} />;
  if (user.role !== "admin")
    return (
      <div className="wrap section">
        <div className="empty-state">
          <h1>Administrator access required.</h1>
          <p>This account does not have store management permissions.</p>
          <Link href="/account" className="button outline">
            Return to your account
          </Link>
        </div>
      </div>
    );
  return <Admin />;
}
