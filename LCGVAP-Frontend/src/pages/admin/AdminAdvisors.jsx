import { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAdvisors = () => {
    const [advisors, setAdvisors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdvisor, setEditingAdvisor] = useState(null);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', department_id: '' });
    const [selectedUniversity, setSelectedUniversity] = useState(''); // New state for cascading

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [advRes, deptsRes, unisRes] = await Promise.all([
                api.get('/advisors'),
                api.get('/departments'),
                api.get('/universities')
            ]);
            setAdvisors(advRes.data);
            setDepartments(deptsRes.data);
            setUniversities(unisRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleOpenModal = (advisor = null) => {
        if (advisor) {
            setEditingAdvisor(advisor);
            setFormData({
                first_name: advisor.first_name,
                last_name: advisor.last_name,
                email: advisor.email,
                department_id: advisor.department_id
            });
            // Pre-select University based on Department
            const dept = departments.find(d => d.id === advisor.department_id);
            if (dept) {
                setSelectedUniversity(dept.university_id);
            } else {
                setSelectedUniversity('');
            }
        } else {
            setEditingAdvisor(null);
            setFormData({ first_name: '', last_name: '', email: '', department_id: '' });
            setSelectedUniversity('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAdvisor(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAdvisor) {
                await api.put(`/advisors/${editingAdvisor.id}`, formData);
                Swal.fire('Updated!', 'Advisor updated.', 'success');
            } else {
                await api.post('/advisors', formData);
                Swal.fire('Created!', 'New advisor added.', 'success');
            }
            handleCloseModal();
            const res = await api.get('/advisors');
            setAdvisors(res.data);
        } catch (error) {
            const msg = error.response?.data?.message || 'Operation failed';
            Swal.fire('Error', msg, 'error');
        }
    };

    const handleDelete = async (advisor) => {
        const result = await Swal.fire({
            title: 'Delete Advisor?',
            text: `Are you sure you want to delete ${advisor.first_name} ${advisor.last_name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/advisors/${advisor.id}`);
                Swal.fire('Deleted!', 'Advisor removed.', 'success');
                setAdvisors(prev => prev.filter(a => a.id !== advisor.id));
            } catch (error) {
                Swal.fire('Error', 'Could not delete advisor.', 'error');
            }
        }
    };

    const getDeptName = (deptId) => {
        const dept = departments.find(d => d.id === deptId);
        return dept ? dept.name : 'Unknown';
    };

    // Helper to get University Name for Table
    const getUniNameByDeptId = (deptId) => {
        const dept = departments.find(d => d.id === deptId);
        if (!dept) return 'Unknown';
        const uni = universities.find(u => u.id === dept.university_id);
        return uni ? uni.name : 'Unknown';
    };

    // Filter departments based on selected University
    const filteredDepartments = selectedUniversity
        ? departments.filter(d => d.university_id == selectedUniversity)
        : [];

    if (loading) return <div className="p-8 text-center">Loading advisors...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Academic Advisors</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition shadow-lg flex items-center"
                >
                    <span className="mr-2">+</span> Add Advisor
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <AnimatePresence>
                                {advisors.map((advisor) => (
                                    <motion.tr
                                        key={advisor.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        layout
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {advisor.first_name} {advisor.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{advisor.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getUniNameByDeptId(advisor.department_id)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDeptName(advisor.department_id)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            <button
                                                onClick={() => handleOpenModal(advisor)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(advisor)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {advisors.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No advisors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={handleCloseModal}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        {editingAdvisor ? 'Edit Advisor' : 'Add Advisor'}
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-1/2">
                                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                                    value={formData.first_name}
                                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                />
                                            </div>
                                            <div className="w-1/2">
                                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                                    value={formData.last_name}
                                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>

                                        {/* University Selection (For Filtering Only) */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">University</label>
                                            <select
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                                value={selectedUniversity}
                                                onChange={(e) => {
                                                    setSelectedUniversity(e.target.value);
                                                    setFormData({ ...formData, department_id: '' }); // Reset Dep when Uni changes
                                                }}
                                            >
                                                <option value="">Select University (Filter)</option>
                                                {universities.map(uni => (
                                                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Department Selection (Filtered) */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Department</label>
                                            <select
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                                value={formData.department_id}
                                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                                disabled={!selectedUniversity}
                                            >
                                                <option value="">
                                                    {!selectedUniversity ? 'Select a University first' : 'Select Department'}
                                                </option>
                                                {filteredDepartments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAdvisors;
