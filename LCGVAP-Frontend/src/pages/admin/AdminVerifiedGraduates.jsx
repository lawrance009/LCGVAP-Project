import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getSignedFileUrl } from '../../services/api';
import Swal from 'sweetalert2';
import getFileUrl from '../../utils/getFileUrl';

const AdminVerifiedGraduates = () => {
    const [graduates, setGraduates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGraduate, setSelectedGraduate] = useState(null);

    useEffect(() => {
        fetchGraduates();
    }, []);

    const fetchGraduates = async () => {
        try {
            const response = await api.get('/users/graduates'); // Corrected endpoint
            setGraduates(response.data);
        } catch (error) {
            console.error('Error fetching graduates:', error);
            Swal.fire('Error', 'Failed to fetch verified graduates.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (grad) => {
        setSelectedGraduate(grad);
    };

    const closeDetails = () => {
        setSelectedGraduate(null);
    };

    const handleDeleteGraduate = async (grad) => {
        const result = await Swal.fire({
            title: `Delete ${grad.first_name} ${grad.last_name}?`,
            text: 'This will permanently remove this graduate record. This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete graduate',
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`/users/graduates/${grad.id}`);
            setGraduates(prev => prev.filter(g => g.id !== grad.id));
            if (selectedGraduate?.id === grad.id) setSelectedGraduate(null);
            Swal.fire('Deleted', `${grad.first_name}'s record has been removed.`, 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Failed to delete graduate.', 'error');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading verified graduates...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Verified Graduates (Full Details)</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degree</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passport No.</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {graduates.map((grad) => (
                                <tr key={grad.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {grad.profile_photo ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={getFileUrl(grad.profile_photo)} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                        {grad.first_name[0]}{grad.last_name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{grad.first_name} {grad.last_name}</div>
                                                <div className="text-sm text-gray-500">{grad.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{grad.university_name}</div>
                                        <div className="text-sm text-gray-500">{grad.department_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {grad.degree_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {grad.passport_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDetails(grad)}
                                                className="text-indigo-600 hover:text-indigo-900 font-bold"
                                            >
                                                View Profile
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGraduate(grad)}
                                                className="text-red-500 hover:text-red-700 font-bold border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {graduates.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No verified graduates found.</div>
                )}
            </div>

            {/* Full Details Modal */}
            {selectedGraduate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeDetails}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h2 className="text-xl font-bold text-gray-800">Graduate Details (Private)</h2>
                            <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-shrink-0">
                                    {selectedGraduate.profile_photo ? (
                                        <img className="h-32 w-32 rounded-lg object-cover shadow-sm border" src={getFileUrl(selectedGraduate.profile_photo)} alt="" />
                                    ) : (
                                        <div className="h-32 w-32 rounded-lg bg-gray-200 flex items-center justify-center text-4xl text-gray-400 font-bold">
                                            {selectedGraduate.first_name[0]}{selectedGraduate.last_name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <h3 className="text-2xl font-bold text-gray-900 border-b pb-2">
                                        {selectedGraduate.first_name} {selectedGraduate.last_name}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                                            <p className="font-medium text-gray-800">{selectedGraduate.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                                            <p className="font-medium text-gray-800">{selectedGraduate.phone || 'N/A'}</p>
                                        </div>

                                        <div className="bg-red-50 p-3 rounded border border-red-100">
                                            <label className="text-xs font-bold text-red-600 uppercase">Passport Number (Private)</label>
                                            <p className="font-mono font-bold text-gray-800 text-lg">{selectedGraduate.passport_number}</p>
                                        </div>
                                        <div className="bg-red-50 p-3 rounded border border-red-100">
                                            <label className="text-xs font-bold text-red-600 uppercase">Date of Birth (Private)</label>
                                            <p className="font-medium text-gray-800">{new Date(selectedGraduate.date_of_birth).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">University</label>
                                        <p className="font-medium text-gray-800">{selectedGraduate.university_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                                        <p className="font-medium text-gray-800">{selectedGraduate.department_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Degree Type</label>
                                        <p className="font-medium text-gray-800">{selectedGraduate.degree_type}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Advisor</label>
                                        <p className="font-medium text-gray-800">{selectedGraduate.advisor_first} {selectedGraduate.advisor_last}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Documents</h4>
                                {selectedGraduate.degree_file ? (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const url = await getSignedFileUrl(getFileUrl(selectedGraduate.degree_file));
                                                window.open(url, '_blank', 'noopener,noreferrer');
                                            } catch (error) {
                                                console.error('Failed to open certificate:', error);
                                                Swal.fire('Error', 'Failed to open degree certificate.', 'error');
                                            }
                                        }}
                                        className="flex items-center p-4 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors group"
                                    >
                                        <svg className="w-8 h-8 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-indigo-900 group-hover:underline">View Degree Certificate (PDF)</p>
                                            <p className="text-xs text-indigo-600">Click to open file in new tab</p>
                                        </div>
                                    </button>
                                ) : (
                                    <p className="text-gray-500 italic">No degree file uploaded.</p>
                                )}
                            </div>

                            {selectedGraduate.bio && (
                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Bio</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedGraduate.bio}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={closeDetails}
                                className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerifiedGraduates;
