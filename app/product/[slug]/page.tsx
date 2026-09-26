import { notFound } from "next/navigation";
import { getProducts, getSettings } from "@/lib/database";
import { ProductDetail } from "@/components/marketplace/ProductDetail";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = (await getProducts()).find((x) => x.slug === slug);
  return { title: p?.title || "Device not found", description: p?.description };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, products, settings] = await Promise.all([
    params,
    getProducts(),
    getSettings(),
  ]);
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  const json = p.sample
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.title,
        description: p.description,
        sku: p.sku,
        brand: { "@type": "Brand", name: p.brand },
        offers: {
          "@type": "Offer",
          price: (p.price / 100).toFixed(2),
          priceCurrency: "USD",
          availability:
            p.quantity > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      };
  return (
    <>
      {json && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(json).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ProductDetail product={p} products={products} settings={settings} />
    </>
  );
}
