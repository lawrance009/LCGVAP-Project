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
    <section
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-5"
      aria-labelledby="badges-heading"
    >
      <h2
        id="badges-heading"
        className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4"
      >
        Verified Academic Badges
      </h2>

      <ul className="flex flex-wrap gap-3" role="list">
        {badges.map((badge, index) => (
          <li key={badge.id ?? index}>
            <div className="flex items-center gap-2.5 bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
              <span
                aria-hidden="true"
                className="text-2xl leading-none"
                role="img"
              >
                {badge.icon || '🎓'}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{badge.name}</p>
                {badge.description && (
                  <p className="text-xs text-gray-500">{badge.description}</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BadgeList;
