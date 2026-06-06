import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const News = () => {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await api.get('/news');
            setFeed(response.data);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFeed = filter === 'all' ? feed : feed.filter(item => item.type === filter);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white relative" style={{
                backgroundImage: `linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-indigo-600 border-t-transparent"
                />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen relative" style={{
            backgroundImage: `linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}>
            {/* Hero Section */}
            <div className="py-16 sm:py-24 lg:py-32 px-6 bg-white border-b-2 border-gray-100">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="h-1 w-16 bg-indigo-600 mb-6"></div>
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
                            Community<br/>News & Updates
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
                            Stay connected with the latest stories, announcements, and celebrations from our veteran community.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Filter Buttons */}
            <motion.div 
                className="flex justify-center gap-0 px-6 flex-wrap mt-10 sm:mt-16 mb-10 sm:mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <button
                    onClick={() => setFilter('all')}
                    className={`px-8 py-4 font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                        filter === 'all'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    All News
                </button>
                <button
                    onClick={() => setFilter('announcement')}
                    className={`px-8 py-4 font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                        filter === 'announcement'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Announcements
                </button>
                <button
                    onClick={() => setFilter('birthday')}
                    className={`px-8 py-4 font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                        filter === 'birthday'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Celebrations
                </button>
            </motion.div>

            {/* News Feed */}
            <div className="max-w-7xl mx-auto px-6 pb-16 sm:pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={filter}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.05 }
                            }
                        }}
                    >
                        {filteredFeed.length > 0 ? (
                            filteredFeed.map((item, idx) => (
                                <NewsCard key={item.id} item={item} index={idx} />
                            ))
                        ) : (
                            <motion.div
                                className="col-span-full text-center py-32"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p className="text-3xl text-gray-900 font-black mb-2">No news found in this category.</p>
                                <p className="text-gray-600 text-lg">Check back soon for more updates!</p>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const NewsCard = ({ item, index }) => {
    const isBirthday = item.type === 'birthday';
    
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`group relative bg-white overflow-hidden transition-all duration-300 flex flex-col h-full border-2 hover:bg-gray-50 ${
                isBirthday ? 'border-cyan-400' : 'border-gray-100'
            }`}
        >
            {/* Badge */}
            {isBirthday && (
                <div className="absolute top-0 right-0 z-20">
                    <span className="bg-cyan-400 text-gray-900 text-xs font-black px-6 py-3 uppercase tracking-wider">
                        Celebration
                    </span>
                </div>
            )}

            {/* Image Section */}
            <div className="h-64 w-full relative overflow-hidden">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isBirthday ? 'bg-cyan-400' : 'bg-indigo-600'}`}>
                        <span className="text-6xl">
                            {isBirthday ? '🎂' : '📰'}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 sm:p-10 flex-1 flex flex-col">
                <div className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-[0.15em]">
                    {new Date(item.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-4 line-clamp-2 leading-tight">
                    {item.title}
                </h3>

                {item.subtitle && (
                    <p className="text-indigo-600 font-bold text-base mb-4">
                        {item.subtitle}
                    </p>
                )}

                <div className="text-gray-600 mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {isBirthday ? item.content : (
                        <div dangerouslySetInnerHTML={{ __html: item.content.substring(0, 150) + '...' }} />
                    )}
                </div>

                {!isBirthday && (
                    <Link
                        to={`/news/${item.id}`}
                        className="inline-flex items-center text-indigo-600 font-bold text-sm uppercase tracking-wider hover:text-gray-900 transition-all duration-300 group/link border-b-2 border-indigo-600 hover:border-gray-900 pb-1 w-fit"
                    >
                        Read Full Story
                        <svg 
                            className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            strokeWidth="3"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                )}
            </div>
        </motion.div>
    );
};

export default News;
