import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SiteHeaderBanner from '../components/SiteHeaderBanner';
import logo from '../assets/logo.jpeg';
import { BRAND } from '../constants/branding';
import { ShieldCheck, Mail, Clock, MapPin } from 'lucide-react';

const PublicLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Navbar */}
            <Navbar user={user} logout={logout} />
            <SiteHeaderBanner />

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* --- Institutional Registry Footer --- */}
            <footer className="bg-gray-900 text-gray-400 mt-24 border-t border-gray-800 relative">
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-400"></div>

                <div className="container mx-auto px-6 py-16 sm:py-20">

                    <div className="grid md:grid-cols-4 gap-10 lg:gap-12">

                        {/* Platform Identity */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-5">
                                <img
                                    src={logo}
                                    alt={`${BRAND.shortName} Logo`}
                                    className="h-12 w-12 rounded-full border-2 border-gray-700"
                                />
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                                        {BRAND.shortName}
                                    </h3>
                                    <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                                        {BRAND.portalSubtitle}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
                                {BRAND.description}
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-300">
                                <ShieldCheck className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                                Government-Grade Verification
                            </div>
                        </div>

                        {/* Registry Navigation */}
                        <div>
                            <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-widest">
                                Registry Access
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <Link to="/directory" className="text-gray-400 hover:text-cyan-400 transition-colors">
                                        Alumni Directory
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about" className="text-gray-400 hover:text-cyan-400 transition-colors">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/news" className="text-gray-400 hover:text-cyan-400 transition-colors">
                                        News
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/leadership" className="text-gray-400 hover:text-cyan-400 transition-colors">
                                        Leadership
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="text-gray-400 hover:text-cyan-400 transition-colors">
                                        Begin Verification
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="text-gray-400 hover:text-cyan-400 transition-colors">
                                        Applicant Login
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Verification Office */}
                        <div>
                            <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-widest">
                                Verification Office
                            </h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex items-start gap-2">
                                    <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="break-all">{BRAND.contactEmail}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                                    <span>Processing Window: 2–5 Business Days</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                                    <span>Monrovia, Republic of Liberia</span>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Footer Bottom */}
                    <div className="border-t border-gray-800 mt-12 sm:mt-16 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500 text-center sm:text-left leading-relaxed">
                        <p>
                            © {new Date().getFullYear()} {BRAND.portalName} — {BRAND.fullName}. All rights reserved.
                            <br className="sm:hidden" /> This platform operates solely for alumni credential validation and institutional verification purposes.
                        </p>
                        <p className="text-gray-600 shrink-0">Built and developed by NexSolveX.</p>
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
