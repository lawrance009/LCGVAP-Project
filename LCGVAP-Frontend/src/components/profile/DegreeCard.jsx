import { CircleAlert, FileText } from 'lucide-react';
import { getSignedFileUrl } from '../../services/api';
import { StatusTag } from '../ui';

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

/** Map degree_type → human-readable label */
const DEGREE_DISPLAY = {
  BACHELOR: "Bachelor's degree",
  MASTER: "Master's degree",
  PHD: 'Doctor of Philosophy (PhD)',
  POSTDOC: 'Post-doctoral research',
  ASSOCIATE: 'Associate degree',
  DIPLOMA: 'Diploma',
};

const DegreeCard = ({ degree }) => {
  const label = DEGREE_DISPLAY[degree?.degree_type] || degree?.degree_type;
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
    <article className="rounded-panel border border-line bg-paper p-5 sm:p-6" aria-label={`${label} credential`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-title font-semibold text-ink">{label}</h3>
          {degree.field_of_study && <p className="mt-0.5 text-caption text-muted">{degree.field_of_study}</p>}
        </div>
        <StatusTag status={degree.is_verified ? 'verified' : 'pending'} />
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-line pt-4 text-caption sm:grid-cols-2">
        {degree.university_name && (
          <div>
            <dt className="text-muted">University</dt>
            <dd className="mt-0.5 font-semibold text-ink">{degree.university_name}</dd>
          </div>
        )}
        {degree.department_name && (
          <div>
            <dt className="text-muted">Department</dt>
            <dd className="mt-0.5 font-semibold text-ink">{degree.department_name}</dd>
          </div>
        )}
        {degree.graduation_year && (
          <div>
            <dt className="text-muted">Graduation year</dt>
            <dd className="mt-0.5 font-semibold text-ink tabular-nums">{degree.graduation_year}</dd>
          </div>
        )}
        {degree.verified_at && (
          <div>
            <dt className="text-muted">Verified on</dt>
            <dd className="mt-0.5 font-semibold text-ink tabular-nums">
              {new Date(degree.verified_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </dd>
          </div>
        )}
      </dl>

      {hasBadge ? (
        <div className="mt-5 flex items-center gap-3 rounded-doc bg-tint px-3 py-2.5">
          {/* Badge icon is server-provided data. */}
          <span aria-hidden="true" className="text-xl leading-none">
            {degree.badge.icon}
          </span>
          <div>
            <p className="text-caption font-semibold text-primary">{degree.badge.name}</p>
            {degree.badge.description && <p className="text-caption text-muted">{degree.badge.description}</p>}
          </div>
        </div>
      ) : degree.is_verified ? (
        <p className="mt-5 text-caption text-muted">Badge details are not available for this degree.</p>
      ) : (
        <div className="mt-5 text-caption text-muted">
          A badge is awarded once this degree is verified.
          {degree.rejection_reason && (
            <p className="mt-2 flex items-start gap-1.5 font-medium text-danger">
              <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              Reason given: {degree.rejection_reason}
            </p>
          )}
        </div>
      )}

      {degree.degree_file && (
        <div className="mt-4 border-t border-line pt-3">
          <a
            href={degree.degree_file}
            onClick={handleOpenDegreeDocument}
            className="inline-flex items-center gap-1.5 rounded-doc text-caption font-semibold text-primary underline-offset-4 hover:underline"
          >
            <FileText className="size-4" strokeWidth={1.75} aria-hidden="true" />
            View degree document
          </a>
        </div>
      )}
    </article>
  );
};

export default DegreeCard;
