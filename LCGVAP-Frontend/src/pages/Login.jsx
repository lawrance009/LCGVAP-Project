import { createElement, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/branding';

const MotionDiv = motion.div;
const MotionForm = motion.form;

const trustItems = [
  'OTP access for verified graduate accounts',
  'Admin-reviewed records before login access',
  'Private dashboard protected by secure session handling',
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);

    const result = await requestOtp(email.trim());
    setLoading(false);

    if (result.success) {
      setStep(2);
    } else if (result.code === 'NOT_FOUND') {
      setTimeout(() => {
        navigate('/register');
      }, 1500);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);

    const result = await verifyOtp(email.trim(), otp);
    setLoading(false);

    if (result.success) {
      navigate(result.user?.role === 'graduate' ? '/dashboard' : '/');
      return;
    }

    setOtp('');
    if (result.isLocked || result.isExpired) {
      if (result.isLocked) setEmail('');
      setStep(1);
    }
  };

  const updateOtp = (value) => {
    setOtp(value.replace(/\D/g, '').slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-[#0b1020] text-white">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80"
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

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[0.95fr_0.78fr] lg:items-center lg:px-8 lg:py-16">
          <MotionDiv
            className="max-w-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-bold uppercase text-red-200 backdrop-blur">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              Graduate Access
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Sign In To Your Verified Alumni Account
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Access your {BRAND.shortName} dashboard with a secure one-time code sent to your registered email.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {trustItems.map((item) => (
                <div key={item} className="rounded-md bg-white/[0.07] p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-red-300" aria-hidden="true" />
                  <p className="text-sm font-semibold leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </MotionDiv>

          <MotionDiv
            className="rounded-md bg-white p-5 text-slate-950 shadow-2xl shadow-indigo-950/30 sm:p-6 lg:p-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
          >
            <div className="mb-7">
              <div className="mb-5 flex items-center gap-2">
                <StepIndicator active={step === 1} label="Email" number="1" />
                <div className="h-px flex-1 bg-slate-200"></div>
                <StepIndicator active={step === 2} label="Code" number="2" />
              </div>

              <p className="mb-2 text-xs font-bold uppercase text-indigo-700">
                {step === 1 ? 'Request Code' : 'Verify Email'}
              </p>
              <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                {step === 1 ? 'Welcome back.' : 'Enter your code.'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {step === 1
                  ? 'Use the email attached to your verified graduate record.'
                  : 'Check your inbox and enter the 6-digit code we sent.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <MotionForm
                  key="email"
                  onSubmit={handleRequestOtp}
                  className="space-y-5"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <FormField
                    id="login-email"
                    label="Email Address"
                    icon={Mail}
                  >
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="graduate@university.edu"
                      className="h-12 w-full rounded-md bg-slate-50 pl-11 pr-4 text-base font-semibold text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
                    />
                  </FormField>

                  <PrimaryButton loading={loading} loadingText="Sending code...">
                    Send OTP
                  </PrimaryButton>

                  <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    Not registered yet?{' '}
                    <Link to="/register" className="font-black text-indigo-700 transition-colors hover:text-red-700">
                      Create an account
                    </Link>
                  </p>
                </MotionForm>
              ) : (
                <MotionForm
                  key="otp"
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div>
                    <label
                      htmlFor="login-otp"
                      className="mb-2 block text-xs font-bold uppercase text-slate-500"
                    >
                      Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                      <input
                        id="login-otp"
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength="6"
                        value={otp}
                        onChange={(event) => updateOtp(event.target.value)}
                        placeholder="000000"
                        className="h-16 w-full rounded-md bg-slate-50 pl-12 pr-4 text-center text-3xl font-black tracking-[0.24em] text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 sm:h-20 sm:text-4xl"
                      />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Code sent to <span className="font-black text-slate-950">{email}</span>.{' '}
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="font-black text-indigo-700 transition-colors hover:text-red-700"
                      >
                        Change email
                      </button>
                    </p>
                  </div>

                  <PrimaryButton loading={loading} loadingText="Verifying...">
                    Verify And Login
                  </PrimaryButton>
                </MotionForm>
              )}
            </AnimatePresence>
          </MotionDiv>
        </div>
      </section>
    </div>
  );
};

const StepIndicator = ({ active, number, label }) => (
  <div className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black ${
    active ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
  }`}
  >
    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
      active ? 'bg-white text-indigo-700' : 'bg-white text-slate-500'
    }`}
    >
      {number}
    </span>
    {label}
  </div>
);

const FormField = ({
  id,
  label,
  icon,
  children,
}) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase text-slate-500">
      {label}
    </label>
    <div className="relative">
      {createElement(icon, {
        className: 'pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400',
        'aria-hidden': 'true',
      })}
      {children}
    </div>
  </div>
);

const PrimaryButton = ({
  loading,
  loadingText,
  children,
}) => (
  <button
    type="submit"
    disabled={loading}
    className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-md bg-red-600 px-5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading ? (
      <>
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
        {loadingText}
      </>
    ) : (
      <>
        {children}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </>
    )}
  </button>
);

export default Login;
