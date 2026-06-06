import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Direct API for dropdowns
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Dropdown Data
    const [universities, setUniversities] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        passport_number: '',
        date_of_birth: '',
        university_id: '',
        department_id: '',
        degree_type: 'Bachelor',
        graduation_year: new Date().getFullYear()
    });

    const [degreeFile, setDegreeFile] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [errors, setErrors] = useState({});

    // Fetch Universities on Mount
    useEffect(() => {
        const fetchUnis = async () => {
            try {
                const res = await api.get('/universities');
                setUniversities(res.data);
            } catch (err) {
                console.error('Failed to load universities');
            }
        };
        fetchUnis();
    }, []);

    useEffect(() => {
        if (formData.university_id) {
            api.get(`/universities/${formData.university_id}/departments`)
                .then(res => setDepartments(res.data))
                .catch(() => setDepartments([]));
        } else {
            setDepartments([]);
        }
        setFormData(prev => ({ ...prev, department_id: '' }));
    }, [formData.university_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e, setFile) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validation
        const newErrors = {};
        if (!degreeFile) newErrors.degreeFile = 'Degree certificate is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('degree_file', degreeFile);
        if (profilePhoto) data.append('profile_photo', profilePhoto);

        const result = await register(data);

        setLoading(false);

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Registration Submitted',
                text: 'Your information has been received. Please wait for an Admin to verify your credentials. You will receive an email once verified.',
                confirmButtonColor: '#4f46e5'
            }).then(() => {
                navigate('/login');
            });
        }
        // AuthContext handles error alerts
    };

    return (
        <div className="min-h-screen bg-white py-10 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-8 relative" style={{
            backgroundImage: `linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}>
            <div className="max-w-7xl mx-auto">

                {/* HEADER SECTION */}
                <div className="mb-8 sm:mb-14 max-w-3xl">
                    <div className="h-1 w-12 sm:w-16 bg-indigo-600 mb-4 sm:mb-6"></div>
                    <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight text-gray-900">
                        Register to<br/>get verified.
                    </h1>
                    <div className="bg-gray-50 border-l-4 border-cyan-400 p-4 sm:p-8">
                        <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
                            Registration does not automatically grant access. All graduate credentials will be strictly verified by the LCGVAP Administration before login access is granted.
                        </p>
                    </div>
                </div>

                {/* FORM CARD */}
                <div className="max-w-4xl">
                    <div className="bg-gray-50 p-4 sm:p-8 lg:p-16 rounded-xl sm:rounded-none">

                        <div className="mb-8 sm:mb-12">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 uppercase tracking-wider">Create Profile</h2>
                            <p className="text-gray-600 text-base sm:text-lg">Submit your credentials for official review.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">

                            {/* PERSONAL INFORMATION */}
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-8 pb-4 border-b-2 border-gray-200 uppercase tracking-wider">
                                    Personal Information
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">First Name</label>
                                        <input type="text" name="first_name" required onChange={handleChange}
                                            className="w-full bg-white border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-base sm:text-lg focus:border-indigo-600 focus:outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">Last Name</label>
                                        <input type="text" name="last_name" required onChange={handleChange}
                                            className="w-full bg-white border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-base sm:text-lg focus:border-indigo-600 focus:outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">Email Address</label>
                                        <input type="email" name="email" required onChange={handleChange}
                                            className="w-full bg-white border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-base sm:text-lg focus:border-indigo-600 focus:outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">Passport Number</label>
                                        <input type="text" name="passport_number" required onChange={handleChange}
                                            className="w-full bg-white border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-base sm:text-lg focus:border-indigo-600 focus:outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">Date of Birth</label>
                                        <input type="date" name="date_of_birth" required onChange={handleChange}
                                            className="w-full bg-white border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-base sm:text-lg focus:border-indigo-600 focus:outline-none transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ACADEMIC INFORMATION */}
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-8 pb-4 border-b-2 border-gray-200 uppercase tracking-wider">
                                    Academic Information
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">University</label>
                                        <select name="university_id" required onChange={handleChange}
                                            className="w-full bg-white border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-base sm:text-lg focus:border-indigo-600 focus:outline-none transition-all duration-200"
                                        >
                                            <option value="">Select University</option>
                                            {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">Department</label>
                                        <select name="department_id" required disabled={!formData.university_id} onChange={handleChange}
                                            className="w-full bg-white border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-base sm:text-lg focus:border-indigo-600 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">Degree Type</label>
                                        <select name="degree_type" required value={formData.degree_type} onChange={handleChange}
                                            className="w-full bg-white border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-base sm:text-lg focus:border-indigo-600 focus:outline-none transition-all duration-200"
                                        >
                                            <option value="Bachelor">Bachelor</option>
                                            <option value="Master">Master</option>
                                            <option value="PhD">PhD</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">Year of Graduation</label>
                                        <input
                                            type="number"
                                            name="graduation_year"
                                            required
                                            min="2018"
                                            max={new Date().getFullYear()}
                                            value={formData.graduation_year}
                                            onChange={handleChange}
                                            className="w-full bg-white border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-base sm:text-lg focus:border-indigo-600 focus:outline-none transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* DOCUMENTS */}
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-8 pb-4 border-b-2 border-gray-200 uppercase tracking-wider">
                                    Verification Documents
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">Degree Certificate (PDF/Image)</label>
                                        <div className="bg-white border-2 border-gray-200 p-4 sm:p-6 hover:border-indigo-600 transition-all">
                                            <input type="file" required accept=".pdf,image/*" onChange={(e) => handleFileChange(e, setDegreeFile)}
                                                className="w-full block text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white file:uppercase file:tracking-wider hover:file:bg-indigo-700 file:transition-colors"
                                            />
                                        </div>
                                        {errors.degreeFile && (
                                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-600 text-sm font-bold mt-2">
                                                {errors.degreeFile}
                                            </motion.p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">Profile Photo (Optional)</label>
                                        <div className="bg-white border-2 border-gray-200 p-4 sm:p-6 hover:border-indigo-600 transition-all">
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setProfilePhoto)}
                                                className="w-full block text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:border-0 file:text-xs file:font-bold file:bg-gray-200 file:text-gray-900 file:uppercase file:tracking-wider hover:file:bg-gray-300 file:transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <div className="pt-4 sm:pt-8">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 sm:py-6 bg-indigo-600 text-white font-bold text-sm tracking-wider uppercase hover:bg-indigo-700 disabled:opacity-50 transition-all flex justify-center items-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Submit for Verification'
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>

                    <div className="mt-10 pt-6 sm:pt-8 border-t-2 border-gray-100">
                        <p className="text-sm text-gray-600">
                            Already verified? <Link to="/login" className="font-bold text-indigo-600 hover:text-gray-900 transition-colors">Log in here</Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};
export default Register;
