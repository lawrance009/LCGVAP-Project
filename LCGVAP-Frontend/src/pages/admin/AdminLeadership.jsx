import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';

const AdminLeadership = () => {
    const [leaders, setLeaders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCurrent, setIsCurrent] = useState(true);
    const [orderIndex, setOrderIndex] = useState(0);

    useEffect(() => {
        fetchLeaders();
    }, []);

    const fetchLeaders = async () => {
        try {
            const response = await api.get('/leaders');
            const allLeaders = [...response.data.current, ...response.data.past];
            setLeaders(allLeaders);
        } catch (error) {
            console.error('Error fetching leaders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('position', position);
            formData.append('bio', bio);
            formData.append('start_date', startDate);
            formData.append('end_date', isCurrent ? '' : endDate); // Allow empty date
            formData.append('is_current', isCurrent);
            formData.append('order_index', orderIndex);

            if (image) {
                formData.append('image', image);
            }

            if (editingId) {
                await api.put(`/leaders/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire('Success', 'Leader updated!', 'success');
            } else {
                await api.post('/leaders', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire('Success', 'Leader added!', 'success');
            }

            setIsModalOpen(false);
            resetForm();
            fetchLeaders();
        } catch (error) {
            console.error('Error saving leader:', error);
            Swal.fire('Error', 'Failed to save leader', 'error');
        }
    };

    const handleEdit = (leader) => {
        setEditingId(leader.id);
        setName(leader.name);
        setPosition(leader.position);
        setBio(leader.bio || '');
        setStartDate(leader.start_date.split('T')[0]); // Extract YYYY-MM-DD
        setEndDate(leader.end_date ? leader.end_date.split('T')[0] : '');
        setIsCurrent(leader.is_current);
        setOrderIndex(leader.order_index);
        setImage(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Leader?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/leaders/${id}`);
                Swal.fire('Deleted!', 'Leader has been deleted.', 'success');
                fetchLeaders();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete leader', 'error');
            }
        }
    };

    const resetForm = () => {
        setName('');
        setPosition('');
        setBio('');
        setImage(null);
        setStartDate('');
        setEndDate('');
        setIsCurrent(true);
        setOrderIndex(0);
        setEditingId(null);
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Leadership Management</h1>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                    + Add Leader
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenure</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {leaders.map((leader) => (
                                <tr key={leader.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                                {leader.image_url ? (
                                                    <img src={leader.image_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-500 font-bold">L</div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{leader.name}</div>
                                                <div className="text-sm text-gray-500">{leader.position}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(leader.start_date).getFullYear()} - {leader.end_date ? new Date(leader.end_date).getFullYear() : 'Present'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {leader.is_current ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Current
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Past
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(leader)}
                                            className="text-indigo-600 hover:text-indigo-900 font-bold mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(leader.id)}
                                            className="text-red-600 hover:text-red-900 font-bold"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingId ? 'Edit Leader' : 'Add Leader'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Position</label>
                                <input type="text" required value={position} onChange={(e) => setPosition(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input type="date" disabled={isCurrent} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100" />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
                                    <span className="text-sm font-medium text-gray-700">Current Executive Member</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bio (Optional)</label>
                                <textarea rows="3" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Photo</label>
                                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Order/Rank (Display Priority)</label>
                                <input type="number" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                <p className="text-xs text-gray-500">Lower numbers appear first (e.g., President = 1, VP = 2).</p>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{editingId ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLeadership;
