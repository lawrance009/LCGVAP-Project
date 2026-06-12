import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Trash2, UserPlus, Mail, Lock, User, Crown } from 'lucide-react';

const AdminManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/users/admins');
            setAdmins(res.data);
        } catch (error) {
            Swal.fire('Error', 'Failed to load admins.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            Swal.fire('Error', 'Password must be at least 8 characters.', 'error');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/auth/admin/register', formData);
            Swal.fire({
                icon: 'success',
                title: 'Admin Created!',
                text: `Share these credentials with ${formData.first_name}: Email: ${formData.email} | Password: ${formData.password}`,
                confirmButtonColor: '#4f46e5',
            });
            setFormData({ first_name: '', last_name: '', email: '', password: '' });
            setShowForm(false);
            fetchAdmins();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Failed to create admin.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAdmin = async (admin) => {
        const result = await Swal.fire({
            title: `Remove ${admin.first_name}?`,
            text: 'This will permanently delete their admin account. This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, remove admin',
        });
        if (!result.isConfirmed) return;

        try {
            await api.delete(`/users/admins/${admin.id}`);
            setAdmins(prev => prev.filter(a => a.id !== admin.id));
            Swal.fire('Done', `${admin.first_name} has been removed.`, 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Failed to delete admin.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
            >
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Shield className="w-6 h-6 text-indigo-700" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900">Manage Admins</h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-1">
                        Boss Admin panel — only you can see and manage this section.
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Add New Admin
                </motion.button>
            </motion.div>

            {/* Add Admin Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-8"
                    >
                        <form
                            onSubmit={handleAddAdmin}
                            className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-lg"
                        >
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-indigo-600" />
                                New Admin Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</label>
                                    <div className="mt-1 relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input name="first_name" type="text" required value={formData.first_name} onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                            placeholder="John" />
                                    </div>
                                </div>
                                {/* Last Name */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
                                    <div className="mt-1 relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input name="last_name" type="text" required value={formData.last_name} onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                            placeholder="Doe" />
                                    </div>
                                </div>
                                {/* Email */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                                    <div className="mt-1 relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                            placeholder="admin@example.com" />
                                    </div>
                                </div>
                                {/* Password */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Temporary Password</label>
                                    <div className="mt-1 relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input name="password" type="text" required value={formData.password} onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                            placeholder="Min. 8 characters" />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Password shown in plain text so you can share it with the new admin.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button type="submit" disabled={submitting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50">
                                    {submitting ? 'Creating...' : 'Create Admin'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold text-sm transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admins Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">Regular Admins</h2>
                    <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full">
                        {admins.length} admin{admins.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {admins.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-semibold">No regular admins yet</p>
                        <p className="text-sm mt-1">Click "Add New Admin" to create one.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Email</th>
                                <th className="px-6 py-3 text-left">Role</th>
                                <th className="px-6 py-3 text-left">Added</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            <AnimatePresence>
                                {admins.map(admin => (
                                    <motion.tr
                                        key={admin.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                    {admin.first_name[0]}{admin.last_name[0]}
                                                </div>
                                                {admin.first_name} {admin.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                                                <Shield className="w-3 h-3" /> Admin
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(admin.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDeleteAdmin(admin)}
                                                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" /> Remove
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminManageAdmins;
