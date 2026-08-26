import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SiteHeaderBanner from '../components/SiteHeaderBanner';
import logo from '../assets/logo.jpeg';
import { BRAND } from '../constants/branding';
import {
  Mail,
  MapPin,
} from 'lucide-react';

const footerLinks = [
  {
    title: 'Explore',
    links: [
      { label: 'Alumni Directory', path: '/directory' },
      { label: 'About VCLGC', path: '/about' },
      { label: 'News', path: '/news' },
      { label: 'Leadership', path: '/leadership' },
    ],
  },
  {
    title: 'Graduate Services',
    links: [
      { label: 'Begin Verification', path: '/register' },
      { label: 'Graduate Sign In', path: '/login' },
      { label: 'Verification FAQ', path: '/#verification-guidelines' },
    ],
  },
];

const PublicLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <SiteHeaderBanner />
      <Navbar user={user} logout={logout} />

      <main className="min-h-[70vh]">
        <Outlet />
      </main>

      <footer className="bg-[#0b1020] text-slate-100">
        <div className="grid h-1 grid-cols-3" aria-hidden="true">
          <div className="bg-red-600"></div>
          <div className="bg-white"></div>
          <div className="bg-indigo-600"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
            <div className="max-w-xl rounded-md bg-white/[0.03] p-5">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt={`${BRAND.shortName} Logo`}
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div>
                  <p className="text-lg font-extrabold text-white">{BRAND.shortName}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-300">
                    Verified Alumni Registry
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                {BRAND.fullName} maintains a trusted registry for Liberian
                graduates from Cyprus, supporting verified records and alumni
                recognition.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerLinks.map((group) => (
                <div key={group.title}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
                    {group.title}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {group.links.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
                  Registry Office
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <p className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
                    <span className="break-all">{BRAND.contactEmail}</span>
                  </p>
                  <p className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-200" aria-hidden="true" />
                    <span>Monrovia, Republic of Liberia</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 rounded-md bg-white/[0.03] px-4 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Copyright {new Date().getFullYear()} {BRAND.portalName}. All rights reserved.
            </p>
            <p className="text-slate-300">Built and developed by NexSolveX.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
