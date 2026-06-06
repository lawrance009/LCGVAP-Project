import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Directory = () => {
    const [graduates, setGraduates] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        university_id: '',
        department_id: '',
        page: 1
    });

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await api.get('/universities');
                setUniversities(response.data);
            } catch (error) {
                console.error('Failed to fetch universities', error);
            }
        };
        fetchUniversities();
    }, []);

    useEffect(() => {
        fetchGraduates();
    }, [filters.page, filters.university_id, filters.department_id]); // Search triggers on button or debounce (simplified here)

    const fetchGraduates = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            // Remove empty filters
            if (!filters.search) params.delete('search');
            if (!filters.university_id) params.delete('university_id');
            if (!filters.department_id) params.delete('department_id');

            // Backend maps /users to userController.getGraduates -> users
            // Frontend api base is localhost:3000
            // Routes: /users
            const response = await api.get(`/users?${params.toString()}`);
            // Response shape: { data: [...], meta: { page, limit, total, totalPages } }
            setGraduates(response.data.data || []);
            setTotalPages(response.data.meta?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch graduates', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchGraduates();
    };

    return (
        <div className="bg-white min-h-screen relative" style={{
            backgroundImage: `linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}>
            {/* Hero Section */}
            <div className="py-16 sm:py-24 lg:py-32 px-6 bg-white border-b-2 border-gray-100">
                <div className="max-w-6xl mx-auto">
                    <div className="h-1 w-16 bg-indigo-600 mb-6"></div>
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
                        Veterans<br/>Directory
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
                        Connect with verified alumni from our community.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
                {/* Filters */}
                <div className="bg-gray-50 p-6 sm:p-10 mb-12 sm:mb-16">
                    <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-6">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full border-2 border-gray-200 px-6 py-4 text-lg focus:border-indigo-600 outline-none transition"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                        <select
                            className="border-2 border-gray-200 px-6 py-4 text-lg focus:border-indigo-600 outline-none transition"
                            value={filters.university_id}
                            onChange={(e) => setFilters({ ...filters, university_id: e.target.value, page: 1 })}
                        >
                            <option value="">All Universities</option>
                            {universities.map(uni => (
                                <option key={uni.id} value={uni.id}>{uni.name}</option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-4 hover:bg-indigo-700 transition"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-32">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                    </div>
                ) : (
                    <>
                        {/* Grid */}
                        {graduates.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1">
                                {graduates.map(grad => (
                                    <div key={grad.id} className="bg-white border-2 border-gray-100 hover:bg-gray-50 transition p-6 sm:p-10 flex flex-col items-center text-center group">
                                        <div className="h-32 w-32 bg-indigo-600 mb-6 overflow-hidden">
                                            {grad.profile_photo ? (
                                                <img src={grad.profile_photo} alt={grad.last_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <svg className="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 mb-1 flex items-center gap-2">
                                            {grad.first_name} {grad.last_name}
                                            <span className="text-indigo-600 text-base" title="Verified">✓</span>
                                        </h3>
                                        <p className="text-indigo-600 font-bold text-sm mb-2">{grad.university_name}</p>
                                        <p className="text-gray-600 text-sm mb-4">{grad.department_name}</p>
                                        <span className="inline-block px-4 py-2 bg-gray-100 text-gray-900 text-xs font-bold uppercase tracking-wider mb-6">
                                            {grad.degree_type}
                                        </span>

                                        <Link
                                            to={`/directory/${grad.id}`}
                                            className="mt-auto px-8 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition text-xs font-bold uppercase tracking-wider"
                                        >
                                            View Profile
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32">
                                <p className="text-3xl text-gray-900 font-black mb-2">No graduates found matching your criteria.</p>
                                <p className="text-gray-600 text-lg">Try adjusting your search filters.</p>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        <div className="mt-12 sm:mt-16 flex justify-center gap-0">
                            <button
                                disabled={filters.page <= 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="px-4 sm:px-8 py-4 border-2 border-gray-200 font-bold text-xs uppercase tracking-wider disabled:opacity-30 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
                            >
                                Previous
                            </button>
                            <span className="px-4 sm:px-8 py-4 border-2 border-gray-200 border-l-0 border-r-0 text-gray-900 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                                Page {filters.page} of {totalPages}
                            </span>
                            <button
                                disabled={filters.page >= totalPages}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="px-4 sm:px-8 py-4 border-2 border-gray-200 font-bold text-xs uppercase tracking-wider disabled:opacity-30 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Directory;
