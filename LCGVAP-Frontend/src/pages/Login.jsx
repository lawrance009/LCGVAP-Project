import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/branding';
import { Button, Container, Field, Input, Seal } from '../components/ui';

const facts = [
  'Sign in with a one-time code sent to your email. There is no password to remember.',
  'Only graduates whose records have been reviewed can sign in.',
  'Your dashboard shows where each of your degrees is in review.',
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const headingRef = useRef(null);

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

  // Move focus to the step heading when the step changes (not on first load).
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    headingRef.current?.focus();
  }, [step]);

  return (
    <div className="bg-wash">
      <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-12 lg:items-stretch lg:gap-0 lg:py-16">
        {/* Context panel */}
        <aside className="relative order-2 overflow-hidden rounded-panel bg-deep p-8 text-on-primary lg:order-1 lg:col-span-5 lg:rounded-r-none lg:p-12">
          <Seal size="xl" className="absolute -right-10 -bottom-10 size-48 text-paper/10" decorative />
          <h2 className="relative font-display text-heading font-semibold text-balance sm:text-headline">
            Your record on the {BRAND.shortName} register
          </h2>
          <ul className="relative mt-8 space-y-5">
            {facts.map((fact) => (
              <li key={fact} className="flex gap-3 text-body text-canton-100">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-canton-100/60" aria-hidden="true" />
                {fact}
              </li>
            ))}
          </ul>
        </aside>

        {/* Form panel */}
        <section
          aria-labelledby="login-title"
          className="order-1 rounded-panel border border-line bg-paper p-6 sm:p-10 lg:order-2 lg:col-span-7 lg:rounded-l-none lg:border-l-0 lg:p-14"
        >
          <p className="text-caption font-semibold text-accent">Step {step} of 2</p>
          <h1
            id="login-title"
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 font-display text-headline font-semibold text-ink focus:outline-none"
          >
            {step === 1 ? 'Sign in' : 'Enter your code'}
          </h1>
          <p className="mt-3 max-w-md text-body text-muted">
            {step === 1
              ? 'Use the email address on your verified graduate record. We will send you a 6-digit sign-in code.'
              : <>We sent a 6-digit code to <span className="font-semibold break-all text-ink">{email}</span>. It expires after a few minutes.</>}
          </p>

          <div className="mt-6 flex gap-1.5" aria-hidden="true">
            {[1, 2].map((n) => (
              <span key={n} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${n <= step ? 'bg-primary' : 'bg-line'}`} />
            ))}
          </div>

          {step === 1 ? (
            <form key="email" onSubmit={handleRequestOtp} className="mt-8 max-w-md animate-swap space-y-6">
              <Field label="Email address" required>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted" strokeWidth={1.75} aria-hidden="true" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    spellCheck={false}
                    placeholder="you@example.com"
                    className="pl-11"
                  />
                </div>
              </Field>

              <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
                {loading ? 'Sending code…' : 'Send sign-in code'}
              </Button>

              <p className="border-t border-line pt-6 text-body text-muted">
                Not on the register yet?{' '}
                <Link to="/register" className="font-semibold text-primary underline decoration-primary/40 decoration-2 hover:decoration-primary underline-offset-4">
                  Get verified
                </Link>
              </p>
            </form>
          ) : (
            <form key="otp" onSubmit={handleVerifyOtp} className="mt-8 max-w-md animate-swap space-y-6">
              <Field label="6-digit code" hint="Check your spam folder if it has not arrived." required>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" strokeWidth={1.75} aria-hidden="true" />
                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => updateOtp(event.target.value)}
                    placeholder="000000"
                    className="h-16 pl-12 text-center font-display text-heading tracking-[0.4em] tabular-nums"
                  />
                </div>
              </Field>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
                  {loading ? 'Checking code…' : 'Sign in'}
                </Button>
                <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
                  Use a different email
                </Button>
              </div>
            </form>
          )}
        </section>
      </Container>
    </div>
  );
};

export default Login;
