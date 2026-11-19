import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button, cn } from '../../components/ui';

/**
 * Previous / pause / next for rotating content, plus "2 of 3".
 * `noun` names the items for screen readers ("photo", "graduate").
 * `tone="dark"` for use over a photo or a blue surface.
 */
export default function RotationControls({ rotation, count, noun, tone = 'light' }) {
  if (count <= 1) return null;
  const iconProps = { className: 'size-5', strokeWidth: 1.75, 'aria-hidden': true };
  const dark = tone === 'dark';
  const buttonClass = dark ? 'text-paper hover:bg-paper/15 focus-visible:outline-paper' : undefined;

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className={buttonClass} onClick={rotation.prev} aria-label={`Previous ${noun}`}>
        <ChevronLeft {...iconProps} />
      </Button>
      {rotation.canRotate && (
        <Button
          variant="ghost"
          size="icon"
          className={buttonClass}
          onClick={rotation.togglePause}
          aria-label={rotation.paused ? `Resume ${noun} rotation` : `Pause ${noun} rotation`}
        >
          {rotation.paused ? <Play {...iconProps} /> : <Pause {...iconProps} />}
        </Button>
      )}
      <Button variant="ghost" size="icon" className={buttonClass} onClick={rotation.next} aria-label={`Next ${noun}`}>
        <ChevronRight {...iconProps} />
      </Button>
      <span className={cn('ml-1 pr-2 text-caption whitespace-nowrap tabular-nums', dark ? 'text-canton-100' : 'text-muted')}>
        {rotation.index + 1} of {count}
      </span>
    </div>
  );
}
