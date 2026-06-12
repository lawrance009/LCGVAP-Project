import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.jpeg';
import { BRAND } from '../constants/branding';

const Navbar = ({ user, logout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Only show 'Profile' tab for graduate users — admins have their own dashboard
  const isGraduate = user?.role === 'graduate';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'News', path: '/news' },
    { name: 'Leadership', path: '/leadership' },
    { name: 'Directory', path: '/directory' },
    ...(isGraduate ? [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Profile', path: '/profile' },
    ] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            <img
              src={logo}
              alt={BRAND.shortName}
              className="h-10 w-10 sm:h-12 sm:w-12 object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-gray-900 leading-tight tracking-tight uppercase truncate">
                {BRAND.shortName}
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-indigo-600 uppercase tracking-wider leading-tight truncate">
                {BRAND.portalSubtitle}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-0 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200
                  ${isActive(link.path)
                    ? 'text-gray-900 bg-gray-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 flex-shrink-0">

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-3">
              {isGraduate ? (
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 text-red-600 text-xs font-bold uppercase tracking-wider border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-3 text-gray-900 text-xs font-bold uppercase tracking-wider border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="px-6 py-3 bg-indigo-600 !text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all duration-200"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t-2 border-gray-100"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200
                      ${isActive(link.path)
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Mobile Auth */}
                <div className="pt-4 mt-2 border-t-2 border-gray-100 space-y-2 px-6">
                  {isGraduate ? (
                    <button
                      onClick={handleLogout}
                      className="w-full px-6 py-3 text-red-600 text-xs font-bold uppercase tracking-wider border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-6 py-3 text-gray-900 text-xs font-bold uppercase tracking-wider border-2 border-gray-900 text-center hover:bg-gray-900 hover:text-white transition-all duration-200"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-6 py-3 bg-indigo-600 !text-white text-xs font-bold uppercase tracking-wider text-center hover:bg-indigo-700 transition-all duration-200"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </nav>
  );
};

export default Navbar;