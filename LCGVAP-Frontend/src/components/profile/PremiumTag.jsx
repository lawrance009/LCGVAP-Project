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
 * Props:
 *   isPremiumVeteran {boolean} — whether to show the tag
 * ---------------------------------------------------------------
 */

const PremiumTag = ({ isPremiumVeteran }) => {
  if (!isPremiumVeteran) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 select-none">
      <span aria-hidden="true">⭐</span>
      Premium Veteran
    </span>
  );
};

export default PremiumTag;
