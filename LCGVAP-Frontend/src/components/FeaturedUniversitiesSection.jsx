import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, ExternalLink } from 'lucide-react';
import api from '../services/api';
import getFileUrl from '../utils/getFileUrl';

const MotionDiv = motion.div;
const MotionArticle = motion.article;

const FeaturedUniversitiesSection = () => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedUniversities = async () => {
            try {
                const response = await api.get('/universities/featured');
                setUniversities(response.data || []);
            } catch {
                setUniversities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedUniversities();
    }, []);

    if (loading) {
        return (
            <section className="border-y border-slate-200 bg-white py-14 sm:py-16 lg:py-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-xl space-y-4">
                            <div className="h-3 w-44 animate-pulse rounded bg-slate-200"></div>
                            <div className="h-9 w-full max-w-lg animate-pulse rounded bg-slate-100"></div>
                        </div>
                        <div className="h-9 w-36 animate-pulse rounded bg-slate-100"></div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[0, 1, 2, 3].map((item) => (
                            <div key={item} className="min-h-[150px] rounded-md border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-5 h-14 w-14 animate-pulse rounded-md bg-slate-200"></div>
                                <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-slate-200"></div>
                                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (universities.length === 0) {
        return null;
    }

    return (
        <section className="relative overflow-hidden border-y border-slate-200 bg-white py-14 sm:py-16 lg:py-20">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-red-600 via-slate-200 to-indigo-700" aria-hidden="true"></div>

            <div className="container mx-auto px-4 sm:px-6">
                <MotionDiv
                    className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                >
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
                            <span className="h-px w-8 bg-indigo-700" aria-hidden="true"></span>
                            Academic Network
                        </div>

                        <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                            Universities connected to the registry.
                        </h2>
                    </div>

                    <div className="inline-flex w-fit items-center rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                        {universities.length} featured institution{universities.length === 1 ? '' : 's'}
                    </div>
                </MotionDiv>

                <MotionDiv
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.06 }
                        }
                    }}
                >
                    {universities.map((university) => (
                        <UniversityCard key={university.id} university={university} />
                    ))}
                </MotionDiv>
            </div>
        </section>
    );
};

const UniversityCard = ({ university }) => {
    return (
        <MotionArticle
            variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 }
            }}
            className="group flex min-h-[154px] flex-col justify-between rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
        >
            <div className="flex gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-2">
                    {university.logo_url ? (
                        <img
                            src={getFileUrl(university.logo_url)}
                            alt={university.name}
                            className="max-h-10 max-w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <Building2 className="h-6 w-6 text-indigo-700" aria-hidden="true" />
                    )}
                </div>

                <div className="min-w-0">
                    <h3 className="line-clamp-2 text-base font-black leading-snug text-slate-950">
                        {university.name}
                    </h3>

                    {university.country && (
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                            {university.country}
                        </p>
                    )}
                </div>
            </div>

            {university.website_url && (
                <a
                    href={university.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-700 transition-colors hover:text-red-600"
                >
                    Official site
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
            )}
        </MotionArticle>
    );
};

export default FeaturedUniversitiesSection;
