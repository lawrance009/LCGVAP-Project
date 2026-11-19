import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { BRAND } from '../constants/branding';
import { Button, Container, cn } from './ui';
import MenuIcon from './MenuIcon';

const publicLinks = [
  { name: 'Home', path: '/', end: true },
  { name: 'Directory', path: '/directory' },
  { name: 'About', path: '/about' },
  { name: 'News', path: '/news' },
  { name: 'Leadership', path: '/leadership' },
];

const desktopLinkClass = ({ isActive }) =>
  cn(
    'relative inline-flex h-16 items-center px-3 text-caption font-semibold transition-colors duration-150',
    'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0',
    isActive ? 'text-primary after:opacity-100' : 'text-muted hover:text-ink'
  );

const mobileLinkClass = ({ isActive }) =>
  cn(
    'flex h-12 items-center border-l-2 px-4 text-body font-semibold',
    isActive ? 'border-primary bg-tint text-primary' : 'border-transparent text-ink hover:bg-tint'
  );

const Navbar = ({ user, logout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuId = useId();
  const menuButtonRef = useRef(null);
  const menuPanelRef = useRef(null);
  const isGraduate = user?.role === 'graduate';

  const navLinks = [
    ...publicLinks,
    ...(isGraduate
      ? [
          { name: 'My portal', path: '/dashboard' },
          { name: 'Profile', path: '/profile' },
        ]
      : []),
  ];

  // Move focus into the panel when it opens so keyboard users land on the links.
  useEffect(() => {
    if (isMobileMenuOpen) {
      menuPanelRef.current?.querySelector('a, button')?.focus();
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isMobileMenuOpen) {
      closeMobileMenu();
      menuButtonRef.current?.focus();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMobileMenu();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper" onKeyDown={handleKeyDown}>
      <Container className="flex h-16 items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="flex min-w-0 items-center gap-3 justify-self-start rounded-doc" onClick={closeMobileMenu}>
          <img src={logo} alt="" width="40" height="40" className="size-10 shrink-0 rounded-full object-cover" />
          <span className="font-display text-title font-semibold tracking-wide text-ink">{BRAND.shortName}</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink to={link.path} end={link.end} className={desktopLinkClass}>
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 justify-self-end lg:flex">
          {isGraduate ? (
            <Button variant="ghost" leadingIcon={LogOut} onClick={handleLogout}>
              Sign out
            </Button>
          ) : (
            <>
              <Button variant="ghost" to="/login">
                Sign in
              </Button>
              <Button variant="accent" to="/register">Get verified</Button>
            </>
          )}
        </div>

        <Button
          ref={menuButtonRef}
          variant="ghost"
          size="icon"
          className="text-ink lg:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls={menuId}
        >
          <MenuIcon open={isMobileMenuOpen} />
        </Button>
      </Container>

      <div
        id={menuId}
        ref={menuPanelRef}
        hidden={!isMobileMenuOpen}
        className="border-t border-line bg-paper shadow-overlay lg:hidden"
      >
        <Container className="py-3">
          <nav aria-label="Main">
            <ul>
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink to={link.path} end={link.end} className={mobileLinkClass} onClick={closeMobileMenu}>
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-3 grid gap-2 border-t border-line pt-4 pb-2">
            {isGraduate ? (
              <Button variant="secondary" leadingIcon={LogOut} onClick={handleLogout}>
                Sign out
              </Button>
            ) : (
              <>
                <Button variant="accent" to="/register" onClick={closeMobileMenu}>
                  Get verified
                </Button>
                <Button variant="secondary" to="/login" onClick={closeMobileMenu}>
                  Sign in
                </Button>
              </>
            )}
          </div>
        </Container>
      </div>
    </header>
  );
};

export default Navbar;
