import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  FileCheck2,
  GraduationCap,
  IdCard,
  ImagePlus,
  Mail,
  ShieldCheck,
  UploadCloud,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DateOfBirthField from '../components/DateOfBirthField';
import { BRAND } from '../constants/branding';

const MotionDiv = motion.div;
const MotionForm = motion.form;

const degreeOptions = [
  { value: 'Bachelor', label: "Bachelor's Degree" },
  { value: 'Master', label: "Master's Degree" },
  { value: 'PhD', label: 'Doctor of Philosophy (PhD)' },
];

const verificationSteps = [
  { label: 'Identity', icon: UserRound },
  { label: 'Academic Record', icon: GraduationCap },
  { label: 'Documents', icon: FileCheck2 },
  { label: 'Admin Review', icon: ShieldCheck },
];

const formatFileSize = (file) => {
  if (!file) return '';
  if (file.size < 1024 * 1024) return `${Math.max(1, Math.round(file.size / 1024))} KB`;
  return `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
};

const getDefaultFormData = () => ({
  first_name: '',
  last_name: '',
  email: '',
  passport_number: '',
  date_of_birth: '',
  university_id: '',
  department_id: '',
  degree_type: 'Bachelor',
  graduation_year: new Date().getFullYear(),
});

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [formData, setFormData] = useState(getDefaultFormData);
  const [degreeFile, setDegreeFile] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [errors, setErrors] = useState({});

  const maxDateOfBirth = new Date().toISOString().split('T')[0];
  const minDateOfBirth = '1950-01-01';
  const currentYear = new Date().getFullYear();

  const universityOptions = useMemo(
    () => universities.map((university) => ({
      value: String(university.id),
      label: university.name,
    })),
    [universities]
  );

  const departmentOptions = useMemo(
    () => departments.map((department) => ({
      value: String(department.id),
      label: department.name,
    })),
    [departments]
  );

  useEffect(() => {
    const fetchUniversities = async () => {
      setUniversitiesLoading(true);

      try {
        const response = await api.get('/universities');
        setUniversities(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to load universities', error);
        setUniversities([]);
      } finally {
        setUniversitiesLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    let active = true;

    const fetchDepartments = async () => {
      if (!formData.university_id) {
        setDepartments([]);
        setDepartmentsLoading(false);
        return;
      }

      setDepartmentsLoading(true);

      try {
        const response = await api.get(`/universities/${formData.university_id}/departments`);
        if (active) setDepartments(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to load departments', error);
        if (active) setDepartments([]);
      } finally {
        if (active) setDepartmentsLoading(false);
      }
    };

    fetchDepartments();

    return () => {
      active = false;
    };
  }, [formData.university_id]);

  const clearError = (name) => {
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const setFieldValue = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
    clearError(name);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFieldValue(name, value);
  };

  const handleUniversityChange = (value) => {
    setFormData((current) => ({
      ...current,
      university_id: value,
      department_id: '',
    }));
    clearError('university_id');
    clearError('department_id');
  };

  const handleFileChange = (file, setter, errorKey) => {
    if (!file) return;
    setter(file);
    if (errorKey) clearError(errorKey);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.university_id) nextErrors.university_id = 'University is required';
    if (!formData.department_id) nextErrors.department_id = 'Department is required';
    if (!formData.date_of_birth) nextErrors.date_of_birth = 'Date of birth is required';
    if (!degreeFile) nextErrors.degreeFile = 'Degree certificate is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append('degree_file', degreeFile);
    if (profilePhoto) data.append('profile_photo', profilePhoto);

    const result = await register(data);
    setLoading(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Registration Submitted',
        text: 'Your information has been received. Please wait for an admin to verify your credentials. You will receive an email once verified.',
        confirmButtonColor: '#4f46e5',
      }).then(() => {
        navigate('/login');
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-[#0b1020] text-white">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#0b1020]/80" aria-hidden="true"></div>
        <div className="absolute inset-x-0 top-0 grid h-1 grid-cols-3" aria-hidden="true">
          <div className="bg-red-600"></div>
          <div className="bg-white"></div>
          <div className="bg-indigo-600"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <MotionDiv
            className="max-w-4xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-bold uppercase text-red-200 backdrop-blur">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Graduate Verification
            </div>

            <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Submit Your Graduate Verification
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Create your {BRAND.shortName} profile and submit your academic record for official admin review before
              public directory recognition.
            </p>
          </MotionDiv>
        </div>
      </section>

      <section className="relative z-10 -mt-8 px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <VerificationRail className="hidden lg:block" />

          <MotionForm
            onSubmit={handleSubmit}
            className="rounded-md bg-white p-5 shadow-xl shadow-slate-950/10 sm:p-6 lg:p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <VerificationStrip className="mb-6 lg:hidden" />

            <div className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase text-indigo-700">Create Profile</p>
              <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                Submit your credentials for review.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Registration does not automatically grant access. Your submitted credentials must be verified by
                {` ${BRAND.shortName}`} administration before login access is granted.
              </p>
            </div>

            <div className="space-y-10">
              <FormSection
                title="Personal Information"
                icon={IdCard}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id="first-name"
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    icon={UserRound}
                    autoComplete="given-name"
                    required
                  />
                  <TextField
                    id="last-name"
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    icon={UserRound}
                    autoComplete="family-name"
                    required
                  />
                  <TextField
                    id="register-email"
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={Mail}
                    autoComplete="email"
                    className="sm:col-span-2"
                    required
                  />
                  <TextField
                    id="passport-number"
                    label="Passport Number"
                    name="passport_number"
                    value={formData.passport_number}
                    onChange={handleInputChange}
                    icon={IdCard}
                    autoComplete="off"
                    required
                  />
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                      Date of Birth
                    </label>
                    <DateOfBirthField
                      value={formData.date_of_birth}
                      min={minDateOfBirth}
                      max={maxDateOfBirth}
                      required
                      onChange={(next) => setFieldValue('date_of_birth', next)}
                    />
                    <FieldError message={errors.date_of_birth} />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Academic Information"
                icon={GraduationCap}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <DropdownField
                    id="register-university"
                    label="University"
                    value={formData.university_id}
                    placeholder="Select University"
                    disabled={universitiesLoading}
                    disabledText="Loading universities..."
                    emptyText="No universities available"
                    options={universityOptions}
                    onChange={handleUniversityChange}
                    error={errors.university_id}
                    className="sm:col-span-2"
                  />
                  <DropdownField
                    id="register-department"
                    label="Department"
                    value={formData.department_id}
                    placeholder="Select Department"
                    disabled={!formData.university_id || departmentsLoading || departmentOptions.length === 0}
                    disabledText={
                      !formData.university_id
                        ? 'Select university first'
                        : departmentsLoading
                          ? 'Loading departments...'
                          : 'No departments available'
                    }
                    emptyText="No departments available"
                    options={departmentOptions}
                    onChange={(value) => setFieldValue('department_id', value)}
                    error={errors.department_id}
                  />
                  <DropdownField
                    id="degree-type"
                    label="Degree Type"
                    value={formData.degree_type}
                    placeholder="Select Degree"
                    emptyText="No degree options available"
                    options={degreeOptions}
                    onChange={(value) => setFieldValue('degree_type', value)}
                  />
                  <TextField
                    id="graduation-year"
                    label="Year of Graduation"
                    name="graduation_year"
                    type="number"
                    min="1950"
                    max={currentYear}
                    value={formData.graduation_year}
                    onChange={handleInputChange}
                    icon={CalendarDays}
                    required
                  />
                </div>
              </FormSection>

              <FormSection
                title="Verification Documents"
                icon={FileCheck2}
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <UploadField
                    id="degree-file"
                    label="Degree Certificate"
                    note="PDF or image file required"
                    file={degreeFile}
                    accept=".pdf,image/*"
                    icon={UploadCloud}
                    required
                    error={errors.degreeFile}
                    onChange={(file) => handleFileChange(file, setDegreeFile, 'degreeFile')}
                  />
                  <UploadField
                    id="profile-photo"
                    label="Profile Photo"
                    note="Optional public profile image"
                    file={profilePhoto}
                    accept="image/*"
                    icon={ImagePlus}
                    onChange={(file) => handleFileChange(file, setProfilePhoto)}
                  />
                </div>
              </FormSection>
            </div>

            <div className="mt-10">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-md bg-red-600 px-5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Submit For Verification
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Already verified?{' '}
                <Link to="/login" className="font-black text-indigo-700 transition-colors hover:text-red-700">
                  Log in here
                </Link>
              </p>
            </div>
          </MotionForm>
        </div>
      </section>
    </div>
  );
};

const VerificationRail = ({ className = '' }) => (
  <MotionDiv
    className={`sticky top-28 rounded-md bg-white p-5 shadow-xl shadow-slate-950/10 ${className}`}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5 }}
  >
    <p className="mb-2 text-xs font-bold uppercase text-indigo-700">Verification Path</p>
    <h2 className="text-xl font-black leading-tight text-slate-950">
      Built for careful review.
    </h2>
    <div className="mt-6 space-y-4">
      {verificationSteps.map((step, index) => (
        <VerificationStep key={step.label} step={step} index={index} />
      ))}
    </div>
  </MotionDiv>
);

const VerificationStrip = ({ className = '' }) => (
  <div className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${className}`}>
    {verificationSteps.map((step, index) => (
      <div key={step.label} className="rounded-md bg-slate-50 p-3">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-indigo-700 text-white">
          {createElement(step.icon, {
            className: 'h-4 w-4',
            'aria-hidden': 'true',
          })}
        </div>
        <p className="text-xs font-black text-slate-950">{index + 1}. {step.label}</p>
      </div>
    ))}
  </div>
);

