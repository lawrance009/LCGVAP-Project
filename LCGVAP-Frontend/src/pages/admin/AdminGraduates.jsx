import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import getFileUrl from '../../utils/getFileUrl';

const AdminGraduates = () => {
    const [graduates, setGraduates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        university: '',
        bio: '',
        photo_url: '',
        degree_type: 'Bachelor',
        graduation_year: new Date().getFullYear(),
        featured_story: '',
        is_featured: false,
        user_id: ''
    });

    useEffect(() => {
        fetchGraduates();
    }, []);

    const fetchGraduates = async () => {
        try {
            setLoading(true);
            const response = await api.get('/graduates-showcase');
            setGraduates(response.data);
        } catch (error) {
            console.error('Error fetching graduates:', error);
            alert('Error loading graduates');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.file;
        if (file.type.startsWith('image/')) {
            setPhotoFile(file);
            setExistingPhotoUrl(null);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotoPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            message.error('Please upload an image file');
        }
    };

    const uploadPhoto = async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        
        try {
            const response = await api.post('/upload/graduate-photo', formDataUpload);
            return response.data.url;
        } catch (error) {
            console.error('Upload error:', error);
            message.warning('Photo upload failed, but graduate can be saved');
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.department || !formData.university) {
            alert('Please fill in required fields');
            return;
        }

        try {
            let photoUrl = existingPhotoUrl;

            // If a new file was selected, upload it
            if (photoFile) {
                photoUrl = await uploadPhoto(photoFile);
            }

            const dataToSend = {
                ...formData,
                photo_url: photoUrl || formData.photo_url || ''
            };

            if (editingId) {
                await api.put(`/graduates-showcase/${editingId}`, dataToSend);
                alert('Graduate updated successfully');
            } else {
                await api.post('/graduates-showcase', dataToSend);
                alert('Graduate added successfully');
            }
            fetchGraduates();
            resetForm();
        } catch (error) {
            console.error('Error saving graduate:', error);
            alert('Error saving graduate');
        }
    };

    const handleEdit = (graduate) => {
        setFormData(graduate);
        setExistingPhotoUrl(graduate.photo_url);
        setPhotoPreview(graduate.photo_url ? getFileUrl(graduate.photo_url) : null);
        setPhotoFile(null);
        setEditingId(graduate.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this graduate?')) {
            return;
        }

        try {
            await api.delete(`/graduates-showcase/${id}`);
            alert('Graduate deleted successfully');
            fetchGraduates();
        } catch (error) {
            console.error('Error deleting graduate:', error);
            alert('Error deleting graduate');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            department: '',
            university: '',
            bio: '',
            photo_url: '',
            degree_type: 'Bachelor',
            graduation_year: new Date().getFullYear(),
            featured_story: '',
            is_featured: false,
            user_id: ''
        });
        setPhotoFile(null);
        setPhotoPreview(null);
        setExistingPhotoUrl(null);
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-gray-900 mb-4">Featured Graduates Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-bold transition-all"
                >
                    {showForm ? 'Cancel' : '+ Add Graduate'}
                </button>
            </div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 p-8 rounded-xl mb-8 border border-gray-200"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Graduate' : 'Add New Graduate'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Department *</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">University *</label>
                                <input
                                    type="text"
                                    name="university"
                                    value={formData.university}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Degree Type</label>
                                <select
                                    name="degree_type"
                                    value={formData.degree_type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                >
                                    <option>Bachelor</option>
                                    <option>Master</option>
                                    <option>PhD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Graduation Year</label>
                                <input
                                    type="number"
                                    name="graduation_year"
                                    value={formData.graduation_year}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Graduate Photo</label>
                                <Upload
                                    maxCount={1}
                                    beforeUpload={(file) => {
                                        if (!file.type.startsWith('image/')) {
                                            message.error('Please upload an image file');
                                            return false;
                                        }
                                        handlePhotoChange({ file });
                                        return false;
                                    }}
                                    customRequest={() => {}}
                                    accept="image/*"
                                    listType="picture"
                                >
                                    <Button icon={<UploadOutlined />}>Click to Upload Photo</Button>
                                </Upload>
                            </div>

                            {photoPreview && (
                                <div className="col-span-2 p-3 border border-gray-300 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Photo Preview:</p>
                                    <img src={photoPreview} alt="preview" className="max-h-32 max-w-full" onError={() => setPhotoPreview(null)} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-2">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                                placeholder="Short professional bio"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-2">Featured Story</label>
                            <textarea
                                name="featured_story"
                                value={formData.featured_story}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                                placeholder="Tell their inspiring story..."
                            ></textarea>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_featured"
                                checked={formData.is_featured}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-indigo-600"
                            />
                            <label className="ml-3 font-bold text-gray-700">Featured on Homepage</label>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-8 py-2 rounded-lg hover:bg-indigo-700 font-bold transition-all"
                            >
                                {editingId ? 'Update' : 'Add'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-400 text-white px-8 py-2 rounded-lg hover:bg-gray-500 font-bold transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid gap-6">
                {graduates.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-600 text-lg">No graduates added yet</p>
                    </div>
                ) : (
                    graduates.map((grad) => (
                        <motion.div
                            key={grad.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-gray-900">{grad.name}</h3>
                                        {grad.is_featured && <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">Featured</span>}
                                    </div>
                                    <p className="text-indigo-600 font-bold">{grad.degree_type} • {grad.graduation_year}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(grad)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-bold transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(grad.id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-bold transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700 mb-4">
                                <p><span className="font-bold">Department:</span> {grad.department}</p>
                                <p><span className="font-bold">University:</span> {grad.university}</p>
                                <p><span className="font-bold">ID:</span> {grad.id}</p>
                            </div>

                            {grad.featured_story && <p className="text-gray-700 mb-3 italic">"{grad.featured_story.substring(0, 150)}..."</p>}

                            {grad.photo_url && <p className="text-gray-600 text-sm">📷 Photo: {grad.photo_url}</p>}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminGraduates;
