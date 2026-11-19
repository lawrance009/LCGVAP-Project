import { useEffect, useRef, useState } from 'react';

/**
 * Becomes true the first time the element scrolls into view, then stays true.
 * Used for one-time reveals that explain a sequence (the verification stepper).
 */
export default function useInView({ threshold = 0.35 } = {}) {
  const ref = useRef(null);
  // Without IntersectionObserver (very old browsers) just show the final state.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return [ref, inView];
}
