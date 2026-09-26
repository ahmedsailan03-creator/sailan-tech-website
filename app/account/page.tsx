import { Account } from "@/components/marketplace/Account";
import { databaseConfigured, getProducts } from "@/lib/database";
export const metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; checkout?: string; order?: string }>;
}) {
  const [p, s] = await Promise.all([getProducts(), searchParams]);
  return (
    <Account
      products={p}
      configured={databaseConfigured()}
      next={s.next}
      checkoutReturned={s.checkout === "success"}
      checkoutOrderId={s.order}
    />
  );
}
