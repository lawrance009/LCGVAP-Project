import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, CheckCircle, Ban } from 'lucide-react';

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: ''
    });
    const [loading, setLoading]           = useState(false);
    const [checking, setChecking]         = useState(true);
    const [registrationOpen, setRegistrationOpen] = useState(false);
    const [closedReason, setClosedReason] = useState('');
    const [error, setError]               = useState('');
    const navigate = useNavigate();

    // Check if boss admin registration is still open
    useEffect(() => {
        api.get('/auth/admin/registration-status')
            .then(res => {
                setRegistrationOpen(res.data.open);
                if (!res.data.open) setClosedReason(res.data.reason);
            })
            .catch(() => setRegistrationOpen(false))
            .finally(() => setChecking(false));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (!formData.secretKey) {
            setError('Admin creation secret is required');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                '/auth/admin/register',
                {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    password: formData.password
                },
                {
                    // Send the secret as a header — required by adminSecretMiddleware
                    headers: { 'X-Admin-Secret': formData.secretKey }
                }
            );

            Swal.fire({
                title: 'Boss Admin Created!',
                text: 'Your Master Admin account is ready. You can now log in.',
                icon: 'success',
                confirmButtonColor: '#1e40af'
            });

            navigate('/patron-entry');
        } catch (err) {
            console.error('Admin Register Error:', err);
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative" style={{
            backgroundImage: `linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}>

            {/* Checking status */}
            {checking ? (
                <div className="flex flex-col items-center gap-6 text-gray-600">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent" />
                    <p className="text-lg font-bold uppercase tracking-wider">Checking registration status...</p>
                </div>
            ) : !registrationOpen ? (
                /* Registration Closed Screen */
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg w-full bg-gray-50 p-6 sm:p-12 border-2 border-red-600 text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-8 bg-red-600">
                            <Ban className="h-16 w-16 text-white" />
                        </div>
                    </div>
                    <div className="h-1 w-16 bg-red-600 mb-6 mx-auto"></div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 uppercase tracking-wider">Registration Closed</h2>
                    <p className="text-gray-600 text-lg mb-6">{closedReason || 'Master Admin registration is no longer available.'}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Contact your system administrator for assistance</p>
                </motion.div>
            ) : (

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                <div className="mb-12">
                    <div className="flex justify-center mb-8">
                        <div className="p-6 bg-indigo-600">
                            <Shield className="h-16 w-16 text-white" />
                        </div>
                    </div>
                    <div className="h-1 w-16 bg-indigo-600 mb-6 mx-auto"></div>
                    <h2 className="text-center text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                        Master Admin<br/>Registration
                    </h2>
                    <p className="text-center text-xs font-bold text-indigo-600 uppercase tracking-[0.2em]">
                        Highest Level Administrative Access
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-50 border-l-4 border-red-600 p-6 mb-8"
                    >
                        <p className="text-red-700 text-sm font-bold uppercase tracking-wider">{error}</p>
                    </motion.div>
                )}

                <form className="space-y-8 bg-gray-50 p-6 sm:p-12" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-3 block">First Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        name="first_name"
                                        type="text"
                                        required
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="block w-full pl-16 pr-6 py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:border-indigo-600 transition-all bg-white"
                                        placeholder="John"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-3 block">Last Name</label>
                                <input
                                    name="last_name"
                                    type="text"
                                    required
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="block w-full px-6 py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:border-indigo-600 transition-all bg-white"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-3 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-16 pr-6 py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:border-indigo-600 transition-all bg-white"
                                    placeholder="admin@lcgvap.org"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-3 block">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-16 pr-6 py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:border-indigo-600 transition-all bg-white"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-3 block">Confirm Password</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full px-6 py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:border-indigo-600 transition-all bg-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Secret Key Field */}
                        <div className="border-t-2 border-gray-200 pt-6">
                            <label className="text-xs font-bold text-red-600 uppercase tracking-[0.15em] mb-3 block">Admin Creation Secret *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-red-600" />
                                </div>
                                <input
                                    name="secretKey"
                                    type="password"
                                    required
                                    value={formData.secretKey}
                                    onChange={handleChange}
                                    className="block w-full pl-16 pr-6 py-4 border-2 border-red-200 bg-red-50 placeholder-red-300 text-gray-900 text-lg focus:outline-none focus:border-red-600 transition-all"
                                    placeholder="Enter the admin creation secret key"
                                />
                            </div>
                            <p className="text-xs text-red-600 mt-3 font-bold uppercase tracking-wider">Found in backend .env file (ADMIN_CREATION_SECRET)</p>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center gap-3 py-6 px-6 text-xs font-bold uppercase tracking-[0.2em] text-white ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-gray-900'} transition-all`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Register Master Admin
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-center text-xs text-gray-500 uppercase tracking-wider pt-4">
                        <span>Secure System Registration Environment</span>
                    </div>
                </form>

            </motion.div>
            )} {/* end registrationOpen ternary */}
        </div>
    );
};

export default AdminRegister;
