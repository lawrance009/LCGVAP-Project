import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BRAND } from '../constants/branding';
import PageHero from '../components/PageHero';
import { Button, Container } from '../components/ui';
import WizardStepper from './register/WizardStepper';
import { StepAcademic, StepDocuments, StepIdentity, StepReview } from './register/WizardFields';
import { FIELD_STEP, WIZARD_STEPS } from './register/wizardSteps';

const degreeOptions = [
  { value: 'Bachelor', label: "Bachelor's Degree" },
  { value: 'Master', label: "Master's Degree" },
  { value: 'PhD', label: 'Doctor of Philosophy (PhD)' },
];

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
        title: 'Application submitted',
        text: 'An administrator will review your documents. We will email you as soon as your record is verified.',
      }).then(() => {
        navigate('/login');
      });
    }
  };

  // ── Wizard (presentation only; submission is handleSubmit above) ──────
  const [step, setStep] = useState(0);
  const headingRef = useRef(null);
  // Compare with the previous step (not a "first render" flag, which React
  // StrictMode's double effect run would defeat).
  const previousStep = useRef(step);

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [step]);

  // Checks for one step, shown under the fields before moving on.
  const checkStep = (index) => {
    const found = {};
    if (index === 0) {
      if (!formData.first_name.trim()) found.first_name = 'Enter your first name.';
      if (!formData.last_name.trim()) found.last_name = 'Enter your last name.';
      if (!formData.email.trim()) found.email = 'Enter your email address.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        found.email = 'Enter an email address like name@example.com.';
      }
      if (!formData.passport_number.trim()) found.passport_number = 'Enter your passport number.';
      if (!formData.date_of_birth) found.date_of_birth = 'Choose your day, month and year of birth.';
    }
    if (index === 1) {
      if (!formData.university_id) found.university_id = 'Choose your university.';
      if (!formData.department_id) found.department_id = 'Choose your department.';
      if (!formData.degree_type) found.degree_type = 'Choose your degree.';
      const year = Number(formData.graduation_year);
      if (!year || year < 1950 || year > currentYear) {
        found.graduation_year = `Enter a year between 1950 and ${currentYear}.`;
      }
    }
    if (index === 2 && !degreeFile) found.degreeFile = 'Upload your degree certificate.';
    return found;
  };

  const goTo = (index) => setStep(index);

  const handleContinue = (event) => {
    event.preventDefault();
    const found = checkStep(step);
    if (Object.keys(found).length > 0) {
      setErrors((current) => ({ ...current, ...found }));
      return;
    }
    setStep((current) => Math.min(current + 1, WIZARD_STEPS.length - 1));
  };

  const handleWizardSubmit = (event) => {
    // Re-check every step; send the applicant to the first one with a problem.
    for (let index = 0; index < WIZARD_STEPS.length - 1; index += 1) {
      const found = checkStep(index);
      if (Object.keys(found).length > 0) {
        event.preventDefault();
        setErrors((current) => ({ ...current, ...found }));
        setStep(index);
        return;
      }
    }
    handleSubmit(event);
  };

  // If the original validateForm flags something on the review step, jump to it.
  const errorKeys = Object.keys(errors);
  if (step === WIZARD_STEPS.length - 1 && errorKeys.length > 0) {
    setStep(Math.min(...errorKeys.map((key) => FIELD_STEP[key] ?? 0)));
  }

  const universityName = universityOptions.find((option) => option.value === String(formData.university_id))?.label;
  const departmentName = departmentOptions.find((option) => option.value === String(formData.department_id))?.label;
  const degreeLabel = degreeOptions.find((option) => option.value === formData.degree_type)?.label;
  const dobLabel = formData.date_of_birth
    ? new Date(`${formData.date_of_birth}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const reviewSections = [
    {
      title: 'Identity',
      step: 0,
      items: [
        ['Name', `${formData.first_name} ${formData.last_name}`.trim()],
        ['Email address', formData.email],
        ['Passport number', formData.passport_number],
        ['Date of birth', dobLabel],
      ],
    },
    {
      title: 'Academic record',
      step: 1,
      items: [
        ['University', universityName],
        ['Department', departmentName],
        ['Degree', degreeLabel],
        ['Year of graduation', String(formData.graduation_year || '')],
      ],
    },
    {
      title: 'Documents',
      step: 2,
      items: [
        ['Degree certificate', degreeFile?.name],
        ['Profile photo', profilePhoto?.name || 'None (optional)'],
      ],
    },
  ];

  const isLastStep = step === WIZARD_STEPS.length - 1;
  const current = WIZARD_STEPS[step];
  const signInLink = (
    <Link to="/login" className="font-semibold text-primary underline decoration-primary/40 decoration-2 hover:decoration-primary underline-offset-4">
      Sign in
    </Link>
  );

  return (
    <>
      <PageHero
        title="Get verified"
        lead={`Apply to join the ${BRAND.shortName} register. Have your passport and degree certificate ready. An administrator reviews every application, usually within 2–5 business days.`}
      />

      <div className="bg-wash">
        <Container className="grid gap-8 py-10 lg:grid-cols-12 lg:gap-12 lg:py-14">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <WizardStepper current={step} onGoTo={goTo} />
              <p className="mt-10 hidden border-t border-line pt-6 text-caption text-muted lg:block">
                Already on the register? {signInLink}
              </p>
            </div>
          </aside>

          <form
            onSubmit={isLastStep ? handleWizardSubmit : handleContinue}
            noValidate
            className="rounded-panel border border-line bg-paper p-6 sm:p-8 lg:col-span-8 lg:p-10"
          >
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="scroll-mt-24 font-display text-heading font-semibold text-ink focus:outline-none"
            >
              {current.heading}
            </h2>
            <p className="mt-2 max-w-measure text-body text-muted">{current.description}</p>

            <div key={step} className="mt-8 animate-swap">
              {step === 0 && (
                <StepIdentity
                  formData={formData}
                  errors={errors}
                  onInput={handleInputChange}
                  onDob={(next) => setFieldValue('date_of_birth', next)}
                  minDob={minDateOfBirth}
                  maxDob={maxDateOfBirth}
                />
              )}
              {step === 1 && (
                <StepAcademic
                  formData={formData}
                  errors={errors}
                  onInput={handleInputChange}
                  universities={universityOptions}
                  universitiesLoading={universitiesLoading}
                  departments={departmentOptions}
                  departmentsLoading={departmentsLoading}
                  degreeOptions={degreeOptions}
                  currentYear={currentYear}
                  onUniversity={handleUniversityChange}
                  onField={setFieldValue}
                />
              )}
              {step === 2 && (
                <StepDocuments
                  degreeFile={degreeFile}
                  profilePhoto={profilePhoto}
                  errors={errors}
                  onDegreeFile={(file) => handleFileChange(file, setDegreeFile, 'degreeFile')}
                  onPhoto={(file) => handleFileChange(file, setProfilePhoto)}
                />
              )}
              {step === 3 && <StepReview sections={reviewSections} onChange={goTo} />}
            </div>

            <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              {step > 0 ? (
                <Button variant="ghost" size="lg" leadingIcon={ChevronLeft} onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : (
                <p className="text-caption text-muted lg:invisible">Already on the register? {signInLink}</p>
              )}
              {isLastStep ? (
                <Button type="submit" variant="accent" size="lg" loading={loading} leadingIcon={Send}>
                  {loading ? 'Submitting…' : 'Submit for verification'}
                </Button>
              ) : (
                <Button type="submit" size="lg" trailingIcon={ChevronRight}>
                  Continue
                </Button>
              )}
            </div>
          </form>
        </Container>
      </div>
    </>
  );
};

export default Register;
