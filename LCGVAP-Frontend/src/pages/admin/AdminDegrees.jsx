import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getSignedFileUrl } from '../../services/api';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import getFileUrl from '../../utils/getFileUrl';

const AdminDegrees = () => {
    const [degrees, setDegrees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const { data } = await api.get('/degrees/pending');
            setDegrees(data);
        } catch (err) {
            console.error('Error fetching pending degrees:', err);
            Swal.fire('Error', 'Failed to fetch pending degrees.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (degree) => {
        const result = await Swal.fire({
            title: `Verify ${degree.first_name}'s ${degree.degree_type}?`,
            text: `This will award a badge and mark this degree as verified.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Verify & Award Badge',
        });

        if (!result.isConfirmed) return;

        try {
            await api.put(`/degrees/${degree.id}/verify`);
            setDegrees(prev => prev.filter(d => d.id !== degree.id));
            Swal.fire({
                icon: 'success',
                title: 'Verified!',
                text: `${degree.first_name}'s ${degree.degree_type} degree has been verified and a badge has been awarded.`,
            });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Failed to verify degree.', 'error');
        }
    };

    const handleReject = async (degree) => {
        const { value: reason } = await Swal.fire({
            title: `Reject ${degree.first_name}'s ${degree.degree_type}?`,
            html: `<p class="text-sm text-gray-500 mb-2">Please provide a reason for rejecting this degree credential.</p>`,
            input: 'textarea',
            inputLabel: 'Rejection Reason',
            inputPlaceholder: 'e.g., Document is blurry, name does not match, degree type mismatch...',
            inputAttributes: { 'aria-label': 'Rejection reason' },
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Reject Degree',
            inputValidator: (value) => {
                if (!value) return 'You must provide a rejection reason!';
            },
        });

        if (!reason) return;

        try {
            await api.put(`/degrees/${degree.id}/reject`, { reason });
            setDegrees(prev => prev.filter(d => d.id !== degree.id));
            Swal.fire({
                icon: 'info',
                title: 'Degree Rejected',
                text: `${degree.first_name}'s ${degree.degree_type} degree has been rejected.`,
            });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Failed to reject degree.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading pending degrees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Degree Verification Queue</h1>
                    <p className="text-sm text-gray-500 mt-1">Review and verify or reject submitted degree credentials</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-4 py-2 rounded-full">
                    {degrees.length} Pending
                </span>
            </div>

            {/* Empty State */}
            {degrees.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">All Caught Up!</h3>
                    <p className="text-gray-500">No degrees are pending verification right now.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {degrees.map((degree) => (
                            <motion.div
                                key={degree.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20, height: 0 }}
                                layout
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                <div className="p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* Graduate Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                                                    {degree.first_name?.[0]}{degree.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{degree.first_name} {degree.last_name}</h3>
                                                    <p className="text-sm text-gray-500">{degree.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Degree Details */}
                                        <div className="flex-1">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-400 text-xs uppercase tracking-wider">Type</span>
                                                    <p className="font-semibold text-gray-800">
                                                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded">
                                                            {degree.degree_type}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 text-xs uppercase tracking-wider">Year</span>
                                                    <p className="font-semibold text-gray-800">{degree.graduation_year || '—'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 text-xs uppercase tracking-wider">University</span>
                                                    <p className="font-medium text-gray-700 truncate">{degree.university_name || '—'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 text-xs uppercase tracking-wider">Department</span>
                                                    <p className="font-medium text-gray-700 truncate">{degree.department_name || '—'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* View Document */}
                                            {degree.degree_file && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const url = await getSignedFileUrl(getFileUrl(degree.degree_file));
                                                            window.open(url, '_blank', 'noopener,noreferrer');
                                                        } catch (error) {
                                                            console.error('Failed to open degree file:', error);
                                                            Swal.fire('Error', 'Failed to open degree document.', 'error');
                                                        }
                                                    }}
                                                    className="px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
                                                >
                                                    📄 View Document
                                                </button>
                                            )}

                                            {/* Verify */}
                                            <motion.button
                                                onClick={() => handleVerify(degree)}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition"
                                            >
                                                ✓ Verify
                                            </motion.button>

                                            {/* Reject */}
                                            <motion.button
                                                onClick={() => handleReject(degree)}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
                                            >
                                                ✗ Reject
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Submitted date */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-400">
                                            Submitted {new Date(degree.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </span>
                                        {degree.field_of_study && (
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                {degree.field_of_study}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AdminDegrees;
