import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import getFileUrl from '../utils/getFileUrl';

const FeaturedUniversitiesSection = () => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedUniversities = async () => {
            try {
                const response = await api.get('/universities/featured');
                setUniversities(response.data || []);
            } catch (error) {
                setUniversities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedUniversities();
    }, []);

    /* ---------------------------
       Loading State (Refined)
    ---------------------------- */
    if (loading) {
        return (
            <section className="py-20 bg-white border-b border-gray-200">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4">
                        <div className="h-10 w-72 bg-gray-200 rounded animate-pulse mx-auto"></div>
                        <div className="h-5 w-96 bg-gray-100 rounded animate-pulse mx-auto"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (universities.length === 0) {
        return null;
    }

    return (
        <section className="bg-white border-b border-gray-200 py-20">

            <div className="container mx-auto px-6">

                {/* Section Header */}
                <motion.div
                    className="text-center mb-16 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-block border border-indigo-600 text-indigo-700 text-xs font-semibold tracking-widest uppercase px-4 py-1 rounded-full mb-4">
                        Recognized Academic Institutions
                    </span>

                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Universities in Northern Cyprus
                    </h2>

                    <p className="text-lg text-gray-600 leading-relaxed">
                        The following institutions have contributed to the academic
                        formation of Liberian graduates recognized within this portal.
                    </p>
                </motion.div>

                {/* Universities Grid */}
                <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.08 }
                        }
                    }}
                >
                    {universities.map((uni) => (
                        <UniversityCard key={uni.id} university={uni} />
                    ))}
                </motion.div>

            </div>
        </section>
    );
};


/* ===================================================
   UNIVERSITY CARD (Institutional Version)
=================================================== */

const UniversityCard = ({ university }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            className="
                bg-white
                border border-gray-200
                rounded-2xl
                p-6
                shadow-sm
                hover:shadow-md
                transition duration-300
                flex flex-col
            "
        >
            {/* Logo Area */}
            <div className="h-24 flex items-center justify-center mb-6">
                {university.logo_url ? (
                    <img
                        src={getFileUrl(university.logo_url)}
                        alt={university.name}
                        className="max-h-20 object-contain"
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                ) : (
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                        No Logo Available
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {university.name}
                </h3>

                {university.short_description && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                        {university.short_description}
                    </p>
                )}

                {university.country && (
                    <p className="text-xs text-gray-500">
                        Location: {university.country}
                    </p>
                )}
            </div>

            {/* Footer */}
            {university.website_url && (
                <a
                    href={university.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                        mt-6
                        inline-block
                        text-sm
                        font-semibold
                        text-indigo-700
                        hover:underline
                    "
                >
                    Visit Official Website →
                </a>
            )}
        </motion.div>
    );
};

export default FeaturedUniversitiesSection;
