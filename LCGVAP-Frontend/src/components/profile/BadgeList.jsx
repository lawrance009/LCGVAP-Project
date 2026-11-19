/**
 * BadgeList.jsx
 * ---------------------------------------------------------------
 * Displays the aggregated list of all verified academic badges
 * earned by a user, derived from their verified degrees.
 *
 * DESIGN RULE:
 *   badges[] is computed by the parent via:
 *     degrees.filter(d => d.is_verified && d.badge).map(d => d.badge)
 *   BadgeList is a pure display component — it renders only
 *   what the server provided. No manual badge injection.
 *
 * Props:
 *   badges {Array<{id, name, icon, description}>}
 * ---------------------------------------------------------------
 */

const BadgeList = ({ badges = [] }) => {
  if (badges.length === 0) return null;

  return (
    <section aria-labelledby="badges-heading">
      <h2 id="badges-heading" className="font-display text-title font-semibold text-ink">
        Academic badges
      </h2>

      <ul className="mt-4 flex flex-wrap gap-3">
        {badges.map((badge, index) => (
          <li key={badge.id ?? index} className="flex items-center gap-3 rounded-doc bg-tint px-4 py-2.5">
            {/* Badge icon is server-provided data. */}
            {badge.icon && (
              <span aria-hidden="true" className="text-2xl leading-none">
                {badge.icon}
              </span>
            )}
            <div>
              <p className="text-caption font-semibold text-primary">{badge.name}</p>
              {badge.description && <p className="text-caption text-muted">{badge.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BadgeList;
