import { ServicePage } from "@/components/marketplace/ServiceForm";
export const metadata = { title: "Support" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return (
    <ServicePage kind={type === "manual-quote" ? "manual-quote" : "support"} />
  );
}
