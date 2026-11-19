import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { BRAND } from '../constants/branding';
import { Container } from './ui';

const footerLinks = [
  {
    title: 'Explore',
    links: [
      { label: 'Search the register', path: '/directory' },
      { label: 'About VCLGC', path: '/about' },
      { label: 'News', path: '/news' },
      { label: 'Leadership', path: '/leadership' },
    ],
  },
  {
    title: 'For graduates',
    links: [
      { label: 'Get verified', path: '/register' },
      { label: 'Sign in', path: '/login' },
      { label: 'Questions before you apply', path: '/#verification-guidelines' },
    ],
  },
];

const linkClass =
  'inline-block rounded-doc py-1.5 -my-1.5 text-caption text-canton-100 underline-offset-4 transition-colors duration-150 hover:text-paper hover:underline focus-visible:outline-paper';

const SiteFooter = () => (
  <footer className="bg-ink text-canton-100">
    <Container className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
      <div className="lg:col-span-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" width="48" height="48" className="size-12 rounded-full object-cover" />
          <p className="font-display text-title font-semibold text-paper">{BRAND.shortName}</p>
        </div>
        <p className="mt-4 max-w-sm text-caption">
          The official register of the {BRAND.fullName}. Every record is checked against the
          graduate&apos;s degree documents before it is published.
        </p>
      </div>

      {footerLinks.map((group) => (
        <nav key={group.title} aria-label={group.title} className="lg:col-span-2">
          <h2 className="text-caption font-semibold text-paper">{group.title}</h2>
          <ul className="mt-4 space-y-3">
            {group.links.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}

      <div className="lg:col-span-4">
        <h2 className="text-caption font-semibold text-paper">Contact</h2>
        <ul className="mt-4 space-y-3 text-caption">
          <li className="flex gap-2.5">
            <Mail className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <a href={`mailto:${BRAND.contactEmail}`} className={linkClass}>
              {BRAND.contactEmail.split('@')[0]}@<wbr />
              {BRAND.contactEmail.split('@')[1]}
            </a>
          </li>
          <li className="flex gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Monrovia, Republic of Liberia</span>
          </li>
        </ul>
      </div>
    </Container>

    <div className="border-t border-paper/15">
      <Container className="flex flex-col gap-2 pt-5 pb-24 text-caption text-canton-300 sm:flex-row sm:justify-between sm:pb-5">
        <p>
          © {new Date().getFullYear()} {BRAND.portalName}
        </p>
        <p>Built by NexSolveX</p>
      </Container>
    </div>
  </footer>
);

export default SiteFooter;
