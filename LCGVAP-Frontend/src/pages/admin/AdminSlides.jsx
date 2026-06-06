import { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import getFileUrl from '../../utils/getFileUrl';

const AdminSlides = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [formData, setFormData] = useState({ title: '', subtitle: '', slide_order: 0, is_active: true });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const response = await api.get('/slides');
            setSlides(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching slides:', error);
            setLoading(false);
        }
    };

    const handleOpenModal = (slide = null) => {
        if (slide) {
            setEditingSlide(slide);
            setFormData({
                title: slide.title || '',
                subtitle: slide.subtitle || '',
                slide_order: slide.slide_order || 0,
                is_active: slide.is_active
            });
            setImageFile(null); // Reset image on edit
        } else {
            setEditingSlide(null);
            setFormData({ title: '', subtitle: '', slide_order: 0, is_active: true });
            setImageFile(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSlide(null);
        setImageFile(null);
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingSlide) {
                // Update
                const updateData = { ...formData };
                // Creating a separate endpoint for image update might be better, 
                // but for now let's assume updateSlide only handles text fields as per controller.
                // If we want to update image, we'd need another approach or modify controller.
                // For simplified flow, we only update text/order/active status on edit.
                await api.put(`/slides/${editingSlide.id}`, updateData);
                Swal.fire('Updated!', 'Slide details updated.', 'success');
            } else {
                // Create
                if (!imageFile) {
                    Swal.fire('Error', 'Please select an image.', 'error');
                    return;
                }
                const data = new FormData();
                data.append('image', imageFile);
                data.append('title', formData.title);
                data.append('subtitle', formData.subtitle);
                data.append('slide_order', formData.slide_order);

                await api.post('/slides', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire('Created!', 'New slide added.', 'success');
            }
            handleCloseModal();
            fetchSlides();
        } catch (error) {
            const msg = error.response?.data?.message || 'Operation failed';
            Swal.fire('Error', msg, 'error');
        }
    };

    const handleDelete = async (slide) => {
        const result = await Swal.fire({
            title: 'Delete Slide?',
            text: "Are you sure? This cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/slides/${slide.id}`);
                Swal.fire('Deleted!', 'Slide has been removed.', 'success');
                setSlides(prev => prev.filter(s => s.id !== slide.id));
            } catch (error) {
                Swal.fire('Error', 'Could not delete slide.', 'error');
            }
        }
    };

    const toggleActive = async (slide) => {
        try {
            await api.put(`/slides/${slide.id}`, {
                ...slide,
                is_active: !slide.is_active
            });
            fetchSlides();
        } catch (error) {
            console.error('Error toggling active status:', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading slides...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Hero Slider Manager</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition shadow-lg flex items-center"
                >
                    <span className="mr-2">+</span> Add New Slide
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {slides.map((slide) => (
                        <motion.div
                            key={slide.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                            className={`bg-white rounded-lg shadow-md overflow-hidden border ${slide.is_active ? 'border-gray-200' : 'border-red-200 opacity-75'}`}
                        >
                            <div className="h-48 overflow-hidden relative group">
                                <img
                                    src={getFileUrl(slide.image_url)}
                                    alt={slide.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found'; }}
                                />
                                <div className="absolute top-2 right-2 flex space-x-1">
                                    <button
                                        onClick={() => handleOpenModal(slide)}
                                        className="bg-white/90 p-1.5 rounded-full text-indigo-600 hover:text-indigo-800 shadow-sm"
                                        title="Edit Text"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slide)}
                                        className="bg-white/90 p-1.5 rounded-full text-red-600 hover:text-red-800 shadow-sm"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 truncate" title={slide.title}>{slide.title || 'No Title'}</h3>
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">#{slide.slide_order}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{slide.subtitle || 'No Subtitle'}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only" checked={slide.is_active} onChange={() => toggleActive(slide)} />
                                            <div className={`block w-10 h-6 rounded-full ${slide.is_active ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${slide.is_active ? 'transform translate-x-4' : ''}`}></div>
                                        </div>
                                        <div className="ml-3 text-xs font-medium text-gray-700">
                                            {slide.is_active ? 'Active' : 'Hidden'}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {slides.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No slides found. Add one to get started!</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={handleCloseModal}>
                            <div className="absolute inset-0 bg-gray-900 opacity-75 backdrop-blur-sm"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6 border-b pb-2">
                                        {editingSlide ? 'Edit Slide Details' : 'Add New Slide'}
                                    </h3>
                                    <div className="space-y-4">
                                        {!editingSlide && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Slide Image</label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition">
                                                    <div className="space-y-1 text-center">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <div className="flex text-sm text-gray-600">
                                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                                <span>Upload a file</span>
                                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                                        {imageFile && <p className="text-sm text-green-600 font-semibold mt-2">Selected: {imageFile.name}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g., Verified Graduates"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.subtitle}
                                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                                placeholder="e.g., Ensuring institutional integrity..."
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-1/2">
                                                <label className="block text-sm font-medium text-gray-700">Order Priority</label>
                                                <input
                                                    type="number"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={formData.slide_order}
                                                    onChange={(e) => setFormData({ ...formData, slide_order: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {editingSlide ? 'Update Slide' : 'Upload Slide'}
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

export default AdminSlides;
