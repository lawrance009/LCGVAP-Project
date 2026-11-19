import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  Activity,
  BadgeCheck,
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  Crown,
  FileText,
  GraduationCap,
  HelpCircle,
  Image,
  Key,
  LayoutDashboard,
  LockKeyhole,
  Newspaper,
  ShieldCheck,
  Star,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assets/logo.jpeg';
import { BRAND } from '../constants/branding';

const MotionAside = motion.aside;
const MotionDiv = motion.div;

const passwordInitialState = {
  current_password: '',
  new_password: '',
  confirm: '',
};

const AdminSidebar = ({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isBossAdmin = user?.role === 'master_admin';

  const [showPwModal, setShowPwModal] = useState(false);
  const [pwData, setPwData] = useState(passwordInitialState);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  const navGroups = useMemo(() => [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', path: '/patron/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Verification',
      items: [
        { name: 'Degree Review', path: '/patron/degrees', icon: FileText },
        { name: 'Graduates', path: '/patron/graduates', icon: GraduationCap, matchPaths: ['/patron/users'] },
        { name: 'Featured Alumni', path: '/patron/featured-graduates', icon: Star },
      ],
    },
    {
      label: 'Institution Data',
      items: [
        { name: 'Universities', path: '/patron/universities', icon: Building2 },
        { name: 'Departments', path: '/patron/departments', icon: BookOpen },
      ],
    },
    {
      label: 'Public Site',
      items: [
        { name: 'Hero Slides', path: '/patron/slides', icon: Image },
        { name: 'News', path: '/patron/news', icon: Newspaper },
        { name: 'Leadership', path: '/patron/leadership', icon: Crown },
        { name: 'FAQ', path: '/patron/faq', icon: HelpCircle },
      ],
    },
    ...(isBossAdmin
      ? [{
        label: 'Access',
        items: [
          { name: 'Manage Admins', path: '/patron/manage-admins', icon: Users, masterOnly: true },
        ],
      }]
      : []),
  ], [isBossAdmin]);

  const closePasswordModal = () => {
    setShowPwModal(false);
    setPwError('');
    setPwData(passwordInitialState);
  };

  const updatePasswordField = (field, value) => {
    setPwData((current) => ({ ...current, [field]: value }));
    if (pwError) setPwError('');
  };

  const handlePwChange = async (event) => {
    event.preventDefault();
    setPwError('');

    if (pwData.new_password !== pwData.confirm) {
      setPwError('New passwords do not match.');
      return;
    }

    if (pwData.new_password.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }

    setPwLoading(true);

    try {
      await api.put('/auth/admin/change-password', {
        current_password: pwData.current_password,
        new_password: pwData.new_password,
      });

      closePasswordModal();
      Swal.fire({
        title: 'Password Changed',
        text: 'Please log in again with your new password.',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
      }).then(() => logout());
    } catch (error) {
      setPwError(error.response?.data?.error || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const isActiveRoute = (item) => (
    location.pathname === item.path || item.matchPaths?.includes(location.pathname)
  );

  const sidebarContent = (collapsed = false, mobile = false) => (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex min-h-20 items-center gap-3 px-4 py-4">
        <Link
          to="/patron/dashboard"
          onClick={() => setIsMobileOpen(false)}
          className={`flex min-w-0 flex-1 items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? `${BRAND.shortName} Admin Portal` : ''}
        >
          <img
            src={logo}
            alt={BRAND.shortName}
            className="h-11 w-11 flex-shrink-0 rounded-md object-cover ring-1 ring-white/15"
          />

          {!collapsed && (
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black leading-tight tracking-wide text-white">
                {BRAND.shortName}
              </h2>
              <p className="truncate text-xs font-bold uppercase text-indigo-300">
                Admin Portal
              </p>
            </div>
          )}
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-white/10 text-slate-200 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Close admin navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="py-2">
            {collapsed ? (
              <div className="mx-3 my-2 h-px bg-white/10" aria-hidden="true" />
            ) : (
              <p className="px-3 pb-2 text-[11px] font-black uppercase text-slate-500">
                {group.label}
              </p>
            )}

            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      title={collapsed ? item.name : ''}
                      className={`relative flex min-h-11 items-center gap-3 rounded-md text-sm font-bold transition-colors ${
                        collapsed ? 'justify-center px-0' : 'px-3'
                      } ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <span
                          className="absolute bottom-2 left-0 top-2 w-1 rounded-r bg-red-500"
                          aria-hidden="true"
                        />
                      )}

                      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />

                      {!collapsed && (
                        <span className="min-w-0 flex-1 truncate">
                          {item.name}
                        </span>
                      )}

                      {!collapsed && item.masterOnly && (
                        <ShieldCheck className="h-4 w-4 flex-shrink-0 text-red-200" aria-hidden="true" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden min-h-10 items-center rounded-md text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white md:flex ${
            collapsed ? 'w-full justify-center' : 'w-full justify-between px-3'
          }`}
          aria-label={collapsed ? 'Expand admin navigation' : 'Collapse admin navigation'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          ) : (
            <>
              <span>Collapse</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </button>

        {collapsed ? (
          <button
            type="button"
            onClick={() => setShowPwModal(true)}
            className="mt-2 hidden h-10 w-full items-center justify-center rounded-md bg-white/10 text-slate-200 transition-colors hover:bg-indigo-600 hover:text-white md:flex"
            title="Change Password"
            aria-label="Change Password"
          >
            <Key className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : (
          <div className="mt-3 rounded-md bg-white/5 p-3 ring-1 ring-white/10">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600/20 text-indigo-200">
                <Activity className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-white">Secure Session</p>
                <p className="truncate text-xs font-semibold text-slate-400">
                  {isBossAdmin ? 'Master access active' : 'Admin access active'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPwModal(true)}
              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-white/10 px-3 text-xs font-black uppercase text-white transition-colors hover:bg-indigo-600"
            >
              <Key className="h-4 w-4" aria-hidden="true" />
              Change Password
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <MotionAside
        initial={false}
        animate={{ width: isCollapsed ? 84 : 288 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative z-30 hidden min-h-screen flex-shrink-0 overflow-hidden bg-slate-950 md:block"
      >
        {sidebarContent(isCollapsed)}
      </MotionAside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/70 md:hidden"
            />

            <MotionAside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.38 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden bg-slate-950 shadow-2xl md:hidden"
            >
              {sidebarContent(false, true)}
            </MotionAside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPwModal && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4"
          >
            <MotionDiv
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-md rounded-md bg-white p-5 shadow-2xl sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="change-password-title"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
                    <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 id="change-password-title" className="text-xl font-black text-slate-950">
                    Change Password
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    You will sign in again after the password is changed.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-950"
                  aria-label="Close password modal"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {pwError && (
                <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                  {pwError}
                </div>
              )}

              <form onSubmit={handlePwChange} className="space-y-4">
                <PasswordInput
                  label="Current Password"
                  value={pwData.current_password}
                  onChange={(value) => updatePasswordField('current_password', value)}
                  autoComplete="current-password"
                />
                <PasswordInput
                  label="New Password"
                  value={pwData.new_password}
                  onChange={(value) => updatePasswordField('new_password', value)}
                  autoComplete="new-password"
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={pwData.confirm}
                  onChange={(value) => updatePasswordField('confirm', value)}
                  autoComplete="new-password"
                />

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pwLoading ? 'Saving...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-950"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

const PasswordInput = ({
  label,
  value,
  onChange,
  autoComplete,
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-black uppercase text-slate-500">
      {label}
    </span>
    <input
      type="password"
      required
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
      className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-950 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
    />
  </label>
);

export default AdminSidebar;
