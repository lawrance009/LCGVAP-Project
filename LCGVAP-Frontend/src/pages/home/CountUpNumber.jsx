import { useEffect, useState } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const DURATION_MS = 1200;
const easeOutQuart = (t) => 1 - (1 - t) ** 4;

/**
 * Counts from 0 to `value` once, when the value first arrives.
 * Screen readers get the final number only; reduced motion shows it at once.
 */
export default function CountUpNumber({ value }) {
  const reducedMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);
  const target = Number(value) || 0;

  useEffect(() => {
    if (reducedMotion || target === 0) return undefined;
    let frame;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      setShown(Math.round(easeOutQuart(progress) * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    // Browsers pause animation frames in background tabs. Never leave a false
    // number on screen: land on the real value even if no frame ever runs.
    const settle = window.setTimeout(() => setShown(target), DURATION_MS + 100);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [target, reducedMotion]);

  const display = reducedMotion ? target : shown;

  return (
    <>
      <span aria-hidden="true">{display.toLocaleString()}</span>
      <span className="sr-only">{target.toLocaleString()}</span>
    </>
  );
}
