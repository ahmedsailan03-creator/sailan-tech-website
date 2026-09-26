import { Cart } from "@/components/marketplace/Cart";
import { getProducts, getSettings } from "@/lib/database";
export const metadata = { title: "Shopping bag" };
export default async function Page() {
  const [p, s] = await Promise.all([getProducts(), getSettings()]);
  return <Cart products={p} settings={s} />;
}
