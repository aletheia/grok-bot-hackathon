import { siteConfig } from '@/lib/site';

interface LogoProps {
  size?: number;
  /** Kept for API compatibility with older call sites; the mark is static. */
  animated?: boolean;
  className?: string;
}

/** Event mark: a white blob with two eyes, after the flyer. */
export function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${siteConfig.shortName} logo`}
    >
      <circle cx="50" cy="50" r="46" fill="#ffffff" />
      <ellipse cx="40" cy="44" rx="6" ry="11" fill="#0a0a0a" transform="rotate(-12 40 44)" />
      <ellipse cx="62" cy="40" rx="6" ry="11" fill="#0a0a0a" transform="rotate(-12 62 40)" />
    </svg>
  );
}

export function LogoWithText({ size = 40 }: { size?: number }) {
  return (
    <span className="flex items-center gap-3">
      <Logo size={size} />
      <span className="font-bold text-lg text-white">{siteConfig.shortName}</span>
    </span>
  );
}
