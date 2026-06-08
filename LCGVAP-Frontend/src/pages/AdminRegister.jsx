import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: ''
    });
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [registrationOpen, setRegistrationOpen] = useState(false);
    const [closedReason, setClosedReason] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setAuth } = useAuth();

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
            setError('Admin Creation Secret Code is required');
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post(
                '/auth/admin/register',
                {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    password: formData.password
                },
                {
                    headers: { 'X-Admin-Secret': formData.secretKey }
                }
            );

            if (data.token && data.user) {
                setAuth(data.user, data.token);
            }

            Swal.fire({
                title: 'Boss Admin Created!',
                text: 'Check your email for login details. Redirecting to dashboard...',
                icon: 'success',
                confirmButtonColor: '#1e40af'
            });

            navigate('/patron/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
            </div>
        );
    }

    if (!registrationOpen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                <div className="max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Closed</h2>
                    <p className="text-gray-600">{closedReason || 'Master Admin registration is no longer available.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
            <div className="max-w-md w-full">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="first_name"
                            type="text"
                            required
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-600"
                            placeholder="First name"
                        />
                        <input
                            name="last_name"
                            type="text"
                            required
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-600"
                            placeholder="Last name"
                        />
                    </div>

                    <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-600"
                        placeholder="Email"
                    />

                    <input
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-600"
                        placeholder="Password"
                    />

                    <input
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-600"
                        placeholder="Confirm password"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Admin Creation Secret Code
                        </label>
                        <input
                            name="secretKey"
                            type="password"
                            required
                            value={formData.secretKey}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded text-white font-medium ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {loading ? 'Processing...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminRegister;
