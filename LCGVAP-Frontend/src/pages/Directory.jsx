import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import getFileUrl from '../utils/getFileUrl';
import PremiumTag from '../components/profile/PremiumTag';
import { formatDegreeType, getPublicDegreeTypes, isPublicPremiumVeteran } from '../utils/degreeDisplay';

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
    }, [filters.page, filters.university_id, filters.department_id]);

    const fetchGraduates = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            if (!filters.search) params.delete('search');
            if (!filters.university_id) params.delete('university_id');
            if (!filters.department_id) params.delete('department_id');

            const response = await api.get(`/users?${params.toString()}`);
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
            {/* Hero */}
            <div className="py-10 sm:py-16 lg:py-24 px-4 sm:px-6 bg-white border-b-2 border-gray-100">
                <div className="max-w-6xl mx-auto">
                    <div className="h-1 w-12 sm:w-16 bg-indigo-600 mb-4 sm:mb-6"></div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
                        Veterans<br />Directory
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl">
                        Connect with verified alumni from our community.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
                {/* Filters */}
                <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 rounded-lg sm:rounded-none">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:gap-4 lg:grid lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-5">
                            <label htmlFor="directory-search" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 sm:sr-only">
                                Search
                            </label>
                            <input
                                id="directory-search"
                                type="text"
                                placeholder="Search by name..."
                                className="w-full border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg focus:border-indigo-600 outline-none transition"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        <div className="lg:col-span-4">
                            <label htmlFor="directory-university" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 sm:sr-only">
                                University
                            </label>
                            <select
                                id="directory-university"
                                className="w-full border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg focus:border-indigo-600 outline-none transition bg-white"
                                value={filters.university_id}
                                onChange={(e) => setFilters({ ...filters, university_id: e.target.value, page: 1 })}
                            >
                                <option value="">All Universities</option>
                                {universities.map(uni => (
                                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full lg:col-span-3 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 sm:py-4 hover:bg-indigo-700 transition"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="text-center py-20 sm:py-32">
                        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                    </div>
                ) : (
                    <>
                        {graduates.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {graduates.map(grad => (
                                    <div
                                        key={grad.id}
                                        className="relative bg-white border-2 border-gray-100 hover:bg-gray-50 transition p-5 sm:p-6 lg:p-8 flex flex-col items-center text-center group h-full"
                                    >
                                        {isPublicPremiumVeteran(grad) && (
                                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                                                <PremiumTag isPremiumVeteran />
                                            </div>
                                        )}

                                        <div className="h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 bg-indigo-600 mb-4 sm:mb-6 overflow-hidden shrink-0">
                                            {grad.profile_photo ? (
                                                <img
                                                    src={getFileUrl(grad.profile_photo)}
                                                    alt={`${grad.first_name} ${grad.last_name}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <svg className="w-10 h-10 sm:w-14 sm:h-14 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-1 flex flex-wrap items-center justify-center gap-2">
                                            <span className="break-words">{grad.first_name} {grad.last_name}</span>
                                            <span className="text-indigo-600 text-base shrink-0" title="Verified">✓</span>
                                        </h3>
                                        <p className="text-indigo-600 font-bold text-sm mb-1 px-1 break-words">{grad.university_name}</p>
                                        <p className="text-gray-600 text-sm mb-3 sm:mb-4 px-1 break-words">{grad.department_name}</p>
                                        <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-6">
                                            {getPublicDegreeTypes(grad).map((type) => (
                                                <span
                                                    key={type}
                                                    className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-900 text-xs font-bold uppercase tracking-wider"
                                                >
                                                    {formatDegreeType(type)}
                                                </span>
                                            ))}
                                        </div>

                                        <Link
                                            to={`/directory/${grad.id}`}
                                            className="mt-auto w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition text-xs font-bold uppercase tracking-wider text-center"
                                        >
                                            View Profile
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 sm:py-32 px-4">
                                <p className="text-xl sm:text-2xl lg:text-3xl text-gray-900 font-black mb-2">
                                    No graduates found matching your criteria.
                                </p>
                                <p className="text-gray-600 text-base sm:text-lg">Try adjusting your search filters.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="mt-8 sm:mt-12 lg:mt-16 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-0 max-w-md sm:max-w-none mx-auto sm:mx-0">
                            <button
                                type="button"
                                disabled={filters.page <= 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-200 font-bold text-xs uppercase tracking-wider disabled:opacity-30 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
                            >
                                Previous
                            </button>
                            <span className="w-full sm:w-auto text-center px-6 sm:px-8 py-3 sm:py-4 border-2 sm:border-l-0 sm:border-r-0 border-gray-200 text-gray-900 font-bold text-xs uppercase tracking-wider">
                                Page {filters.page} of {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={filters.page >= totalPages}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-200 font-bold text-xs uppercase tracking-wider disabled:opacity-30 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
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
