import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getSignedFileUrl } from '../services/api';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import getFileUrl from '../utils/getFileUrl';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [degreeFile, setDegreeFile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/me');
            const data = response.data;
            setProfile(data);
            setFirstName(data.first_name);
            setLastName(data.last_name);
            setBio(data.bio || '');
        } catch (error) {
            console.error('Error fetching profile', error);
            Swal.fire('Error', 'Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, setFile) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('bio', bio);
        if (photoFile) {
            formData.append('profile_photo', photoFile);
        }
        if (degreeFile) {
            formData.append('degree_file', degreeFile);
        }

        try {
            setLoading(true);
            const response = await api.put('/users/me', formData);

            Swal.fire({
                title: 'Success',
                text: 'Profile updated successfully',
                icon: 'success',
                confirmButtonColor: '#4f46e5'
            });
            setProfile(response.data.user);
            setIsEditing(false);
        } catch (error) {
            console.error('Update Error:', error);
            Swal.fire('Error', error.response?.data?.error || 'Update failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* HERO BANNER */}
            <div className="h-64 w-full bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] opacity-20 mix-blend-overlay object-cover"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* LEFT COLUMN: Avatar & Quick Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 text-center border border-gray-100">
                            {/* Avatar */}
                            <div className="relative inline-block mb-5">
                                <div className="h-36 w-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 mx-auto">
                                    {profile?.profile_photo ? (
                                        <img src={profile.profile_photo} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-6xl text-gray-300 flex items-center justify-center h-full">👤</span>
                                    )}
                                </div>
                                {profile?.is_verified && (
                                    <div className="absolute bottom-2 right-2 bg-green-500 border-4 border-white h-8 w-8 rounded-full shadow-lg flex items-center justify-center" title="Verified Graduate">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{profile?.first_name} {profile?.last_name}</h1>
                            <p className="text-gray-500 font-medium mb-6">{profile?.email}</p>

                            <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold mb-6 shadow-sm ${profile?.is_verified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                {profile?.is_verified ? 'Official Alumni' : 'Pending Verification'}
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {/* Security Info Card */}
                        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-3xl p-6 shadow-sm">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                Account Integrity
                            </h4>
                            <p className="text-sm text-blue-800 leading-relaxed font-medium">
                                Your identity is anchored to your passport number and date of birth. These fields are locked for security.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details & Editing */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 sm:p-10 border border-gray-100">
                            
                            {!isEditing ? (
                                <div className="space-y-10">
                                    {/* About Me */}
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight border-b border-gray-100 pb-2">About Me</h3>
                                        {profile?.bio ? (
                                            <p className="text-gray-600 leading-relaxed text-lg font-medium">{profile.bio}</p>
                                        ) : (
                                            <p className="text-gray-400 italic">No biography added yet.</p>
                                        )}
                                    </div>

                                    {/* Academic Information */}
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight border-b border-gray-100 pb-2">Academic Credentials</h3>
                                        <div className="grid sm:grid-cols-2 gap-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <div>
                                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Degree Type</p>
                                                <p className="text-lg font-bold text-gray-900">{profile?.degree_type || 'Bachelors'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Graduation Year</p>
                                                <p className="text-lg font-bold text-gray-900">{profile?.graduation_year || 'N/A'}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Primary Document</p>
                                                {profile?.degree_file ? (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const url = await getSignedFileUrl(getFileUrl(profile.degree_file));
                                                                window.open(url, '_blank', 'noopener,noreferrer');
                                                            } catch (error) {
                                                                console.error('Failed to open document:', error);
                                                                Swal.fire('Error', 'Could not open degree document.', 'error');
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                        View Uploaded Document
                                                    </button>
                                                ) : (
                                                    <p className="text-red-500 font-bold">Not Uploaded</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // EDIT FORM
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight border-b border-gray-100 pb-2">Edit Profile</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="block text-sm font-bold text-gray-700">First Name</label>
                                            <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-inner transition-all duration-200" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-bold text-gray-700">Last Name</label>
                                            <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-inner transition-all duration-200" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-bold text-gray-700">Professional Bio</label>
                                        <textarea rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-inner transition-all duration-200" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell your network about your career..."></textarea>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-bold text-gray-700">Profile Photo</label>
                                        <input type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" onChange={(e) => handleFileChange(e, setPhotoFile)} />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-bold text-gray-700">Update Degree Document (Optional)</label>
                                        <input type="file" accept="image/*,.pdf" className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" onChange={(e) => handleFileChange(e, setDegreeFile)} />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
