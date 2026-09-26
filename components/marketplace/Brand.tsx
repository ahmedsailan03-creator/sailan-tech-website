import Image from "next/image";
import Link from "next/link";
export function Brand({
  large = false,
  label = true,
}: {
  large?: boolean;
  label?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`brandmark ${large ? "large" : ""}`}
      aria-label="Sailan Tech Marketplace home"
    >
      <Image
        src="/brand/sailan-official.png"
        width={large ? 120 : 60}
        height={large ? 120 : 60}
        alt="Official Sailan Tech Solutions LLC logo"
        priority={!large}
      />
      {label && (
        <span>
          <strong>SAILAN TECH</strong>
          <small>MARKETPLACE</small>
        </span>
      )}
    </Link>
  );
}
