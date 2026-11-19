import { useCallback, useEffect, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion';

/**
 * Index state for rotating content (hero slides, featured graduates) that meets
 * the auto-rotation rules in docs/redesign/design-system.md:
 * - visible pause control (`paused`, `togglePause`)
 * - pauses while the pointer or keyboard focus is inside (`regionProps`)
 * - never auto-advances under prefers-reduced-motion
 *
 * `count` may change after data loads; the index is always kept in range.
 */
export default function useAutoAdvance(count, delayMs) {
  // `previous` lets a sliding carousel move the outgoing item out, not just swap.
  const [position, setPosition] = useState({ index: 0, previous: null });
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const canRotate = count > 1 && !reducedMotion;
  const running = canRotate && !userPaused && !hovered && !focused;
  const index = count > 0 ? position.index % count : 0;
  const previous = position.previous == null || count === 0 ? null : position.previous % count;

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setPosition((current) => ({ index: (current.index % count + 1) % count, previous: current.index % count }));
    }, delayMs);
    return () => window.clearInterval(id);
  }, [running, count, delayMs]);

  const move = useCallback(
    (getNext) =>
      setPosition((current) => {
        const from = current.index % count;
        return { index: ((getNext(from) % count) + count) % count, previous: from };
      }),
    [count]
  );
  const goTo = useCallback((target) => move(() => target), [move]);
  const next = useCallback(() => move((from) => from + 1), [move]);
  const prev = useCallback(() => move((from) => from - 1), [move]);
  const togglePause = useCallback(() => setUserPaused((value) => !value), []);

  const regionProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
    },
  };

  return {
    index,
    /** The item that was showing before the current one (null at first). */
    previous,
    goTo,
    next,
    prev,
    /** Whether the rotation is a thing at all (more than one item, motion allowed). */
    canRotate,
    /** Whether the user has paused it with the control. */
    paused: userPaused,
    togglePause,
    regionProps,
  };
}
