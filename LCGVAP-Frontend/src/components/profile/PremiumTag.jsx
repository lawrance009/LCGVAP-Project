/**
 * PremiumTag.jsx
 * ---------------------------------------------------------------
 * Displays the "Premium Veteran" status badge.
 *
 * DISPLAY RULE:
 *   Only renders when the user holds BOTH a verified Bachelor
 *   AND a verified Master degree.
 *   The `isPremiumVeteran` boolean is computed server-side and
 *   passed via props — no client-side recalculation needed.
 *
 * Look: deep blue tag with the Liberian lone star in flag red
 * (design-system.md, "Red, white and blue").
 *
 * Props:
 *   isPremiumVeteran {boolean} — whether to show the tag
 * ---------------------------------------------------------------
 */

const PremiumTag = ({ isPremiumVeteran }) => {
  if (!isPremiumVeteran) return null;

  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-doc bg-deep px-2.5 text-caption font-semibold whitespace-nowrap text-paper select-none">
      <svg viewBox="0 0 24 24" className="size-3.5 text-accent" aria-hidden="true">
        <polygon
          fill="currentColor"
          points="12,1.5 14.9,8.6 22.5,9.1 16.7,14 18.5,21.5 12,17.4 5.5,21.5 7.3,14 1.5,9.1 9.1,8.6"
        />
      </svg>
      Premium veteran
    </span>
  );
};

export default PremiumTag;
