import { Shop } from "@/components/marketplace/Shop";
import { getProducts } from "@/lib/database";
export const metadata = { title: "Shop electronics" };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ category?: string[] }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [p, s, products] = await Promise.all([
    params,
    searchParams,
    getProducts(),
  ]);
  return (
    <Shop
      products={products}
      category={p.category?.[0] || ""}
      initialQuery={s.q || ""}
    />
  );
}
