import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import getFileUrl from '../../utils/getFileUrl';
import PremiumTag from '../../components/profile/PremiumTag';
import { formatDegreeType, getPublicDegreeTypes, isPublicPremiumVeteran } from '../../utils/degreeDisplay';
import { Avatar, Seal, Skeleton } from '../../components/ui';

const ROW_GRID =
  'lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_minmax(0,1.5fr)_minmax(0,1.3fr)_1.25rem] lg:items-center lg:gap-6';

const fullNameOf = (graduate) => `${graduate.first_name || ''} ${graduate.last_name || ''}`.trim();

/**
 * The register itself: one row per verified graduate. Column headings show
 * from lg up; below that each row stacks and labels its own fields.
 * Rows rise in a short stagger whenever new results arrive.
 */
export default function GraduateList({ graduates }) {
  return (
    <div className="border-t border-line">
      <div className={`hidden border-b border-line py-3 text-caption font-semibold text-muted ${ROW_GRID}`} aria-hidden="true">
        <span>Graduate</span>
        <span>University</span>
        <span>Department</span>
        <span>Degrees</span>
        <span />
      </div>

      <ul>
        {graduates.map((graduate, idx) => (
          <GraduateRow key={graduate.id} graduate={graduate} delayMs={Math.min(idx, 12) * 35} />
        ))}
      </ul>
    </div>
  );
}

function GraduateRow({ graduate, delayMs }) {
  const fullName = fullNameOf(graduate) || 'Verified graduate';
  const degreeTypes = getPublicDegreeTypes(graduate);

  return (
    <li
      className={`group relative animate-rise border-b border-line py-5 transition-colors duration-150 hover:bg-wash ${ROW_GRID}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="relative shrink-0">
          <Avatar
            name={fullName}
            src={graduate.profile_photo ? getFileUrl(graduate.profile_photo) : null}
            size="md"
          />
          <Seal size="xs" tilted={false} backed label="Verified graduate" className="absolute -right-1.5 -bottom-1.5 size-5" />
        </span>
        <div className="min-w-0">
          <Link
            to={`/directory/${graduate.id}`}
            className="rounded-doc font-display text-title font-semibold text-ink after:absolute after:inset-0 group-hover:text-primary"
          >
            {fullName}
          </Link>
          {isPublicPremiumVeteran(graduate) && (
            <div className="mt-1.5">
              <PremiumTag isPremiumVeteran />
            </div>
          )}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 pl-16 text-caption lg:contents">
        <div className="lg:min-w-0">
          <dt className="text-muted lg:sr-only">University</dt>
          <dd className="font-medium text-ink">{graduate.university_name || 'Not listed'}</dd>
        </div>
        <div className="lg:min-w-0">
          <dt className="text-muted lg:sr-only">Department</dt>
          <dd className="font-medium text-ink">{graduate.department_name || 'Not listed'}</dd>
        </div>
        <div className="col-span-2 lg:col-span-1 lg:min-w-0">
          <dt className="text-muted lg:sr-only">Degrees</dt>
          <dd className="flex flex-wrap gap-1.5">
            {degreeTypes.length > 0
              ? degreeTypes.map((type) => (
                  <span key={type} className="rounded-doc bg-tint px-2 py-0.5 font-medium text-primary">
                    {formatDegreeType(type)}
                  </span>
                ))
              : <span className="text-muted">Not listed</span>}
          </dd>
        </div>
      </dl>

      <ChevronRight
        className="absolute top-6 right-0 size-5 text-faint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary lg:static"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </li>
  );
}

export function GraduateListSkeleton() {
  return (
    <div className="border-t border-line" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div key={item} className={`flex items-center gap-4 border-b border-line py-5 ${ROW_GRID}`}>
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="hidden h-4 w-32 lg:block" />
          <Skeleton className="hidden h-4 w-28 lg:block" />
          <Skeleton className="hidden h-5 w-24 lg:block" />
        </div>
      ))}
    </div>
  );
}
