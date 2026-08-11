import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import FloatingContact from "@/components/FloatingContact";

export const metadata: Metadata = {
  title: {
    default: "Sailan Tech Solutions | Business IT Support",
    template: "%s | Sailan Tech Solutions",
  },
  description:
    "Business IT support, Microsoft 365, networking, device support, website development, and technology services for Metro Detroit businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BackgroundFX />
        <Header />
        {children}
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
