import { useState, useEffect } from 'react';
import api from '../services/api';
import { getSignedFileUrl } from '../services/api';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import getFileUrl from '../utils/getFileUrl';
import { GraduationCap, Clock, CheckCircle2, Building2, Users, FileText, Eye, Check, X } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        verified: 0,
        universities: 0,
        departments: 0
    });
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, pendingRes] = await Promise.all([
                api.get('/users/stats'),
                api.get('/users/pending')
            ]);
            setStats(statsRes.data);
            setPendingUsers(pendingRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const handleVerify = async (userId, userName) => {
        const result = await Swal.fire({
            title: 'Verify Graduate?',
            text: `Are you sure you want to verify ${userName}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, verify!'
        });

        if (result.isConfirmed) {
            try {
                await api.put(`/users/${userId}/verify`, {});

                // Update specific user in list locally (remove them)
                setPendingUsers(prev => prev.filter(u => u.id !== userId));

                // Update stats
                setStats(prev => ({
                    ...prev,
                    pending: prev.pending - 1,
                    verified: prev.verified + 1
                }));

                Swal.fire(
                    'Verified!',
                    `${userName} has been verified successfully.`,
                    'success'
                );
            } catch (error) {
                console.error('Verification failed:', error);
                Swal.fire(
                    'Error!',
                    error.response?.data?.error || 'Failed to verify user.',
                    'error'
                );
            }
        }
    };

    const handleReject = async (userId, userName) => {
        const { value: reason } = await Swal.fire({
            title: 'Reject Graduate?',
            text: `Please provide a reason for rejecting ${userName}:`,
            input: 'textarea',
            inputLabel: 'Rejection Reason',
            inputPlaceholder: 'Type your reason here...',
            inputAttributes: {
                'aria-label': 'Type your reason here'
            },
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, reject',
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to write a reason!';
                }
                if (value.trim().length < 5) {
                    return 'Rejection reason must be at least 5 characters.';
                }
            }
        });

        if (reason) {
            try {
                await api.put(`/users/${userId}/reject`, { reason });

                // Update specific user in list locally (remove them)
                setPendingUsers(prev => prev.filter(u => u.id !== userId));

                // Update stats
                setStats(prev => ({
                    ...prev,
                    pending: prev.pending - 1
                }));

                Swal.fire(
                    'Rejected!',
                    `${userName} has been rejected, all active sessions were revoked, and the account was removed. They can re-register after correcting the issue.`,
                    'success'
                );
            } catch (error) {
                console.error('Rejection failed:', error);
                Swal.fire(
                    'Error!',
                    error.response?.data?.error || 'Failed to reject user.',
                    'error'
                );
            }
        }
    };

    const openDegreeFile = (fileUrl) => {
        if (!fileUrl) return;
        (async () => {
            try {
                let url = fileUrl;
                if (!url.startsWith('http')) {
                    url = getFileUrl(fileUrl);
                }
                url = await getSignedFileUrl(url);
                window.open(url, '_blank', 'noopener,noreferrer');
            } catch (error) {
                console.error('Failed to open degree file:', error);
                Swal.fire('Error', 'Failed to open certificate file.', 'error');
            }
        })();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-700"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Manage graduates and verifications</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 mb-10">
                <StatCard
                    icon={GraduationCap}
                    label="Total Graduates"
                    value={stats.total}
                    color="from-navy-500 to-navy-700"
                    delay={0.1}
                />
                <StatCard
                    icon={Clock}
                    label="Pending"
                    value={stats.pending}
                    color="from-yellow-500 to-orange-500"
                    delay={0.2}
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Verified"
                    value={stats.verified}
                    color="from-green-500 to-emerald-600"
                    delay={0.3}
                />
                <StatCard
                    icon={Building2}
                    label="Universities"
                    value={stats.universities}
                    color="from-blue-500 to-blue-700"
                    delay={0.4}
                />
                <StatCard
                    icon={Users}
                    label="Departments"
                    value={stats.departments}
                    color="from-purple-500 to-purple-700"
                    delay={0.5}
                />
            </div>

            {/* Verification Queue */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-card overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-navy-50 to-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-navy-100 rounded-lg">
                            <FileText className="w-5 h-5 text-navy-700" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Verification Queue</h2>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pendingUsers.length} Pending
                    </span>
                </div>

                {pendingUsers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p className="text-xl">All caught up! 🎉</p>
                        <p className="text-sm mt-2">No graduates pending verification.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Graduate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {pendingUsers.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            layout
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {user.profile_photo ? (
                                                            <img className="h-10 w-10 rounded-full object-cover"
                                                                src={getFileUrl(user.profile_photo)}
                                                                alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-navy-700 font-bold">
                                                                {user.first_name[0]}{user.last_name[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.degree_type}</div>
                                                <div className="text-sm text-gray-500">{user.department_name}</div>
                                                <div className="text-xs text-gray-400">{user.university_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <motion.button
                                                    onClick={() => openDegreeFile(user.degree_file)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="flex items-center gap-2 text-navy-700 hover:text-navy-900 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-navy-50 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Certificate
                                                </motion.button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <motion.button
                                                    onClick={() => handleVerify(user.id, `${user.first_name} ${user.last_name}`)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition shadow-md hover:shadow-lg"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Verify
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => handleReject(user.id, `${user.first_name} ${user.last_name}`)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition shadow-md hover:shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Reject
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

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white rounded-xl shadow-card hover:shadow-card-hover p-6 transition-all duration-300 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-full -mr-10 -mt-10 group-hover:opacity-20 transition-opacity`} />
        <div className="relative z-10">
            <div className={`inline-flex p-3 bg-gradient-to-br ${color} rounded-xl mb-4`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{label}</div>
            <div className={`text-4xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {value}
            </div>
        </div>
    </motion.div>
);

export default Dashboard;
