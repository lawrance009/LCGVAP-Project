import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [loading, setLoading] = useState(false);
    const { requestOtp, verifyOtp, user } = useAuth();
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const start = Date.now();
        const success = await requestOtp(email);
        const elapsed = Date.now() - start;

        // If too fast, add slight delay for UX feel? Or just loading state.
        setLoading(false);
        if (success.success) {
            setStep(2);
        } else if (success.code === 'NOT_FOUND') {
            // Give them a moment to read the Swal alert before redirecting
            setTimeout(() => {
                navigate('/register');
            }, 1500);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await verifyOtp(email, otp);
        setLoading(false);

        if (result.success) {
            if (result.isNewUser) {
                navigate('/register');
            } else {
                // Graduates go to their dashboard; admins stay on homepage
                navigate(result.user?.role === 'graduate' ? '/dashboard' : '/');
            }
        } else {
            setOtp('');
            if (result.isLocked) {
                // Locked out — clear everything and start fresh
                setEmail('');
                setStep(1);
            } else if (result.isExpired) {
                // Code expired — send them back to login to request a new one.
                // Keep the email so they can resend with one click.
                setStep(1);
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-100px)] bg-white py-20 px-4 relative" style={{
            backgroundImage: `linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <div className="mb-12">
                    <div className="h-1 w-16 bg-indigo-600 mb-6"></div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-gray-900 leading-tight">
                        {step === 1 ? 'Welcome Back' : 'Enter Code'}
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600">
                        {step === 1 ? 'Securely access your alumni account' : 'Check your email for the 6-digit verification code'}
                    </p>
                </div>

                {step === 1 ? (
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleRequestOtp}
                        className="space-y-8"
                    >
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-50 border-2 border-gray-200 px-6 py-4 text-gray-900 text-lg focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="graduate@university.edu"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 mt-4 bg-indigo-600 text-white font-bold text-sm tracking-wider uppercase hover:bg-indigo-700 disabled:opacity-50 transition-all flex justify-center items-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Sending Code...
                                </>
                            ) : (
                                'Send Login Code'
                            )}
                        </button>
                        <div className="mt-12 pt-8 border-t-2 border-gray-100">
                            <p className="text-sm text-gray-600">
                                Not registered yet? <Link to="/register" className="font-bold text-indigo-600 hover:text-gray-900 transition-colors">Create an account</Link>
                            </p>
                        </div>
                    </motion.form>
                ) : (
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-8"
                    >
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                className="w-full bg-gray-50 border-2 border-gray-200 px-4 sm:px-6 py-5 sm:py-6 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 text-center tracking-[0.3em] sm:tracking-[0.5em] text-3xl sm:text-4xl font-black"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="------"
                            />
                            <p className="text-sm text-gray-600 mt-6 pt-2">
                                Code sent to <span className="font-bold text-gray-900">{email}</span>.{' '}
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-indigo-600 hover:text-gray-900 font-bold underline"
                                >
                                    Change Email
                                </button>
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 mt-4 bg-indigo-600 text-white font-bold text-sm tracking-wider uppercase hover:bg-indigo-700 disabled:opacity-50 transition-all flex justify-center items-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Verifying...
                                </>
                            ) : (
                                'Verify & Login'
                            )}
                        </button>
                    </motion.form>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
