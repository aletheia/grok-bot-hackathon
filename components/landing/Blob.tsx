'use client';

import { motion, useReducedMotion } from 'framer-motion';

export type BlobVariant = 'pink' | 'orange' | 'teal' | 'blue';

export const BLOB_COLORS: Record<BlobVariant, string> = {
  pink: '#ff3fa4',
  orange: '#ff8c1a',
  teal: '#17b8a6',
  blue: '#2f80ff',
};

const EYE = '#0a0a0a';

/** Decorative mascots in the style of the event flyer. Always aria-hidden. */
function Shape({ variant }: { variant: BlobVariant }) {
  const fill = BLOB_COLORS[variant];
  switch (variant) {
    case 'pink':
      return (
        <>
          <path
            d="M52 8c6 0 10 4 14 11l26 50c6 12-1 23-14 23H22C9 92 2 81 8 69l30-50c4-7 8-11 14-11z"
            fill={fill}
          />
          <ellipse cx="44" cy="56" rx="4.5" ry="7" fill={EYE} />
          <ellipse cx="62" cy="54" rx="4.5" ry="7" fill={EYE} />
        </>
      );
    case 'orange':
      return (
        <>
          <path
            d="M50 4c8 14 38 40 38 60a38 38 0 0 1-76 0C12 44 42 18 50 4z"
            fill={fill}
          />
          <circle cx="40" cy="62" r="6" fill={EYE} />
          <circle cx="60" cy="58" r="4" fill={EYE} />
        </>
      );
    case 'teal':
      return (
        <>
          <rect x="8" y="12" width="84" height="76" rx="30" fill={fill} />
          <rect x="33" y="38" width="10" height="20" rx="4" fill={EYE} />
          <rect x="57" y="38" width="10" height="20" rx="4" fill={EYE} />
        </>
      );
    case 'blue':
      return (
        <>
          <path
            d="M28 88C14 88 4 78 4 65c0-12 8-21 19-23 2-18 15-32 31-32 15 0 27 11 30 26 9 3 14 11 14 21 0 17-12 31-28 31H28z"
            fill={fill}
          />
          <ellipse cx="44" cy="58" rx="5" ry="10" fill={EYE} />
          <ellipse cx="64" cy="58" rx="5" ry="10" fill={EYE} />
        </>
      );
  }
}

type BlobProps = {
  variant: BlobVariant;
  size?: number;
  className?: string;
  /** Float animation; disabled automatically under prefers-reduced-motion. */
  float?: boolean;
  delay?: number;
  rotate?: number;
};

export function Blob({ variant, size = 96, className = '', float = true, delay = 0, rotate = 0 }: BlobProps) {
  const reduce = useReducedMotion();
  const animate = float && !reduce;

  return (
    <motion.svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ rotate }}
      animate={animate ? { y: [0, -10, 0], rotate: [rotate, rotate + 4, rotate] } : undefined}
      transition={animate ? { duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay } : undefined}
    >
      <Shape variant={variant} />
    </motion.svg>
  );
}
