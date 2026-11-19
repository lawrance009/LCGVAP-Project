import { cn } from './ui';

/**
 * Menu icon: long / short / long bars that fold into an X when open.
 * The motion answers the tap, so it is allowed (design-system.md, Motion).
 */
export default function MenuIcon({ open }) {
  const bar = 'absolute left-0 h-0.5 rounded-full bg-current transition-[translate,rotate,scale,opacity,width] duration-200 ease-out';

  return (
    <span aria-hidden="true" className="relative block h-[18px] w-6">
      <span className={cn(bar, 'top-0 w-6', open && 'translate-y-2 rotate-45')} />
      <span className={cn(bar, 'top-2 w-3.5', open && 'w-6 scale-x-0 opacity-0')} />
      <span className={cn(bar, 'top-4 w-6', open && '-translate-y-2 -rotate-45')} />
    </span>
  );
}
