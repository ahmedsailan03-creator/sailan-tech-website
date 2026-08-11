type IconType =
  | "support"
  | "m365"
  | "network"
  | "onboarding"
  | "devices"
  | "web";

export default function ServiceIcon({ type }: { type: IconType }) {
  if (type === "support") {
    return (
      <svg viewBox="0 0 64 64" className="service-svg" aria-hidden="true">
        <path d="M18 38v-7a14 14 0 0 1 28 0v7" />
        <path d="M18 37h-5v12h9V37h-4ZM46 37h5v12h-9V37h4Z" />
        <path d="M42 50c-2 4-5 6-10 6h-4" />
        <circle cx="25" cy="56" r="2" />
      </svg>
    );
  }

  if (type === "m365") {
    return (
      <svg viewBox="0 0 64 64" className="service-svg" aria-hidden="true">
        <path d="M15 17 31 11l18 7-7 7-11-4-9 4-7-8Z" />
        <path d="m15 17 8 10v20l8 6V21" />
        <path d="m31 21 11 4v20l-11 8" />
        <path d="m42 25 7-7v28l-7-1" />
      </svg>
    );
  }

  if (type === "network") {
    return (
      <svg viewBox="0 0 64 64" className="service-svg" aria-hidden="true">
        <circle cx="32" cy="17" r="6" />
        <circle cx="16" cy="47" r="6" />
        <circle cx="48" cy="47" r="6" />
        <path d="M29 22 19 41M35 22l10 19M22 47h20" />
      </svg>
    );
  }

  if (type === "onboarding") {
    return (
      <svg viewBox="0 0 64 64" className="service-svg" aria-hidden="true">
        <circle cx="25" cy="23" r="8" />
        <path d="M11 49c1-10 7-15 14-15s13 5 14 15" />
        <path d="M45 28v18M36 37h18" />
      </svg>
    );
  }

  if (type === "devices") {
    return (
      <svg viewBox="0 0 64 64" className="service-svg" aria-hidden="true">
        <rect x="10" y="13" width="44" height="30" rx="3" />
        <path d="M25 51h14M32 43v8" />
        <path d="m23 28 6 6 12-13" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="service-svg" aria-hidden="true">
      <rect x="9" y="12" width="46" height="40" rx="4" />
      <path d="M9 22h46M16 17h1M22 17h1M28 17h1" />
      <path d="m20 38 7-7M27 31l7 7M44 30l-9 14" />
    </svg>
  );
}
