"use client";

import { useCallback, useEffect, useState } from "react";
import { cooldownRemaining } from "@/lib/auth/register-flow";

/**
 * Resend cooldown. Stores the end timestamp (not a decrementing counter), so a throttled background tab
 * shows the right number as soon as it wakes up.
 */
export function useCooldown() {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const remaining = cooldownRemaining(until, now);

  const cooling = remaining > 0;
  useEffect(() => {
    if (!cooling) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [cooling]);

  const start = useCallback((seconds: number) => {
    const t = Date.now();
    setNow(t);
    setUntil(t + seconds * 1000);
  }, []);
  const reset = useCallback(() => setUntil(0), []);

  return { remaining, start, reset };
}
