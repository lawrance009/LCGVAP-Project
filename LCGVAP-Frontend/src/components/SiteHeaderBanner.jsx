import { Clock3, MapPin, ShieldCheck } from 'lucide-react';
import { BRAND } from '../constants/branding';

const SiteHeaderBanner = () => (
  <div
    className="bg-gray-950 text-white"
    role="region"
    aria-label="Official registry notice"
  >
    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 text-xs sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex min-w-0 items-center justify-center gap-2 lg:justify-start">
        <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-300" aria-hidden="true" />
        <p className="min-w-0 text-center font-semibold lg:text-left">
          <span className="block truncate sm:hidden">
            The Official Liberian Cyprus Graduates Alumni Platform
          </span>
          <span className="hidden truncate sm:block">
            {BRAND.bannerHeadline}
          </span>
        </p>
      </div>

      <div className="hidden flex-wrap items-center gap-x-4 gap-y-1 text-white/75 lg:flex">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          Monrovia registry office
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          Verification review: 2-5 business days
        </span>
      </div>
    </div>
    <div className="h-1 bg-gradient-to-r from-red-600 via-white to-indigo-600" aria-hidden="true" />
  </div>
);

export default SiteHeaderBanner;
