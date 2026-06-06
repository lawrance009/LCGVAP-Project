import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Leadership = () => {
    const [leaders, setLeaders] = useState({ current: [], past: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('current');

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const response = await api.get('/leaders');
                setLeaders(response.data);
            } catch (error) {
                console.error('Error fetching leaders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white relative" style={{
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
        <div className="bg-white min-h-screen pb-32 relative" style={{
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
                            Our Leadership<br/>Team
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
                            Honoring the visionaries who guide our community and the legacy of those who served.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 sm:py-16">
                {/* Tab Navigation */}
                <motion.div 
                    className="flex flex-wrap justify-center gap-0 mb-10 sm:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`px-6 sm:px-10 py-4 sm:py-5 font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                            activeTab === 'current'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Current Committee
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-6 sm:px-10 py-4 sm:py-5 font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                            activeTab === 'past'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Leadership Archive
                    </button>
                </motion.div>

                {/* Current Executive Committee */}
                <AnimatePresence mode="wait">
                    {activeTab === 'current' && (
                        <motion.div
                            key="current"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-50 p-6 sm:p-10 lg:p-12"
                        >
                            <motion.h2 
                                className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-8 sm:mb-12 uppercase tracking-wider"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Current Executive Committee
                            </motion.h2>

                            {leaders.current.length === 0 ? (
                                <motion.p 
                                    className="text-center text-gray-600 py-20 text-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    Current leadership team to be announced.
                                </motion.p>
                            ) : (
                                <motion.div 
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {leaders.current.map((leader, idx) => (
                                        <LeaderCard key={leader.id} leader={leader} index={idx} />
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Past Leaders Archive */}
                <AnimatePresence mode="wait">
                    {activeTab === 'past' && (
                        <motion.div
                            key="past"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-50 p-6 sm:p-10 lg:p-12"
                        >
                            <motion.h2 
                                className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-8 sm:mb-12 uppercase tracking-wider"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Leadership Archive
                            </motion.h2>

                            {leaders.past.length === 0 ? (
                                <motion.p 
                                    className="text-gray-600 text-center py-20 text-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    No archived leadership records found.
                                </motion.p>
                            ) : (
                                <motion.div 
                                    className="grid grid-cols-1 md:grid-cols-2 gap-1"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {leaders.past.map((leader) => (
                                        <motion.div 
                                            key={leader.id}
                                            variants={{
                                                hidden: { opacity: 0 },
                                                visible: { opacity: 1 }
                                            }}
                                            className="flex items-center bg-white hover:bg-gray-900 p-5 sm:p-8 border-2 border-gray-100 transition-all duration-300 group"
                                            >
                                            <div className="h-16 w-16 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden bg-indigo-600 mr-4 sm:mr-6">
                                                {leader.image_url ? (
                                                    <img src={leader.image_url} alt={leader.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 group-hover:text-white text-xl mb-1 transition">{leader.name}</h4>
                                                <p className="text-sm text-indigo-600 group-hover:text-cyan-400 font-bold uppercase tracking-wider mb-2 transition">{leader.position}</p>
                                                <p className="text-xs text-gray-500 group-hover:text-gray-400 uppercase tracking-wider transition">
                                                    {new Date(leader.start_date).getFullYear()} - {leader.end_date ? new Date(leader.end_date).getFullYear() : 'Present'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const LeaderCard = ({ leader, index }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
        }}
        className="group relative bg-white overflow-hidden transition-all duration-300 border-2 border-gray-100 hover:bg-indigo-600"
    >
        {/* Image Section */}
        <div className="relative h-80 overflow-hidden">
            {leader.image_url ? (
                <img
                    src={leader.image_url}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="flex items-center justify-center h-full bg-indigo-600">
                    <svg className="w-32 h-32 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-10">
            <h3 className="text-2xl font-black text-gray-900 group-hover:text-white mb-2 transition leading-tight">
                {leader.name}
            </h3>
            <p className="text-base font-bold text-indigo-600 group-hover:text-cyan-400 mb-4 uppercase tracking-wider transition">
                {leader.position}
            </p>
            {leader.bio && (
                <p className="text-gray-600 group-hover:text-white/90 text-sm line-clamp-3 leading-relaxed mb-6 transition">
                    {leader.bio}
                </p>
            )}
            <div className="pt-4 border-t-2 border-gray-200 group-hover:border-cyan-400 transition">
                <p className="text-xs text-gray-500 group-hover:text-white uppercase tracking-[0.15em] font-bold transition">
                    Since {new Date(leader.start_date).getFullYear()}
                </p>
            </div>
        </div>
    </motion.div>
);

export default Leadership;
