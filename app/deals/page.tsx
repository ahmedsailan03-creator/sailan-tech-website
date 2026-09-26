import { Shop } from "@/components/marketplace/Shop";
import { getProducts } from "@/lib/database";
export const metadata = { title: "Deals and open box" };
export default async function Page() {
  return <Shop products={await getProducts()} category="deals" deals />;
}
