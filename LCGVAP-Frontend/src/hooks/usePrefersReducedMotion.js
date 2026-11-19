import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(callback) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getSnapshot() {
  return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(QUERY).matches : false;
}

/** True when the user has asked the OS for reduced motion. Updates live. */
export default function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
