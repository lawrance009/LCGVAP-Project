import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  Archive,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import api, { getSignedFileUrl } from '../../services/api';
import getFileUrl from '../../utils/getFileUrl';

const MotionDiv = motion.div;
const MotionAside = motion.aside;
const MotionButton = motion.button;
const MotionTr = motion.tr;

const degreeOptions = ['Bachelor', 'Master', 'PhD'];

const emptyEditForm = {
  first_name: '',
  last_name: '',
  email: '',
  university_id: '',
  department_id: '',
  degree_type: 'Bachelor',
  graduation_year: '',
  bio: '',
};

const getFullName = (graduate) => (
  `${graduate?.first_name || ''} ${graduate?.last_name || ''}`.trim() || 'Graduate'
);

const getInitials = (graduate) => {
  const first = graduate?.first_name?.[0] || '';
  const last = graduate?.last_name?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'GR';
};

const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'N/A'
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const dedupeDepartmentsByName = (departments) => {
  const map = new Map();

  departments.forEach((department) => {
    const key = normalizeText(department.name);
    if (!key || map.has(key)) return;
    map.set(key, department);
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const getScopedDepartments = (departments, universityId) => {
  if (!universityId) return dedupeDepartmentsByName(departments);

  const selectedUniversityId = String(universityId);
  const departmentsByName = new Map();

  departments.forEach((department) => {
    const departmentUniversityId = department.university_id ? String(department.university_id) : '';
    const isGlobal = !departmentUniversityId;
    const isForSelectedUniversity = departmentUniversityId === selectedUniversityId;

    if (!isGlobal && !isForSelectedUniversity) return;

    const key = normalizeText(department.name);
    if (!key) return;

    const existing = departmentsByName.get(key);
    if (!existing || isForSelectedUniversity) {
      departmentsByName.set(key, department);
    }
  });

  return Array.from(departmentsByName.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const AdminVerifiedGraduates = () => {
  const [mode, setMode] = useState('active');
  const [records, setRecords] = useState({ active: [], archived: [] });
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [selectedGraduate, setSelectedGraduate] = useState(null);
  const [drawerMode, setDrawerMode] = useState('view');
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [filters, setFilters] = useState({
    search: '',
    university_id: '',
    department_name: '',
    degree_type: '',
  });

  const graduates = records[mode];
  const isArchiveMode = mode === 'archived';

  const activeUniversityCount = useMemo(() => (
    new Set(records.active.map((graduate) => graduate.university_name).filter(Boolean)).size
  ), [records.active]);

  const departmentFilterOptions = useMemo(() => (
    getScopedDepartments(departments, filters.university_id)
  ), [departments, filters.university_id]);

  const availableEditDepartments = useMemo(() => (
    getScopedDepartments(departments, editForm.university_id)
  ), [departments, editForm.university_id]);

  const filteredGraduates = useMemo(() => {
    const search = normalizeText(filters.search);
    const universityId = String(filters.university_id || '');
    const departmentName = normalizeText(filters.department_name);
    const degreeType = normalizeText(filters.degree_type);

    return graduates.filter((graduate) => {
      const matchesSearch = !search || [
        getFullName(graduate),
        graduate.email,
        graduate.passport_number,
        graduate.university_name,
        graduate.department_name,
        graduate.degree_type,
        graduate.graduation_year,
      ].some((value) => normalizeText(value).includes(search));

      const matchesUniversity = !universityId || String(graduate.university_id || '') === universityId;
      const matchesDepartment = !departmentName || normalizeText(graduate.department_name) === departmentName;
      const matchesDegree = !degreeType || normalizeText(graduate.degree_type) === degreeType;

      return matchesSearch && matchesUniversity && matchesDepartment && matchesDegree;
    });
  }, [filters, graduates]);

  const fetchGraduates = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);

    try {
      const [activeRes, archivedRes] = await Promise.all([
        api.get('/users/graduates'),
        api.get('/users/graduates/archive'),
      ]);

      setRecords({
        active: Array.isArray(activeRes.data) ? activeRes.data : [],
        archived: Array.isArray(archivedRes.data) ? archivedRes.data : [],
      });
    } catch (error) {
      console.error('Error fetching graduates:', error);
      Swal.fire('Error', 'Failed to fetch graduates.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchSupportingData = useCallback(async () => {
    try {
      const [universitiesRes, departmentsRes] = await Promise.all([
        api.get('/universities'),
        api.get('/departments'),
      ]);

      setUniversities(Array.isArray(universitiesRes.data) ? universitiesRes.data : []);
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
    } catch (error) {
      console.warn('Failed to load graduate edit dropdowns:', error);
    }
  }, []);

  useEffect(() => {
    fetchSupportingData();
    fetchGraduates();
  }, [fetchGraduates, fetchSupportingData]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === 'university_id' ? { department_name: '' } : {}),
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      university_id: '',
      department_name: '',
      degree_type: '',
    });
  };

  const closeDrawer = () => {
    setSelectedGraduate(null);
    setDrawerMode('view');
    setEditForm(emptyEditForm);
  };

  const openDrawer = (graduate, nextDrawerMode = 'view') => {
    setSelectedGraduate(graduate);
    setDrawerMode(nextDrawerMode);

    if (nextDrawerMode === 'edit') {
      setEditForm({
        first_name: graduate.first_name || '',
        last_name: graduate.last_name || '',
        email: graduate.email || '',
        university_id: graduate.university_id || '',
        department_id: graduate.department_id || '',
        degree_type: graduate.degree_type || 'Bachelor',
        graduation_year: graduate.graduation_year || '',
        bio: graduate.bio || '',
      });
    }
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    closeDrawer();
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'university_id' ? { department_id: '' } : {}),
    }));
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!selectedGraduate) return;

    const actionKey = `edit-${selectedGraduate.id}`;
    setActionLoading(actionKey);

    try {
      const payload = {
        ...editForm,
        university_id: editForm.university_id || null,
        department_id: editForm.department_id || null,
        graduation_year: editForm.graduation_year || null,
      };

      await api.put(`/users/graduates/${selectedGraduate.id}`, payload);
      await fetchGraduates({ silent: true });
      closeDrawer();
      Swal.fire('Saved', 'Graduate updated successfully.', 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to update graduate.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleArchiveGraduate = async (graduate) => {
    const name = getFullName(graduate);
    const result = await Swal.fire({
      title: `Archive ${name}?`,
      text: 'This removes the graduate from active and public views, but keeps the record available for restore.',
      input: 'textarea',
      inputPlaceholder: 'Reason, optional',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4f46e5',
      confirmButtonText: 'Archive graduate',
    });

    if (!result.isConfirmed) return;

    const actionKey = `archive-${graduate.id}`;
    setActionLoading(actionKey);

    try {
      await api.delete(`/users/graduates/${graduate.id}`, {
        data: { reason: result.value || null },
      });
      await fetchGraduates({ silent: true });
      if (selectedGraduate?.id === graduate.id) closeDrawer();
      Swal.fire('Archived', `${name}'s record moved to archive.`, 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to archive graduate.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleRestoreGraduate = async (graduate) => {
    const name = getFullName(graduate);
    const result = await Swal.fire({
      title: `Restore ${name}?`,
      text: 'This moves the graduate back into the active verified graduates list.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Restore graduate',
    });

    if (!result.isConfirmed) return;

    const actionKey = `restore-${graduate.id}`;
    setActionLoading(actionKey);

    try {
      await api.put(`/users/graduates/${graduate.id}/restore`);
      await fetchGraduates({ silent: true });
      if (selectedGraduate?.id === graduate.id) closeDrawer();
      Swal.fire('Restored', `${name}'s record is active again.`, 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to restore graduate.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handlePermanentDeleteGraduate = async (graduate) => {
    const name = getFullName(graduate);
    const result = await Swal.fire({
      title: `Permanently delete ${name}?`,
      text: 'This wipes the archived graduate record and related graduate data from the system. This cannot be restored.',
      icon: 'error',
      input: 'text',
      inputPlaceholder: 'Type DELETE to confirm',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4f46e5',
      confirmButtonText: 'Delete permanently',
      inputValidator: (value) => {
        if (value !== 'DELETE') return 'Type DELETE to confirm permanent deletion.';
        return undefined;
      },
    });

    if (!result.isConfirmed) return;

    const actionKey = `delete-${graduate.id}`;
    setActionLoading(actionKey);

    try {
      await api.delete(`/users/graduates/${graduate.id}/permanent`);
      await fetchGraduates({ silent: true });
      if (selectedGraduate?.id === graduate.id) closeDrawer();
      Swal.fire('Deleted', `${name}'s archived record has been permanently deleted.`, 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to permanently delete graduate.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const openDegreeFile = async (degreeFile) => {
    if (!degreeFile) {
      Swal.fire('Unavailable', 'No degree certificate is attached to this graduate.', 'info');
      return;
    }

    try {
      const rawUrl = degreeFile.startsWith('http') ? degreeFile : getFileUrl(degreeFile);
      const url = await getSignedFileUrl(rawUrl);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open certificate:', error);
      Swal.fire('Error', 'Failed to open degree certificate.', 'error');
    }
  };

  if (loading) {
    return <GraduatesLoading />;
  }

  return (
    <div className="space-y-6">
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-md bg-slate-950 p-5 text-white shadow-sm"
      >
        <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-200">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Graduate Records
        </div>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-black leading-tight sm:text-3xl">
              Manage verified graduates and archived records.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Active records appear in the public directory. Archived records are hidden until restored or permanently deleted.
            </p>
          </div>

          <ModeSwitch
            mode={mode}
            activeCount={records.active.length}
            archivedCount={records.archived.length}
            onChange={handleModeChange}
          />
        </div>
      </MotionDiv>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile
          icon={BadgeCheck}
          label="Active Verified"
          value={records.active.length}
          tone="indigo"
        />
        <SummaryTile
          icon={Archive}
          label="Archived"
          value={records.archived.length}
          tone="amber"
        />
        <SummaryTile
          icon={Building2}
          label="Universities"
          value={activeUniversityCount}
          tone="blue"
        />
        <SummaryTile
          icon={Search}
          label="Current Results"
          value={filteredGraduates.length}
          tone="slate"
        />
      </div>

      <section className="rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_220px_180px_auto]">
          <SearchField
            value={filters.search}
            onChange={(value) => updateFilter('search', value)}
          />
          <SelectField
            label="University"
            value={filters.university_id}
            onChange={(value) => updateFilter('university_id', value)}
          >
            <option value="">All Universities</option>
            {universities.map((university) => (
              <option key={university.id} value={university.id}>
                {university.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Department"
            value={filters.department_name}
            onChange={(value) => updateFilter('department_name', value)}
          >
            <option value="">All Departments</option>
            {departmentFilterOptions.map((department) => (
              <option key={`${department.id}-${department.name}`} value={department.name}>
                {department.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Degree"
            value={filters.degree_type}
            onChange={(value) => updateFilter('degree_type', value)}
          >
            <option value="">All Degrees</option>
            {degreeOptions.map((degree) => (
              <option key={degree} value={degree}>
                {degree}
              </option>
            ))}
          </SelectField>
          <button
            type="button"
            onClick={resetFilters}
            className="h-11 rounded-md bg-slate-100 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-200 lg:self-end"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-xs font-black uppercase text-indigo-700">
              {isArchiveMode ? 'Archive' : 'Active Directory Records'}
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              {isArchiveMode ? 'Archived Graduates' : 'Verified Graduates'}
            </h2>
          </div>
          <p className="rounded-md bg-slate-100 px-3 py-2 text-sm font-black text-slate-700">
            {formatNumber(filteredGraduates.length)} of {formatNumber(graduates.length)} shown
          </p>
        </div>

        {filteredGraduates.length === 0 ? (
          <EmptyState mode={mode} hasRecords={graduates.length > 0} />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <TableHeader>Graduate</TableHeader>
                    <TableHeader>Institution</TableHeader>
                    <TableHeader>Degree</TableHeader>
                    <TableHeader>{isArchiveMode ? 'Archived' : 'Verified'}</TableHeader>
                    <TableHeader>Passport</TableHeader>
                    <TableHeader align="right">Actions</TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <AnimatePresence initial={false}>
                    {filteredGraduates.map((graduate) => (
                      <GraduateTableRow
                        key={graduate.id}
                        graduate={graduate}
                        mode={mode}
                        actionLoading={actionLoading}
                        onView={() => openDrawer(graduate, 'view')}
                        onEdit={() => openDrawer(graduate, 'edit')}
                        onArchive={() => handleArchiveGraduate(graduate)}
                        onRestore={() => handleRestoreGraduate(graduate)}
                        onPermanentDelete={() => handlePermanentDeleteGraduate(graduate)}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 lg:hidden">
              <AnimatePresence initial={false}>
                {filteredGraduates.map((graduate) => (
                  <GraduateMobileCard
                    key={graduate.id}
                    graduate={graduate}
                    mode={mode}
                    actionLoading={actionLoading}
                    onView={() => openDrawer(graduate, 'view')}
                    onEdit={() => openDrawer(graduate, 'edit')}
                    onArchive={() => handleArchiveGraduate(graduate)}
                    onRestore={() => handleRestoreGraduate(graduate)}
                    onPermanentDelete={() => handlePermanentDeleteGraduate(graduate)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </section>

      <GraduateDrawer
        graduate={selectedGraduate}
        mode={mode}
        drawerMode={drawerMode}
        editForm={editForm}
        universities={universities}
        departments={availableEditDepartments}
        actionLoading={actionLoading}
        onClose={closeDrawer}
        onEdit={() => openDrawer(selectedGraduate, 'edit')}
        onView={() => setDrawerMode('view')}
        onEditChange={handleEditChange}
        onSaveEdit={handleSaveEdit}
        onOpenDegreeFile={openDegreeFile}
        onArchive={handleArchiveGraduate}
        onRestore={handleRestoreGraduate}
        onPermanentDelete={handlePermanentDeleteGraduate}
      />
    </div>
  );
};

const GraduatesLoading = () => (
  <div className="space-y-6">
    <div className="h-44 animate-pulse rounded-md bg-slate-200" />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-md bg-slate-200" />
      ))}
    </div>
    <div className="h-96 animate-pulse rounded-md bg-slate-200" />
  </div>
);

const ModeSwitch = ({
  mode,
  activeCount,
  archivedCount,
  onChange,
}) => (
  <div className="grid w-full grid-cols-2 rounded-md bg-white/10 p-1 sm:w-auto">
    <button
      type="button"
      onClick={() => onChange('active')}
      className={`h-10 rounded-md px-3 text-sm font-black transition-colors ${
        mode === 'active' ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'
      }`}
    >
      Active {formatNumber(activeCount)}
    </button>
    <button
      type="button"
      onClick={() => onChange('archived')}
      className={`h-10 rounded-md px-3 text-sm font-black transition-colors ${
        mode === 'archived' ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'
      }`}
    >
      Archive {formatNumber(archivedCount)}
    </button>
  </div>
);

const SummaryTile = ({
  icon,
  label,
  value,
  tone,
}) => {
  const styles = {
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    slate: 'bg-slate-100 text-slate-800',
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md ${styles[tone] || styles.slate}`}>
        {createElement(icon, {
          className: 'h-5 w-5',
          'aria-hidden': 'true',
        })}
      </div>
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black leading-none text-slate-950">{formatNumber(value)}</p>
    </MotionDiv>
  );
};

const SearchField = ({ value, onChange }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-black uppercase text-slate-500">Search</span>
    <span className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Name, email, passport, university"
        className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
      />
    </span>
  </label>
);

const SelectField = ({
  label,
  value,
  onChange,
  children,
}) => (
  <label className="block min-w-0">
    <span className="mb-2 block text-xs font-black uppercase text-slate-500">{label}</span>
    <span className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-3 pr-9 text-sm font-semibold text-slate-950 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
    </span>
  </label>
);

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

const GraduateTableRow = ({
  graduate,
  mode,
  actionLoading,
  onView,
  onEdit,
  onArchive,
  onRestore,
  onPermanentDelete,
}) => (
  <MotionTr
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, x: -16 }}
    transition={{ duration: 0.2 }}
    className="hover:bg-slate-50"
  >
    <td className="px-5 py-4">
      <GraduateIdentity graduate={graduate} />
    </td>
    <td className="px-5 py-4">
      <InstitutionBlock graduate={graduate} />
    </td>
    <td className="px-5 py-4">
      <DegreeBlock graduate={graduate} />
    </td>
    <td className="px-5 py-4">
      <DateBlock
        mode={mode}
        verifiedAt={graduate.verified_at}
        archivedAt={graduate.archived_at}
        reason={graduate.archive_reason}
      />
    </td>
    <td className="px-5 py-4">
      <span className="font-mono text-sm font-bold text-slate-600">
        {graduate.passport_number || 'N/A'}
      </span>
    </td>
    <td className="px-5 py-4">
      <RecordActions
        graduate={graduate}
        mode={mode}
        actionLoading={actionLoading}
        onView={onView}
        onEdit={onEdit}
        onArchive={onArchive}
        onRestore={onRestore}
        onPermanentDelete={onPermanentDelete}
        compact
      />
    </td>
  </MotionTr>
);

const GraduateMobileCard = ({
  graduate,
  mode,
  actionLoading,
  onView,
  onEdit,
  onArchive,
  onRestore,
  onPermanentDelete,
}) => (
  <MotionDiv
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -16 }}
    transition={{ duration: 0.2 }}
    className="p-4"
  >
    <GraduateIdentity graduate={graduate} />
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <InstitutionBlock graduate={graduate} />
      <DegreeBlock graduate={graduate} />
      <DateBlock
        mode={mode}
        verifiedAt={graduate.verified_at}
        archivedAt={graduate.archived_at}
        reason={graduate.archive_reason}
      />
      <div>
        <p className="mb-1 text-xs font-black uppercase text-slate-400">Passport</p>
        <p className="font-mono text-sm font-bold text-slate-700">{graduate.passport_number || 'N/A'}</p>
      </div>
    </div>
    <div className="mt-4">
      <RecordActions
        graduate={graduate}
        mode={mode}
        actionLoading={actionLoading}
        onView={onView}
        onEdit={onEdit}
        onArchive={onArchive}
        onRestore={onRestore}
        onPermanentDelete={onPermanentDelete}
      />
    </div>
  </MotionDiv>
);

const GraduateIdentity = ({ graduate }) => (
  <div className="flex min-w-0 items-center gap-3">
    {graduate.profile_photo ? (
      <img
        className="h-11 w-11 flex-shrink-0 rounded-md object-cover"
        src={getFileUrl(graduate.profile_photo)}
        alt=""
      />
    ) : (
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-sm font-black text-indigo-700">
        {getInitials(graduate)}
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-black text-slate-950">{getFullName(graduate)}</p>
      <p className="truncate text-sm font-semibold text-slate-500">{graduate.email || 'No email recorded'}</p>
    </div>
  </div>
);

const InstitutionBlock = ({ graduate }) => (
  <div className="min-w-0">
    <p className="truncate text-sm font-black text-slate-950">{graduate.university_name || 'N/A'}</p>
    <p className="truncate text-sm font-semibold text-slate-500">{graduate.department_name || 'N/A'}</p>
  </div>
);

const DegreeBlock = ({ graduate }) => (
  <div className="min-w-0">
    <span className="inline-flex rounded-md bg-indigo-50 px-2 py-1 text-xs font-black uppercase text-indigo-700">
      {graduate.degree_type || 'Degree'}
    </span>
    <p className="mt-2 text-sm font-semibold text-slate-500">
      Class of {graduate.graduation_year || 'N/A'}
    </p>
  </div>
);

const DateBlock = ({
  mode,
  verifiedAt,
  archivedAt,
  reason,
}) => (
  <div className="min-w-0">
    <p className="text-sm font-black text-slate-950">
      {formatDate(mode === 'archived' ? archivedAt : verifiedAt)}
    </p>
    <p className="truncate text-xs font-semibold text-slate-500">
      {mode === 'archived' ? reason || 'No archive reason' : 'Verified record'}
    </p>
  </div>
);

const RecordActions = ({
  graduate,
  mode,
  actionLoading,
  onView,
  onEdit,
  onArchive,
  onRestore,
  onPermanentDelete,
  compact = false,
}) => {
  const isActive = mode === 'active';

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? 'justify-end' : ''}`}>
      <ActionButton icon={Eye} label="View" onClick={onView} />
      {isActive ? (
        <>
          <ActionButton icon={Edit3} label="Edit" onClick={onEdit} tone="slate" />
          <ActionButton
            icon={Archive}
            label="Archive"
            onClick={onArchive}
            tone="danger"
            loading={actionLoading === `archive-${graduate.id}`}
          />
        </>
      ) : (
        <>
          <ActionButton
            icon={RotateCcw}
            label="Restore"
            onClick={onRestore}
            tone="primary"
            loading={actionLoading === `restore-${graduate.id}`}
          />
          <ActionButton
            icon={Trash2}
            label="Delete"
            onClick={onPermanentDelete}
            tone="danger"
            loading={actionLoading === `delete-${graduate.id}`}
          />
        </>
      )}
    </div>
  );
};

const ActionButton = ({
  icon,
  label,
  onClick,
  tone = 'primary',
  loading = false,
}) => {
  const styles = {
    primary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    slate: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100',
  };

  return (
    <MotionButton
      type="button"
      onClick={onClick}
      disabled={loading}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-black uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles[tone]}`}
    >
      {createElement(icon, {
        className: 'h-4 w-4',
        'aria-hidden': 'true',
      })}
      {loading ? 'Working' : label}
    </MotionButton>
  );
};

const EmptyState = ({ mode, hasRecords }) => (
  <div className="px-5 py-14 text-center">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
      {mode === 'archived' ? (
        <Archive className="h-6 w-6" aria-hidden="true" />
      ) : (
        <GraduationCap className="h-6 w-6" aria-hidden="true" />
      )}
    </div>
    <h3 className="text-lg font-black text-slate-950">
      {hasRecords ? 'No matching graduates' : mode === 'archived' ? 'Archive is empty' : 'No verified graduates yet'}
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {hasRecords
        ? 'Try adjusting the search or filters to show more records.'
        : mode === 'archived'
          ? 'Archived graduates will appear here after they are removed from active public records.'
          : 'Verified graduates will appear here once admin approval is complete.'}
    </p>
  </div>
);

const GraduateDrawer = ({
  graduate,
  mode,
  drawerMode,
  editForm,
  universities,
  departments,
  actionLoading,
  onClose,
  onEdit,
  onView,
  onEditChange,
  onSaveEdit,
  onOpenDegreeFile,
  onArchive,
  onRestore,
  onPermanentDelete,
}) => (
  <AnimatePresence>
    {graduate && (
      <>
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/60"
        />
        <MotionAside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.38 }}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="graduate-drawer-title"
        >
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-black uppercase text-indigo-700">
                  {mode === 'archived' ? 'Archived Record' : 'Verified Record'}
                </p>
                <h2 id="graduate-drawer-title" className="truncate text-2xl font-black text-slate-950">
                  {getFullName(graduate)}
                </h2>
                <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                  {graduate.email || 'No email recorded'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-950"
                aria-label="Close graduate drawer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onView}
                className={`h-9 rounded-md px-3 text-xs font-black uppercase transition-colors ${
                  drawerMode === 'view' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Profile
              </button>
              {mode === 'active' && (
                <button
                  type="button"
                  onClick={onEdit}
                  className={`h-9 rounded-md px-3 text-xs font-black uppercase transition-colors ${
                    drawerMode === 'edit' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Edit Record
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {drawerMode === 'edit' ? (
              <GraduateEditForm
                editForm={editForm}
                universities={universities}
                departments={departments}
                actionLoading={actionLoading === `edit-${graduate.id}`}
                onChange={onEditChange}
                onSubmit={onSaveEdit}
                onCancel={onView}
              />
            ) : (
              <GraduateDetails graduate={graduate} onOpenDegreeFile={onOpenDegreeFile} />
            )}
          </div>

          {drawerMode === 'view' && (
            <div className="border-t border-slate-200 p-4 sm:p-5">
              <DrawerActions
                graduate={graduate}
                mode={mode}
                actionLoading={actionLoading}
                onEdit={onEdit}
                onArchive={onArchive}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
              />
            </div>
          )}
        </MotionAside>
      </>
    )}
  </AnimatePresence>
);

const GraduateDetails = ({ graduate, onOpenDegreeFile }) => (
  <div className="space-y-6">
    <div className="flex flex-col gap-5 sm:flex-row">
      {graduate.profile_photo ? (
        <img
          className="h-28 w-28 flex-shrink-0 rounded-md object-cover"
          src={getFileUrl(graduate.profile_photo)}
          alt=""
        />
      ) : (
        <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-3xl font-black text-indigo-700">
          {getInitials(graduate)}
        </div>
      )}

      <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
        <InfoItem icon={Mail} label="Email" value={graduate.email} />
        <InfoItem icon={CalendarDays} label="Verified" value={formatDate(graduate.verified_at)} />
        <InfoItem icon={UserRound} label="Passport" value={graduate.passport_number} sensitive />
        <InfoItem icon={CalendarDays} label="Date of Birth" value={formatDate(graduate.date_of_birth)} sensitive />
      </div>
    </div>

    <section>
      <h3 className="mb-3 text-sm font-black uppercase text-slate-500">Academic Information</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoItem icon={Building2} label="University" value={graduate.university_name} />
        <InfoItem icon={BookOpen} label="Department" value={graduate.department_name} />
        <InfoItem icon={GraduationCap} label="Degree" value={graduate.degree_type} />
        <InfoItem icon={CalendarDays} label="Graduation Year" value={graduate.graduation_year} />
      </div>
    </section>

    {graduate.archived_at && (
      <section className="rounded-md bg-amber-50 p-4 ring-1 ring-amber-100">
        <h3 className="mb-2 text-sm font-black uppercase text-amber-800">Archive Information</h3>
        <p className="text-sm font-semibold text-amber-900">Archived: {formatDate(graduate.archived_at)}</p>
        {graduate.archive_reason && (
          <p className="mt-2 text-sm leading-6 text-amber-900">{graduate.archive_reason}</p>
        )}
      </section>
    )}

    <section>
      <h3 className="mb-3 text-sm font-black uppercase text-slate-500">Documents</h3>
      <button
        type="button"
        onClick={() => onOpenDegreeFile(graduate.degree_file)}
        disabled={!graduate.degree_file}
        className="flex min-h-16 w-full items-center justify-between gap-4 rounded-md bg-slate-50 p-4 text-left transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-white text-indigo-700">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-slate-950">Degree Certificate</span>
            <span className="block truncate text-xs font-semibold text-slate-500">
              {graduate.degree_file ? 'Open certificate file' : 'No certificate uploaded'}
            </span>
          </span>
        </span>
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
      </button>
    </section>

    {graduate.bio && (
      <section>
        <h3 className="mb-3 text-sm font-black uppercase text-slate-500">Bio</h3>
        <p className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {graduate.bio}
        </p>
      </section>
    )}
  </div>
);

const InfoItem = ({
  icon,
  label,
  value,
  sensitive = false,
}) => (
  <div className={`rounded-md p-3 ${sensitive ? 'bg-red-50 text-red-950' : 'bg-slate-50 text-slate-950'}`}>
    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-500">
      {createElement(icon, {
        className: `h-4 w-4 ${sensitive ? 'text-red-600' : 'text-slate-400'}`,
        'aria-hidden': 'true',
      })}
      {label}
    </div>
    <p className="break-words text-sm font-bold">{value || 'N/A'}</p>
  </div>
);

const GraduateEditForm = ({
  editForm,
  universities,
  departments,
  actionLoading,
  onChange,
  onSubmit,
  onCancel,
}) => (
  <form onSubmit={onSubmit} className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="First Name" name="first_name" value={editForm.first_name} onChange={onChange} required />
      <FormField label="Last Name" name="last_name" value={editForm.last_name} onChange={onChange} required />
      <FormField
        label="Email"
        name="email"
        type="email"
        value={editForm.email}
        onChange={onChange}
        className="sm:col-span-2"
        required
      />
      <FormSelect label="University" name="university_id" value={editForm.university_id} onChange={onChange}>
        <option value="">Select university</option>
        {universities.map((university) => (
          <option key={university.id} value={university.id}>
            {university.name}
          </option>
        ))}
      </FormSelect>
      <FormSelect
        label="Department"
        name="department_id"
        value={editForm.department_id}
        onChange={onChange}
        disabled={!editForm.university_id}
      >
        <option value="">Select department</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </FormSelect>
      <FormSelect label="Degree Type" name="degree_type" value={editForm.degree_type} onChange={onChange}>
        {degreeOptions.map((degree) => (
          <option key={degree} value={degree}>
            {degree}
          </option>
        ))}
      </FormSelect>
      <FormField
        label="Graduation Year"
        name="graduation_year"
        type="number"
        min="1950"
        max={new Date().getFullYear() + 1}
        value={editForm.graduation_year}
        onChange={onChange}
      />
      <label className="block sm:col-span-2">
        <span className="mb-2 block text-xs font-black uppercase text-slate-500">Bio</span>
        <textarea
          name="bio"
          value={editForm.bio}
          onChange={onChange}
          rows={5}
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
        />
      </label>
    </div>

    <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="h-11 rounded-md bg-slate-100 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-200"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={actionLoading}
        className="h-11 rounded-md bg-indigo-600 px-4 text-sm font-black text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {actionLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </form>
);

const FormField = ({
  label,
  name,
  value,
  onChange,
  className = '',
  type = 'text',
  required = false,
  ...props
}) => (
  <label className={`block ${className}`}>
    <span className="mb-2 block text-xs font-black uppercase text-slate-500">{label}</span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-950 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
      {...props}
    />
  </label>
);

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  disabled = false,
  children,
}) => (
  <label className="block min-w-0">
    <span className="mb-2 block text-xs font-black uppercase text-slate-500">{label}</span>
    <span className="relative block">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-3 pr-9 text-sm font-semibold text-slate-950 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:cursor-not-allowed disabled:text-slate-400"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
    </span>
  </label>
);

const DrawerActions = ({
  graduate,
  mode,
  actionLoading,
  onEdit,
  onArchive,
  onRestore,
  onPermanentDelete,
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
    {mode === 'active' ? (
      <>
        <button
          type="button"
          onClick={onEdit}
          className="h-11 rounded-md bg-slate-100 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-200"
        >
          Edit Record
        </button>
        <button
          type="button"
          onClick={() => onArchive(graduate)}
          disabled={actionLoading === `archive-${graduate.id}`}
          className="h-11 rounded-md bg-red-600 px-4 text-sm font-black text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {actionLoading === `archive-${graduate.id}` ? 'Archiving...' : 'Archive Graduate'}
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          onClick={() => onRestore(graduate)}
          disabled={actionLoading === `restore-${graduate.id}`}
          className="h-11 rounded-md bg-indigo-600 px-4 text-sm font-black text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {actionLoading === `restore-${graduate.id}` ? 'Restoring...' : 'Restore Graduate'}
        </button>
        <button
          type="button"
          onClick={() => onPermanentDelete(graduate)}
          disabled={actionLoading === `delete-${graduate.id}`}
          className="h-11 rounded-md bg-red-600 px-4 text-sm font-black text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {actionLoading === `delete-${graduate.id}` ? 'Deleting...' : 'Delete Permanently'}
        </button>
      </>
    )}
  </div>
);

export default AdminVerifiedGraduates;
