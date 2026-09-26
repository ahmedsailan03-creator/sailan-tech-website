import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/marketplace/Store";
import { Shell } from "@/components/marketplace/Shell";
import { getProducts, getSettings } from "@/lib/database";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: "Sailan Tech Marketplace | Buy. Sell. Upgrade.",
      template: "%s | Sailan Tech Marketplace",
    },
    description:
      "Shop electronics, explore device conditions, and get an instant estimated offer when you sell to Sailan Tech Solutions LLC.",
    icons: {
      icon: "/brand/sailan-official.png",
      apple: "/brand/sailan-official.png",
    },
    robots: { index: settings.live, follow: settings.live },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, settings] = await Promise.all([
    getProducts(),
    getSettings(),
  ]);
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Shell products={products} live={settings.live}>
            {children}
          </Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
