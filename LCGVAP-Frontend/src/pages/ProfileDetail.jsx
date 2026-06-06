import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const ProfileDetail = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/users/${id}`);
                setProfile(response.data);
            } catch (error) {
                console.error('Error fetching profile', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!profile) return <div className="text-center py-20 text-red-500">Profile not found</div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <Link to="/directory" className="text-indigo-600 hover:underline mb-8 inline-block">&larr; Back to Directory</Link>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
                <div className="bg-indigo-900 h-32"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex justify-center md:justify-start">
                        <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                            {profile.profile_photo ? (
                                <img src={profile.profile_photo} alt={profile.last_name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-6xl text-gray-400 flex items-center justify-center h-full">👤</span>
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-800">
                            {profile.first_name} {profile.last_name}
                            <span className="ml-2 text-blue-500 text-2xl" title="Verified">✓</span>
                        </h1>
                        <p className="text-xl text-indigo-600 font-medium mt-1 mb-6">{profile.degree_type}</p>

                        {profile.bio && (
                            <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <h3 className="text-gray-500 text-sm uppercase tracking-wide font-semibold mb-3">About</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                            </div>
                        )}

                        <div className="mt-8 grid md:grid-cols-2 gap-8 border-t pt-8">
                            <div>
                                <h3 className="text-gray-500 text-sm uppercase tracking-wide font-semibold mb-2">University</h3>
                                <p className="text-lg text-gray-800 font-medium">{profile.university_name || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-gray-500 text-sm uppercase tracking-wide font-semibold mb-2">Department</h3>
                                <p className="text-lg text-gray-800 font-medium">{profile.department_name || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-gray-500 text-sm uppercase tracking-wide font-semibold mb-2">Member Since</h3>
                                <p className="text-lg text-gray-800 font-medium">
                                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetail;
