import { getSignedFileUrl } from '../../services/api';

/**
 * DegreeCard.jsx
 * ---------------------------------------------------------------
 * Displays a single academic degree record.
 *
 * DISPLAY RULES:
 *   - Badge section only renders when degree.is_verified = true
 *     AND degree.badge is non-null (comes from server).
 *   - If degree is not verified, shows "Pending Verification".
 *   - Gracefully handles missing badge data without crashing.
 *
 * Props:
 *   degree {object} — one item from the backend degrees array
 * ---------------------------------------------------------------
 */

/** Map degree_type → human-readable label and color scheme */
const DEGREE_DISPLAY = {
  BACHELOR:  { label: 'Bachelor\'s Degree', color: 'blue'  },
  MASTER:    { label: 'Master\'s Degree',   color: 'indigo' },
  PHD:       { label: 'Doctor of Philosophy (PhD)', color: 'purple' },
  POSTDOC:   { label: 'Post-Doctoral Research',     color: 'teal'   },
  ASSOCIATE: { label: 'Associate Degree',           color: 'sky'    },
  DIPLOMA:   { label: 'Diploma',                    color: 'slate'  },
};

const COLOR_CLASSES = {
  blue:   { border: 'border-blue-200',   badge_bg: 'bg-blue-50',   badge_text: 'text-blue-700',   tag_bg: 'bg-blue-100',   tag_text: 'text-blue-800'   },
  indigo: { border: 'border-indigo-200', badge_bg: 'bg-indigo-50', badge_text: 'text-indigo-700', tag_bg: 'bg-indigo-100', tag_text: 'text-indigo-800' },
  purple: { border: 'border-purple-200', badge_bg: 'bg-purple-50', badge_text: 'text-purple-700', tag_bg: 'bg-purple-100', tag_text: 'text-purple-800' },
  teal:   { border: 'border-teal-200',   badge_bg: 'bg-teal-50',   badge_text: 'text-teal-700',   tag_bg: 'bg-teal-100',   tag_text: 'text-teal-800'   },
  sky:    { border: 'border-sky-200',    badge_bg: 'bg-sky-50',    badge_text: 'text-sky-700',    tag_bg: 'bg-sky-100',    tag_text: 'text-sky-800'    },
  slate:  { border: 'border-slate-200',  badge_bg: 'bg-slate-50',  badge_text: 'text-slate-700',  tag_bg: 'bg-slate-100',  tag_text: 'text-slate-800'  },
};

const DegreeCard = ({ degree }) => {
  const display  = DEGREE_DISPLAY[degree?.degree_type] || { label: degree?.degree_type, color: 'slate' };
  const colors   = COLOR_CLASSES[display.color];
  const hasBadge = degree?.is_verified && degree?.badge && degree.badge.name;

  const handleOpenDegreeDocument = async (event) => {
    event.preventDefault();
    if (!degree?.degree_file) return;
    try {
      const url = await getSignedFileUrl(degree.degree_file);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open degree document:', error);
    }
  };

  return (
    <article
      className={`bg-white rounded-lg border ${colors.border} shadow-sm p-5 transition-shadow hover:shadow-md`}
      aria-label={`${display.label} credential`}
    >
      {/* ── Header Row ───────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{display.label}</h3>
          {degree.field_of_study && (
            <p className="text-sm text-gray-500 mt-0.5">{degree.field_of_study}</p>
          )}
        </div>

        {/* Verification status pill */}
        {degree.is_verified ? (
          <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.tag_bg} ${colors.tag_text}`}>
            ✓ Verified
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Pending Verification
          </span>
        )}
      </div>

      {/* ── Degree Meta ──────────────────────────── */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-4">
        {degree.university_name && (
          <>
            <dt className="text-gray-400 font-medium">University</dt>
            <dd className="text-gray-700">{degree.university_name}</dd>
          </>
        )}
        {degree.department_name && (
          <>
            <dt className="text-gray-400 font-medium">Department</dt>
            <dd className="text-gray-700">{degree.department_name}</dd>
          </>
        )}
        {degree.graduation_year && (
          <>
            <dt className="text-gray-400 font-medium">Graduation Year</dt>
            <dd className="text-gray-700">{degree.graduation_year}</dd>
          </>
        )}
        {degree.verified_at && (
          <>
            <dt className="text-gray-400 font-medium">Verified On</dt>
            <dd className="text-gray-700">
              {new Date(degree.verified_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </dd>
          </>
        )}
      </dl>

      {/* ── Badge Section ────────────────────────── */}
      {hasBadge ? (
        <div className={`flex items-center gap-2.5 ${colors.badge_bg} rounded-md px-3 py-2`}>
          <span
            aria-hidden="true"
            className="text-xl leading-none"
            role="img"
          >
            {degree.badge.icon}
          </span>
          <div>
            <p className={`text-sm font-semibold ${colors.badge_text}`}>
              {degree.badge.name}
            </p>
            {degree.badge.description && (
              <p className="text-xs text-gray-500">{degree.badge.description}</p>
            )}
          </div>
        </div>
      ) : degree.is_verified ? (
        /* Verified but badge data missing — fail gracefully */
        <div className="flex items-center gap-2 text-sm text-gray-400 italic">
          <span aria-hidden="true">🎓</span>
          Badge data unavailable
        </div>
      ) : (
        /* Not verified */
        <div className="text-sm text-gray-400 italic">
          Badge will be awarded upon verification.
          {degree.rejection_reason && (
            <p className="mt-1 text-red-500 not-italic">
              ⚠ Rejection note: {degree.rejection_reason}
            </p>
          )}
        </div>
      )}

      {/* ── Degree Document Link ─────────────────── */}
      {degree.degree_file && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={degree.degree_file}
            onClick={handleOpenDegreeDocument}
            className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            📄 View Degree Document
          </a>
        </div>
      )}
    </article>
  );
};

export default DegreeCard;
