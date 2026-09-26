import { QuoteWizard } from "@/components/marketplace/QuoteWizard";
import { getDevices, getPolicy } from "@/lib/database";
export const metadata = { title: "Sell your device | Instant estimate" };
export default async function Page({
  params,
}: {
  params: Promise<{ category?: string[] }>;
}) {
  const [p, models, policy] = await Promise.all([
    params,
    getDevices(),
    getPolicy(),
  ]);
  return (
    <QuoteWizard
      models={models}
      policy={policy}
      initialCategory={p.category?.[0]}
    />
  );
}
