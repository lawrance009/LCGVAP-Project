import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { BRAND } from '../constants/branding';

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const publicLinks = [
  { name: 'Home', path: '/' },
  { name: 'Directory', path: '/directory', emphasis: true },
  { name: 'About', path: '/about' },
  { name: 'News', path: '/news' },
  { name: 'Leadership', path: '/leadership' },
];

const Navbar = ({ user, logout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isGraduate = user?.role === 'graduate';

  const navLinks = [
    ...publicLinks,
    ...(isGraduate
      ? [
          { name: 'My Portal', path: '/dashboard' },
          { name: 'Profile', path: '/profile' },
        ]
      : []),
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMobileMenu();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 shadow-sm shadow-indigo-950/5 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={closeMobileMenu}>
          <img
            src={logo}
            alt={BRAND.shortName}
            className="h-12 w-12 shrink-0 rounded-md object-cover shadow-sm shadow-indigo-950/10"
          />
          <div className="min-w-0">
            <p className="text-base font-extrabold leading-tight text-gray-900 sm:text-lg">
              {BRAND.shortName}
            </p>
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
              Verified Alumni Registry
            </p>
          </div>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(link.path)
                  ? 'text-indigo-700'
                  : link.emphasis
                    ? 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <MotionSpan
                  layoutId="publicNavActive"
                  className="absolute inset-x-3 -bottom-[17px] h-0.5 rounded-full bg-indigo-600"
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/directory"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-indigo-50 text-gray-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
            title="Search directory"
            aria-label="Search directory"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Link>

          {isGraduate ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Portal
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-red-50 text-[#b42318] transition-colors hover:bg-[#fff1f0]"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                Begin verification
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-indigo-50 text-gray-900 transition-colors hover:bg-indigo-100 lg:hidden"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MotionDiv
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-white shadow-lg shadow-indigo-950/10 lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center justify-between rounded-md px-4 py-3 text-sm font-semibold ${
                      isActive(link.path)
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {link.name}
                    {link.emphasis && <ShieldCheck className="h-4 w-4 text-indigo-600" aria-hidden="true" />}
                  </Link>
                ))}
              </div>

              <div className="mt-4 grid gap-2 pt-4">
                {isGraduate ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-[#b42318]"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Begin verification
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="rounded-md bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-gray-700"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
