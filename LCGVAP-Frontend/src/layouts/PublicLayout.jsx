import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SiteFooter from '../components/SiteFooter';
import VeteranAssistantChat from '../components/VeteranAssistantChat';

const PublicLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const hideAssistant = ['/profile', '/dashboard'].some((path) => location.pathname.startsWith(path));

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a
        href="#main"
        className="sr-only z-50 rounded-doc bg-primary px-4 py-3 text-caption font-semibold text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>

      <Navbar user={user} logout={logout} />

      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      <SiteFooter />

      {!hideAssistant && <VeteranAssistantChat />}
    </div>
  );
};

export default PublicLayout;
