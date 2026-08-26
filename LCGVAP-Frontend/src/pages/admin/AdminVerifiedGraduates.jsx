import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getSignedFileUrl } from '../../services/api';
import Swal from 'sweetalert2';
import getFileUrl from '../../utils/getFileUrl';

const emptyEditForm = {
    first_name: '',
    last_name: '',
    email: '',
    university_id: '',
    department_id: '',
    degree_type: 'Bachelor',
    graduation_year: '',
    bio: '',
};

const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const AdminVerifiedGraduates = () => {
    const [mode, setMode] = useState('active');
    const [graduates, setGraduates] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGraduate, setSelectedGraduate] = useState(null);
    const [editingGraduate, setEditingGraduate] = useState(null);
    const [editForm, setEditForm] = useState(emptyEditForm);

    const availableDepartments = useMemo(() => {
        if (!editForm.university_id) return [];

        const selectedUniversityId = String(editForm.university_id);
        const departmentsByName = new Map();

        departments.forEach((department) => {
            const departmentUniversityId = department.university_id ? String(department.university_id) : '';
            const isGlobal = !departmentUniversityId;
            const isForSelectedUniversity = departmentUniversityId === selectedUniversityId;

            if (!isGlobal && !isForSelectedUniversity) return;

            const key = String(department.name || '').trim().toLowerCase();
            if (!key) return;

            const existing = departmentsByName.get(key);
            if (!existing || isForSelectedUniversity) {
                departmentsByName.set(key, department);
            }
        });

        return Array.from(departmentsByName.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [departments, editForm.university_id]);

    const fetchGraduates = useCallback(async (nextMode) => {
        setLoading(true);
        try {
            const endpoint = nextMode === 'archived' ? '/users/graduates/archive' : '/users/graduates';
            const response = await api.get(endpoint);
            setGraduates(response.data || []);
        } catch (error) {
            console.error('Error fetching graduates:', error);
            Swal.fire('Error', 'Failed to fetch graduates.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSupportingData = async () => {
        try {
            const [universitiesRes, departmentsRes] = await Promise.all([
                api.get('/universities'),
                api.get('/departments'),
            ]);
            setUniversities(universitiesRes.data || []);
            setDepartments(departmentsRes.data || []);
        } catch (error) {
            console.warn('Failed to load graduate edit dropdowns:', error);
        }
    };

    useEffect(() => {
        fetchSupportingData();
    }, []);

    useEffect(() => {
        fetchGraduates(mode);
    }, [fetchGraduates, mode]);

    const handleModeChange = (nextMode) => {
        setSelectedGraduate(null);
        setEditingGraduate(null);
        setMode(nextMode);
    };

    const handleOpenEdit = (graduate) => {
        setEditingGraduate(graduate);
        setEditForm({
            first_name: graduate.first_name || '',
            last_name: graduate.last_name || '',
            email: graduate.email || '',
            university_id: graduate.university_id || '',
            department_id: graduate.department_id || '',
            degree_type: graduate.degree_type || 'Bachelor',
            graduation_year: graduate.graduation_year || '',
            bio: graduate.bio || '',
        });
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'university_id' ? { department_id: '' } : {}),
        }));
    };

    const handleSaveEdit = async (event) => {
        event.preventDefault();
        if (!editingGraduate) return;

        try {
            const payload = {
                ...editForm,
                university_id: editForm.university_id || null,
                department_id: editForm.department_id || null,
                graduation_year: editForm.graduation_year || null,
            };

            await api.put(`/users/graduates/${editingGraduate.id}`, payload);
            setEditingGraduate(null);
            await fetchGraduates(mode);
            Swal.fire('Saved', 'Graduate updated successfully.', 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Failed to update graduate.', 'error');
        }
    };

    const handleArchiveGraduate = async (graduate) => {
        const result = await Swal.fire({
            title: `Archive ${graduate.first_name} ${graduate.last_name}?`,
            text: 'This removes the graduate from active and public views, but keeps an archive record for restore.',
            input: 'textarea',
            inputPlaceholder: 'Reason, optional',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Archive graduate',
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/users/graduates/${graduate.id}`, {
                data: { reason: result.value || null },
            });
            setGraduates((prev) => prev.filter((item) => item.id !== graduate.id));
            if (selectedGraduate?.id === graduate.id) setSelectedGraduate(null);
            Swal.fire('Archived', `${graduate.first_name}'s record moved to archive.`, 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Failed to archive graduate.', 'error');
        }
    };

    const handleRestoreGraduate = async (graduate) => {
        const result = await Swal.fire({
            title: `Restore ${graduate.first_name} ${graduate.last_name}?`,
            text: 'This moves the graduate back into the active verified graduates list.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'Restore graduate',
        });

        if (!result.isConfirmed) return;

        try {
            await api.put(`/users/graduates/${graduate.id}/restore`);
            setGraduates((prev) => prev.filter((item) => item.id !== graduate.id));
            if (selectedGraduate?.id === graduate.id) setSelectedGraduate(null);
            Swal.fire('Restored', `${graduate.first_name}'s record is active again.`, 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Failed to restore graduate.', 'error');
        }
    };

    const openDegreeFile = async (degreeFile) => {
        try {
            const url = await getSignedFileUrl(getFileUrl(degreeFile));
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Failed to open certificate:', error);
            Swal.fire('Error', 'Failed to open degree certificate.', 'error');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading graduates...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Graduates Management</h1>
                    <p className="text-sm text-gray-500">Manage verified graduates and restore archived records.</p>
                </div>
                <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <button
                        type="button"
                        onClick={() => handleModeChange('active')}
                        className={`px-4 py-2 text-sm font-semibold ${mode === 'active' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Active
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeChange('archived')}
                        className={`px-4 py-2 text-sm font-semibold ${mode === 'archived' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Archive
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degree</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passport No.</th>
                                {mode === 'archived' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archived</th>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {graduates.map((graduate) => (
                                <tr key={graduate.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {graduate.profile_photo ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={getFileUrl(graduate.profile_photo)} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                        {graduate.first_name?.[0]}{graduate.last_name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{graduate.first_name} {graduate.last_name}</div>
                                                <div className="text-sm text-gray-500">{graduate.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{graduate.university_name || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{graduate.department_name || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {graduate.degree_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {graduate.passport_number || 'N/A'}
                                    </td>
                                    {mode === 'archived' && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{formatDate(graduate.archived_at)}</div>
                                            {graduate.archive_reason && (
                                                <div className="max-w-xs truncate text-xs text-gray-400">{graduate.archive_reason}</div>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setSelectedGraduate(graduate)} className="text-indigo-600 hover:text-indigo-900 font-bold">
                                                View
                                            </button>
                                            {mode === 'active' ? (
                                                <>
                                                    <button onClick={() => handleOpenEdit(graduate)} className="text-gray-700 hover:text-gray-900 font-bold">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleArchiveGraduate(graduate)} className="text-red-500 hover:text-red-700 font-bold border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                                                        Archive
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={() => handleRestoreGraduate(graduate)} className="text-green-700 hover:text-green-900 font-bold border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">
                                                    Restore
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {graduates.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        {mode === 'active' ? 'No active verified graduates found.' : 'No archived graduates found.'}
                    </div>
                )}
            </div>

            {selectedGraduate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedGraduate(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h2 className="text-xl font-bold text-gray-800">Graduate Details</h2>
                            <button onClick={() => setSelectedGraduate(null)} className="text-gray-400 hover:text-gray-600" aria-label="Close details">
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
                                            {selectedGraduate.first_name?.[0]}{selectedGraduate.last_name?.[0]}
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
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Graduation Year</label>
                                            <p className="font-medium text-gray-800">{selectedGraduate.graduation_year || 'N/A'}</p>
                                        </div>
                                        <div className="bg-red-50 p-3 rounded border border-red-100">
                                            <label className="text-xs font-bold text-red-600 uppercase">Passport Number</label>
                                            <p className="font-mono font-bold text-gray-800 text-lg">{selectedGraduate.passport_number || 'N/A'}</p>
                                        </div>
                                        <div className="bg-red-50 p-3 rounded border border-red-100">
                                            <label className="text-xs font-bold text-red-600 uppercase">Date of Birth</label>
                                            <p className="font-medium text-gray-800">{formatDate(selectedGraduate.date_of_birth)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">University</label>
                                        <p className="font-medium text-gray-800">{selectedGraduate.university_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                                        <p className="font-medium text-gray-800">{selectedGraduate.department_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Degree Type</label>
                                        <p className="font-medium text-gray-800">{selectedGraduate.degree_type}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedGraduate.archived_at && (
                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Archive Information</h4>
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-sm text-amber-900">
                                        <p><span className="font-bold">Archived:</span> {formatDate(selectedGraduate.archived_at)}</p>
                                        {selectedGraduate.archive_reason && <p><span className="font-bold">Reason:</span> {selectedGraduate.archive_reason}</p>}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Documents</h4>
                                {selectedGraduate.degree_file ? (
                                    <button
                                        onClick={() => openDegreeFile(selectedGraduate.degree_file)}
                                        className="flex items-center p-4 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors group"
                                    >
                                        <svg className="w-8 h-8 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-indigo-900 group-hover:underline">View Degree Certificate</p>
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
                            <button onClick={() => setSelectedGraduate(null)} className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingGraduate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setEditingGraduate(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
                        <form onSubmit={handleSaveEdit}>
                            <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                <h2 className="text-xl font-bold text-gray-800">Edit Graduate</h2>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">First Name</label>
                                    <input name="first_name" value={editForm.first_name} onChange={handleEditChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Last Name</label>
                                    <input name="last_name" value={editForm.last_name} onChange={handleEditChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                                    <input type="email" name="email" value={editForm.email} onChange={handleEditChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">University</label>
                                    <select name="university_id" value={editForm.university_id} onChange={handleEditChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                        <option value="">Select university</option>
                                        {universities.map((university) => (
                                            <option key={university.id} value={university.id}>{university.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
                                    <select name="department_id" value={editForm.department_id} onChange={handleEditChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" disabled={!editForm.university_id}>
                                        <option value="">Select department</option>
                                        {availableDepartments.map((department) => (
                                            <option key={department.id} value={department.id}>{department.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Degree Type</label>
                                    <select name="degree_type" value={editForm.degree_type} onChange={handleEditChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                        <option value="Bachelor">Bachelor</option>
                                        <option value="Master">Master</option>
                                        <option value="PhD">PhD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Graduation Year</label>
                                    <input type="number" name="graduation_year" value={editForm.graduation_year} onChange={handleEditChange} min="1950" max={new Date().getFullYear() + 1} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bio</label>
                                    <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                <button type="button" onClick={() => setEditingGraduate(null)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 border border-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerifiedGraduates;
