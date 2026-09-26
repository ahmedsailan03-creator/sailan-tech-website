import { Cart } from "@/components/marketplace/Cart";
import { getProducts, getSettings } from "@/lib/database";
export const metadata = { title: "Checkout" };
export default async function Page() {
  const [p, s] = await Promise.all([getProducts(), getSettings()]);
  return (
    <Cart
      products={p}
      settings={s}
      checkout
      paymentReady={
        s.live &&
        Boolean(process.env.STRIPE_SECRET_KEY) &&
        Boolean(process.env.STRIPE_WEBHOOK_SECRET)
      }
    />
  );
}
