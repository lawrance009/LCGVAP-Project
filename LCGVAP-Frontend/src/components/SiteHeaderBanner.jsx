import { BRAND } from '../constants/branding';

const SiteHeaderBanner = () => (
  <div
    className="bg-indigo-600 text-white border-b border-indigo-500/20"
    role="region"
    aria-label="Site announcement"
  >
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
      <div className="flex items-center justify-center gap-2 sm:gap-3 min-w-0">
        <span
          className="flex-shrink-0 text-base sm:text-lg leading-none"
          aria-hidden="true"
        >
          🇱🇷
        </span>

        <p className="min-w-0 text-center text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide sm:tracking-wider leading-snug sm:leading-normal">
          {BRAND.bannerHeadline}
        </p>

        <span
          className="flex-shrink-0 text-base sm:text-lg leading-none"
          aria-hidden="true"
        >
          🇨🇾
        </span>
      </div>
    </div>
  </div>
);

export default SiteHeaderBanner;
