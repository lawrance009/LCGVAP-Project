import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const adminPageMeta = [
  { path: '/patron/dashboard', title: 'Dashboard', section: 'Command Center' },
  { path: '/patron/universities', title: 'Universities', section: 'Institution Data' },
  { path: '/patron/departments', title: 'Departments', section: 'Institution Data' },
  { path: '/patron/graduates', title: 'Verified Graduates', section: 'Graduate Records' },
  { path: '/patron/users', title: 'Verified Graduates', section: 'Graduate Records' },
  { path: '/patron/featured-graduates', title: 'Featured Alumni', section: 'Graduate Records' },
  { path: '/patron/degrees', title: 'Degree Review', section: 'Verification Queue' },
  { path: '/patron/faq', title: 'FAQ Manager', section: 'Public Site' },
  { path: '/patron/slides', title: 'Hero Slides', section: 'Public Site' },
  { path: '/patron/news', title: 'News Manager', section: 'Public Site' },
  { path: '/patron/leadership', title: 'Leadership Manager', section: 'Public Site' },
  { path: '/patron/manage-admins', title: 'Manage Admins', section: 'Access Control' },
];

const getInitials = (user) => {
  const first = user?.first_name?.[0] || '';
  const last = user?.last_name?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'AD';
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pageMeta = useMemo(() => (
    adminPageMeta.find((item) => location.pathname === item.path) || {
      title: 'Admin Portal',
      section: 'Workspace',
    }
  ), [location.pathname]);

  const roleLabel = user?.role === 'master_admin' ? 'Master Admin' : 'Administrator';

  const handleLogout = () => {
    logout();
    navigate('/patron-entry');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(true)}
                  className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-slate-950 text-white transition-colors hover:bg-indigo-700 md:hidden"
                  aria-label="Open admin navigation"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-700">
                    <ShieldCheck className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{pageMeta.section}</span>
                  </div>
                  <h1 className="truncate text-xl font-black leading-tight text-slate-950 sm:text-2xl">
                    {pageMeta.title}
                  </h1>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                <Link
                  to="/"
                  className="hidden h-10 items-center gap-2 rounded-md bg-slate-100 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-800 sm:inline-flex"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  View Site
                </Link>

                <div className="hidden items-center gap-3 rounded-md bg-slate-50 px-3 py-2 md:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-700 text-sm font-black text-white">
                    {getInitials(user)}
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="max-w-40 truncate text-sm font-black text-slate-950">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="flex items-center justify-end gap-1 text-xs font-bold uppercase text-slate-500">
                      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                      {roleLabel}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-red-600 text-white transition-colors hover:bg-red-700"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
