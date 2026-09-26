import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export const metadata = { title: "About Sailan Tech" };
export default function Page() {
  return (
    <div className="wrap page-space">
      <div className="page-head">
        <p className="eyebrow">SAILAN TECH SOLUTIONS LLC</p>
        <h1>
          Good tech.
          <br />A better next chapter.
        </h1>
      </div>
      <div className="about-layout">
        <Image
          src="/brand/sailan-official.png"
          alt="Official Sailan Tech Solutions LLC logo"
          width={600}
          height={600}
        />
        <div className="stack">
          <h2>
            Buy simply.
            <br />
            Sell confidently.
          </h2>
          <p className="large-copy">
            Sailan Tech Marketplace is operated by Sailan Tech Solutions LLC.
          </p>
          <p>
            We’re building a straightforward way to buy, sell, and repair
            electronics, with transparent condition grading, clear device
            details, and competitive pricing.
          </p>
          <p>
            From your next everyday phone to the computer that powers your work,
            the goal is simple: help you understand your options and make the
            right choice.
          </p>
          <p>
            When selling a device, you can get an estimated quote first. We
            confirm the final offer after inspection so the next step is clear.
          </p>
          <Link href="/shop" className="text-link">
            Explore the marketplace <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
}