const VerificationStep = ({ step, index }) => (
  <div className="flex gap-3">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
      {createElement(step.icon, {
        className: 'h-5 w-5',
        'aria-hidden': 'true',
      })}
    </div>
    <div>
      <p className="text-xs font-black uppercase text-red-700">Step {index + 1}</p>
      <p className="text-sm font-bold leading-6 text-slate-700">{step.label}</p>
    </div>
  </div>
);

const FormSection = ({
  title,
  icon,
  children,
}) => (
  <MotionDiv
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.25 }}
    transition={{ duration: 0.42, ease: 'easeOut' }}
  >
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
        {createElement(icon, {
          className: 'h-5 w-5',
          'aria-hidden': 'true',
        })}
      </div>
      <h3 className="text-lg font-black text-slate-950 sm:text-xl">{title}</h3>
    </div>
    {children}
  </MotionDiv>
);

const TextField = ({
  id,
  label,
  name,
  value,
  onChange,
  icon,
  className = '',
  type = 'text',
  required = false,
  ...props
}) => (
  <div className={className}>
    <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase text-slate-500">
      {label}
    </label>
    <div className="relative">
      {createElement(icon, {
        className: 'pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400',
        'aria-hidden': 'true',
      })}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded-md bg-slate-50 pl-11 pr-4 text-base font-semibold text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
        {...props}
      />
    </div>
  </div>
);

