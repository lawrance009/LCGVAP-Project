import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail } from 'lucide-react';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/admin/login', formData);
            const { token, user } = response.data;

            setAuth(user, token);

            Swal.fire({
                title: 'Welcome, Admin',
                text: 'Authentication successful',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            navigate('/patron/dashboard');
        } catch (error) {
            console.error('Admin Login Error:', error);
            const status  = error.response?.status;
            const message = error.response?.data?.error || 'Invalid credentials';

            Swal.fire({
                title: status === 423 ? '🔒 Account Locked' : 'Access Denied',
                text:  message,
                icon:  status === 423 ? 'warning' : 'error',
                confirmButtonColor: '#1e40af'
            });
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
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full"
            >
                <div className="mb-12">
                    <div className="flex justify-center mb-8">
                        <div className="p-6 bg-gray-900">
                            <Shield className="h-16 w-16 text-white" />
                        </div>
                    </div>
                    <div className="h-1 w-16 bg-indigo-600 mb-6 mx-auto"></div>
                    <h2 className="text-center text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                        Admin Portal
                    </h2>
                    <p className="mt-4 text-center text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                        Secure Government Access Only
                    </p>
                </div>

                <form className="space-y-8" onSubmit={handleLogin}>
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-3 block">Admin Identity</label>
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
                                    className="block w-full pl-16 pr-6 py-5 border-2 border-gray-200 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:border-indigo-600 transition-all bg-white"
                                    placeholder="admin@lcgvap.org"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-3 block">Access Token</label>
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
                                    className="block w-full pl-16 pr-6 py-5 border-2 border-gray-200 placeholder-gray-400 text-gray-900 text-lg focus:outline-none focus:border-indigo-600 transition-all bg-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-6 px-6 text-xs font-bold uppercase tracking-[0.2em] text-white ${loading ? 'bg-gray-400' : 'bg-gray-900 hover:bg-indigo-600'} transition-all`}
                        >
                            {loading ? 'Authenticating...' : 'Authorize Access'}
                        </button>
                    </div>
                </form>

                <div className="mt-12 pt-8 border-t-2 border-gray-100 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">
                        Authorized Personnel Only
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
