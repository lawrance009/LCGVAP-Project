import { createElement, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import api, { getSignedFileUrl } from '../services/api';
import getFileUrl from '../utils/getFileUrl';

const MotionDiv = motion.div;
const MotionTr = motion.tr;
const MotionButton = motion.button;

const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not recorded'
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getFullName = (user) => `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Graduate';

const getInitials = (user) => {
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'GR';
};

const statStyles = {
  amber: {
    icon: 'bg-amber-50 text-amber-700',
    value: 'text-amber-700',
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-700',
    value: 'text-indigo-700',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-800',
    value: 'text-slate-950',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-700',
    value: 'text-blue-700',
  },
  red: {
    icon: 'bg-red-50 text-red-700',
    value: 'text-red-700',
  },
};

const quickLinks = [
  {
    label: 'Verified Graduates',
    description: 'Review approved alumni records',
    path: '/patron/graduates',
    icon: GraduationCap,
  },
  {
    label: 'Degree Review',
    description: 'Open credential submissions',
    path: '/patron/degrees',
    icon: FileText,
  },
  {
    label: 'Universities',
    description: 'Manage institution records',
    path: '/patron/universities',
    icon: Building2,
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    universities: 0,
    departments: 0,
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingReviewCount = pendingUsers.length;
  const approvalRate = useMemo(() => {
    const total = Number(stats.total || 0);
    if (!total) return 0;
    return Math.min(100, Math.round((Number(stats.verified || 0) / total) * 100));
  }, [stats.total, stats.verified]);

  const statCards = useMemo(() => [
    {
      icon: Clock,
      label: 'Pending Review',
      value: pendingReviewCount,
      tone: 'amber',
      note: pendingReviewCount === 1 ? 'submission waiting' : 'submissions waiting',
    },
    {
      icon: BadgeCheck,
      label: 'Verified Graduates',
      value: stats.verified,
      tone: 'indigo',
      note: 'approved records',
    },
    {
      icon: GraduationCap,
      label: 'Total Graduates',
      value: stats.total,
      tone: 'slate',
      note: 'system records',
    },
    {
      icon: Building2,
      label: 'Universities',
      value: stats.universities,
      tone: 'blue',
      note: 'institution profiles',
    },
    {
      icon: BookOpen,
      label: 'Departments',
      value: stats.departments,
      tone: 'red',
      note: 'academic departments',
    },
  ], [pendingReviewCount, stats]);

  async function fetchDashboardData() {
    setLoading(true);

    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/users/pending'),
      ]);

      setStats({
        total: Number(statsRes.data?.total || 0),
        pending: Number(statsRes.data?.pending || 0),
        verified: Number(statsRes.data?.verified || 0),
        universities: Number(statsRes.data?.universities || 0),
        departments: Number(statsRes.data?.departments || 0),
      });
      setPendingUsers(Array.isArray(pendingRes.data) ? pendingRes.data : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Swal.fire('Error', 'Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const removePendingUser = (userId) => {
    setPendingUsers((current) => current.filter((user) => user.id !== userId));
    setStats((current) => ({
      ...current,
      pending: Math.max(0, Number(current.pending || 0) - 1),
    }));
  };

  const handleVerify = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Verify Graduate?',
      text: `Are you sure you want to verify ${userName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Yes, verify',
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/users/${userId}/verify`, {});
      removePendingUser(userId);
      setStats((current) => ({
        ...current,
        verified: Number(current.verified || 0) + 1,
      }));

      Swal.fire('Verified', `${userName} has been verified successfully.`, 'success');
    } catch (error) {
      console.error('Verification failed:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to verify user.', 'error');
    }
  };

  const handleReject = async (userId, userName) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Graduate?',
      text: `Please provide a reason for rejecting ${userName}:`,
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Type your reason here...',
      inputAttributes: {
        'aria-label': 'Type your reason here',
      },
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4f46e5',
      confirmButtonText: 'Yes, reject',
      inputValidator: (value) => {
        if (!value) return 'You need to write a reason.';
        if (value.trim().length < 5) return 'Rejection reason must be at least 5 characters.';
        return undefined;
      },
    });

    if (!reason) return;

    try {
      await api.put(`/users/${userId}/reject`, { reason });
      removePendingUser(userId);

      Swal.fire(
        'Rejected',
        `${userName} has been rejected, all active sessions were revoked, and the account was removed. They can re-register after correcting the issue.`,
        'success'
      );
    } catch (error) {
      console.error('Rejection failed:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to reject user.', 'error');
    }
  };

  const openDegreeFile = (fileUrl) => {
    if (!fileUrl) return;

    (async () => {
      try {
        let url = fileUrl;
        if (!url.startsWith('http')) {
          url = getFileUrl(fileUrl);
        }
        url = await getSignedFileUrl(url);
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Failed to open degree file:', error);
        Swal.fire('Error', 'Failed to open certificate file.', 'error');
      }
    })();
  };

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6">
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"
      >
        <section className="rounded-md bg-slate-950 p-5 text-white shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-200">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Verification Command Center
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-black leading-tight sm:text-3xl">
                Review graduate submissions with confidence.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {pendingReviewCount > 0
                  ? `${pendingReviewCount} graduate ${pendingReviewCount === 1 ? 'record needs' : 'records need'} a decision.`
                  : 'No graduate record is waiting for review right now.'}
              </p>
            </div>

            <Link
              to="/patron/degrees"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black text-slate-950 transition-colors hover:bg-indigo-50 hover:text-indigo-800"
            >
              Degree Review
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="rounded-md bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-slate-500">Approval Rate</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{approvalRate}%</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-md bg-slate-100">
            <div
              className="h-full rounded-md bg-indigo-600 transition-all duration-500"
              style={{ width: `${approvalRate}%` }}
            />
          </div>

          <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
            {formatNumber(stats.verified)} verified out of {formatNumber(stats.total)} total graduate records.
          </p>
        </section>
      </MotionDiv>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {statCards.map((card, index) => (
          <StatCard key={card.label} {...card} delay={index * 0.05} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-700">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Pending Verification Queue
              </div>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                Graduate Submissions
              </h2>
            </div>

            <span className="inline-flex h-9 items-center gap-2 rounded-md bg-amber-50 px-3 text-sm font-black text-amber-700">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {formatNumber(pendingReviewCount)} Pending
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <EmptyQueue />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <TableHeader>Graduate</TableHeader>
                      <TableHeader>Academic Details</TableHeader>
                      <TableHeader>Submitted</TableHeader>
                      <TableHeader>Documents</TableHeader>
                      <TableHeader align="right">Actions</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <AnimatePresence initial={false}>
                      {pendingUsers.map((user) => (
                        <QueueTableRow
                          key={user.id}
                          user={user}
                          onOpenDegreeFile={openDegreeFile}
                          onVerify={handleVerify}
                          onReject={handleReject}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-200 lg:hidden">
                <AnimatePresence initial={false}>
                  {pendingUsers.map((user) => (
                    <QueueMobileRow
                      key={user.id}
                      user={user}
                      onOpenDegreeFile={openDegreeFile}
                      onVerify={handleVerify}
                      onReject={handleReject}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-md bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-800">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Queue Health</p>
                <h2 className="text-lg font-black text-slate-950">
                  {pendingReviewCount > 0 ? 'Review Needed' : 'Queue Clear'}
                </h2>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              <MetricRow label="Waiting Records" value={pendingReviewCount} />
              <MetricRow label="Verified Records" value={stats.verified} />
              <MetricRow label="Institutions" value={stats.universities} />
            </div>
          </section>

          <section className="rounded-md bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="mb-3 text-xs font-black uppercase text-slate-500">Quick Access</p>
            <div className="divide-y divide-slate-200">
              {quickLinks.map((item) => (
                <QuickLink key={item.path} {...item} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

const DashboardLoading = () => (
  <div className="space-y-6">
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="h-44 animate-pulse rounded-md bg-slate-200" />
      <div className="h-44 animate-pulse rounded-md bg-slate-200" />
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-36 animate-pulse rounded-md bg-slate-200" />
      ))}
    </div>
    <div className="h-96 animate-pulse rounded-md bg-slate-200" />
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone,
  note,
  delay,
}) => {
  const style = statStyles[tone] || statStyles.slate;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className="rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
    >
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md ${style.icon}`}>
        {createElement(Icon, {
          className: 'h-5 w-5',
          'aria-hidden': 'true',
        })}
      </div>
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-black leading-none ${style.value}`}>
        {formatNumber(value)}
      </p>
      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{note}</p>
    </MotionDiv>
  );
};

const TableHeader = ({ children, align = 'left' }) => (
  <th
    className={`px-5 py-3 text-xs font-black uppercase text-slate-500 ${
      align === 'right' ? 'text-right' : 'text-left'
    }`}
    scope="col"
  >
    {children}
  </th>
);

const QueueTableRow = ({
  user,
  onOpenDegreeFile,
  onVerify,
  onReject,
}) => {
  const fullName = getFullName(user);

  return (
    <MotionTr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22 }}
      className="hover:bg-slate-50"
    >
      <td className="px-5 py-4">
        <GraduateIdentity user={user} />
      </td>
      <td className="px-5 py-4">
        <AcademicDetails user={user} />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {formatDate(user.created_at)}
        </div>
      </td>
      <td className="px-5 py-4">
        <DocumentButton fileUrl={user.degree_file} onOpenDegreeFile={onOpenDegreeFile} />
      </td>
      <td className="px-5 py-4">
        <DecisionButtons
          fullName={fullName}
          userId={user.id}
          onVerify={onVerify}
          onReject={onReject}
          compact
        />
      </td>
    </MotionTr>
  );
};

const QueueMobileRow = ({
  user,
  onOpenDegreeFile,
  onVerify,
  onReject,
}) => {
  const fullName = getFullName(user);

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22 }}
      className="p-4"
    >
      <GraduateIdentity user={user} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <AcademicDetails user={user} />
        <div className="text-sm font-semibold text-slate-600">
          <p className="mb-1 text-xs font-black uppercase text-slate-400">Submitted</p>
          {formatDate(user.created_at)}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DocumentButton fileUrl={user.degree_file} onOpenDegreeFile={onOpenDegreeFile} />
        <DecisionButtons
          fullName={fullName}
          userId={user.id}
          onVerify={onVerify}
          onReject={onReject}
        />
      </div>
    </MotionDiv>
  );
};

const GraduateIdentity = ({ user }) => (
  <div className="flex min-w-0 items-center gap-3">
    {user.profile_photo ? (
      <img
        className="h-11 w-11 flex-shrink-0 rounded-md object-cover"
        src={getFileUrl(user.profile_photo)}
        alt=""
      />
    ) : (
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-sm font-black text-indigo-700">
        {getInitials(user)}
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-black text-slate-950">{getFullName(user)}</p>
      <p className="truncate text-sm font-semibold text-slate-500">{user.email || 'No email recorded'}</p>
    </div>
  </div>
);

const AcademicDetails = ({ user }) => (
  <div className="min-w-0">
    <p className="truncate text-sm font-black text-slate-950">{user.degree_type || 'Degree not recorded'}</p>
    <p className="truncate text-sm font-semibold text-slate-600">
      {user.department_name || 'Department not recorded'}
    </p>
    <p className="truncate text-xs font-semibold text-slate-400">
      {user.university_name || 'University not recorded'}
    </p>
  </div>
);

const DocumentButton = ({ fileUrl, onOpenDegreeFile }) => (
  <MotionButton
    type="button"
    onClick={() => onOpenDegreeFile(fileUrl)}
    disabled={!fileUrl}
    whileHover={fileUrl ? { y: -1 } : undefined}
    whileTap={fileUrl ? { scale: 0.98 } : undefined}
    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-100 px-3 text-sm font-black text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-800 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-slate-100"
  >
    <Eye className="h-4 w-4" aria-hidden="true" />
    Certificate
  </MotionButton>
);

const DecisionButtons = ({
  fullName,
  userId,
  onVerify,
  onReject,
  compact = false,
}) => (
  <div className={`flex gap-2 ${compact ? 'justify-end' : 'sm:justify-end'}`}>
    <MotionButton
      type="button"
      onClick={() => onVerify(userId, fullName)}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 text-sm font-black text-white transition-colors hover:bg-indigo-700"
    >
      <Check className="h-4 w-4" aria-hidden="true" />
      Verify
    </MotionButton>
    <MotionButton
      type="button"
      onClick={() => onReject(userId, fullName)}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-3 text-sm font-black text-white transition-colors hover:bg-red-700"
    >
      <X className="h-4 w-4" aria-hidden="true" />
      Reject
    </MotionButton>
  </div>
);

const EmptyQueue = () => (
  <div className="px-5 py-14 text-center">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
      <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
    </div>
    <h3 className="text-lg font-black text-slate-950">Verification queue is clear</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      New graduate submissions will appear here when they are ready for admin review.
    </p>
  </div>
);

const MetricRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <span className="text-sm font-semibold text-slate-500">{label}</span>
    <span className="text-sm font-black text-slate-950">{formatNumber(value)}</span>
  </div>
);

const QuickLink = ({
  label,
  description,
  path,
  icon: Icon,
}) => (
  <Link
    to={path}
    className="flex items-center gap-3 py-3 transition-colors hover:text-indigo-700"
  >
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
      {createElement(Icon, {
        className: 'h-4 w-4',
        'aria-hidden': 'true',
      })}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-black text-slate-950">{label}</span>
      <span className="block truncate text-xs font-semibold text-slate-500">{description}</span>
    </span>
    <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
  </Link>
);

export default Dashboard;
