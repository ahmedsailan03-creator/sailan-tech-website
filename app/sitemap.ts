import type { MetadataRoute } from "next";
const base = "https://sailan-tech-website.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Array<[string,number, "monthly" | "weekly" | "yearly"]> = [
    ["/",1,"weekly"],["/services",0.8,"monthly"],["/plans",0.7,"monthly"],
    ["/contact",0.6,"monthly"],["/about",0.4,"yearly"],
    ["/free-it-checkup",0.7,"monthly"],
    ["/tools/resale-calculator",0.9,"monthly"],
    ["/resale-lab-pro",0.8,"monthly"],
    ["/remote-it-help",0.8,"weekly"]
  ];
  return entries.map(([path,priority,changeFrequency])=>({
    url: base+path, priority, changeFrequency,
    lastModified: new Date("2026-11-01T00:00:00.000Z")
  }));
}