const DropdownField = ({
  id,
  label,
  value,
  placeholder,
  options,
  onChange,
  error,
  disabled = false,
  disabledText = '',
  emptyText = 'No options available',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find((option) => String(option.value) === String(value));
  const buttonText = disabled ? disabledText : selectedOption?.label || placeholder;
  const isExpanded = isOpen && !disabled;

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current || containerRef.current.contains(event.target)) return;
      setIsOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, []);

  const selectOption = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  const optionClassName = (isSelected) => (
    `flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-bold transition-colors ${
      isSelected
        ? 'bg-indigo-50 text-indigo-800'
        : 'text-slate-700 hover:bg-slate-50'
    }`
  );

  return (
    <div ref={containerRef} className={`relative min-w-0 ${isExpanded ? 'z-40' : 'z-10'} ${className}`}>
      <label
        id={`${id}-label`}
        htmlFor={`${id}-button`}
        className="mb-2 block text-xs font-bold uppercase text-slate-500"
      >
        {label}
      </label>
      <button
        id={`${id}-button`}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-md bg-slate-50 px-4 text-left text-base font-semibold text-slate-950 outline-none transition-colors hover:bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-slate-50 ${
          error ? 'ring-2 ring-red-500/50' : ''
        }`}
        aria-expanded={isExpanded}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-button-value`}
        aria-controls={`${id}-listbox`}
      >
        <span id={`${id}-button-value`} className="min-w-0 truncate">
          {buttonText}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <FieldError message={error} />

      <AnimatePresence initial={false}>
        {isExpanded && (
          <MotionDiv
            className="absolute left-0 right-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-md bg-white shadow-xl shadow-slate-950/15 ring-1 ring-slate-200/70"
            initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div
              id={`${id}-listbox`}
              role="listbox"
              aria-labelledby={`${id}-label`}
              className="max-h-64 overflow-y-auto p-2 sm:max-h-72"
            >
              {options.length === 0 && (
                <p className="px-3 py-4 text-sm font-semibold text-slate-500">
                  {emptyText}
                </p>
              )}

              {options.map((option) => {
                const isSelected = String(option.value) === String(value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectOption(option.value)}
                    className={optionClassName(isSelected)}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 flex-shrink-0 text-red-600" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

const UploadField = ({
  id,
  label,
  note,
  file,
  accept,
  icon,
  required = false,
  error,
  onChange,
}) => (
  <div>
    <p className="mb-2 text-xs font-bold uppercase text-slate-500">
      {label} {required && <span className="text-red-600">*</span>}
    </p>
    <label
      htmlFor={id}
      className={`block cursor-pointer rounded-md bg-slate-50 p-4 transition-colors hover:bg-slate-100 ${
        error ? 'ring-2 ring-red-500/50' : ''
      }`}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        aria-required={required}
        onChange={(event) => onChange(event.target.files?.[0])}
        className="sr-only"
      />
      <span className="flex items-center gap-4">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-white text-indigo-700">
          {createElement(icon, {
            className: 'h-6 w-6',
            'aria-hidden': 'true',
          })}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-slate-950">
            {file ? file.name : 'Choose file'}
          </span>
          <span className="mt-1 block text-xs font-semibold text-slate-500">
            {file ? formatFileSize(file) : note}
          </span>
        </span>
        {file && <Check className="ml-auto h-5 w-5 flex-shrink-0 text-red-600" aria-hidden="true" />}
      </span>
    </label>
    <FieldError message={error} />
  </div>
);

const FieldError = ({ message }) => (
  <AnimatePresence initial={false}>
    {message && (
      <MotionDiv
        className="mt-2 text-sm font-bold text-red-600"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
      >
        {message}
      </MotionDiv>
    )}
  </AnimatePresence>
);

export default Register;
