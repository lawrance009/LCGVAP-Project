import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import logo from '../assets/logo.jpeg';
import { 
    LayoutDashboard, 
    Building2, 
    BookOpen, 
    Users, 
    GraduationCap, 
    FileText, 
    Star, 
    HelpCircle, 
    Image, 
    Newspaper, 
    Crown, 
    ShieldCheck, 
    Key 
} from 'lucide-react';

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) => {
    const location   = useLocation();
    const { user, logout } = useAuth();
    const isBossAdmin = user?.role === 'master_admin';

    // Password change modal state
    const [showPwModal, setShowPwModal]   = useState(false);
    const [pwData, setPwData]             = useState({ current_password: '', new_password: '', confirm: '' });
    const [pwLoading, setPwLoading]       = useState(false);
    const [pwError, setPwError]           = useState('');

    const handlePwChange = async (e) => {
        e.preventDefault();
        setPwError('');
        if (pwData.new_password !== pwData.confirm) {
            setPwError('New passwords do not match.');
            return;
        }
        if (pwData.new_password.length < 8) {
            setPwError('New password must be at least 8 characters.');
            return;
        }
        setPwLoading(true);
        try {
            await api.put('/auth/admin/change-password', {
                current_password: pwData.current_password,
                new_password:     pwData.new_password,
            });
            setShowPwModal(false);
            Swal.fire({
                title: 'Password Changed!',
                text: 'Please log in again with your new password.',
                icon: 'success',
                confirmButtonColor: '#4f46e5',
            }).then(() => logout());
        } catch (err) {
            setPwError(err.response?.data?.error || 'Failed to change password.');
        } finally {
            setPwLoading(false);
        }
    };

    const menuItems = [
        { name: 'Dashboard', path: '/patron/dashboard', icon: LayoutDashboard },
        { name: 'Universities', path: '/patron/universities', icon: Building2 },
        { name: 'Departments', path: '/patron/departments', icon: BookOpen },
        { name: 'Advisors', path: '/patron/advisors', icon: Users },
        { name: 'Graduates', path: '/patron/users', icon: GraduationCap },
        { name: 'Degree Review', path: '/patron/degrees', icon: FileText },
        { name: 'Featured Alumni', path: '/patron/featured-graduates', icon: Star },
        { name: 'FAQ Manager', path: '/patron/faq', icon: HelpCircle },
        { name: 'Hero Slides', path: '/patron/slides', icon: Image },
        { name: 'News Manager', path: '/patron/news', icon: Newspaper },
        { name: 'Leadership Manager', path: '/patron/leadership', icon: Crown },
        // Boss Admin only
        ...(isBossAdmin ? [{ name: 'Manage Admins', path: '/patron/manage-admins', icon: ShieldCheck }] : []),
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className={`p-6 border-b-2 border-gray-800 ${isCollapsed ? 'items-center justify-center' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Logo */}
                        <img
                            src={logo}
                            alt="LCGVAP"
                            className="w-12 h-12 object-cover border-2 border-indigo-400 flex-shrink-0"
                        />
                        {!isCollapsed && (
                            <div>
                                <h2 className="text-xl font-black text-white whitespace-nowrap uppercase tracking-wider">
                                    LCGVAP
                                </h2>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider whitespace-nowrap">Admin Portal</p>
                                {isBossAdmin && (
                                    <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider whitespace-nowrap mt-1 flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        Master
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Close button for mobile inside sidebar */}
                    <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-gray-400 hover:text-white flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <nav className="mt-8 px-6 flex-grow overflow-y-auto custom-scrollbar">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const isMasterOnly = item.name === 'Manage Admins';
                        const IconComponent = item.icon;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`flex items-center px-6 py-4 transition-all duration-200 group relative ${isActive
                                        ? 'bg-indigo-600 !text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        } ${isMasterOnly && !isActive ? 'border-l-4 border-cyan-400' : ''}`}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <IconComponent className="w-5 h-5 flex-shrink-0" />

                                    {!isCollapsed && (
                                        <span className="font-bold ml-4 whitespace-nowrap uppercase tracking-wider text-xs flex items-center gap-2">
                                            {item.name}
                                            {isMasterOnly && <Star className="w-3 h-3 text-cyan-400 fill-current" />}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className={`p-6 mt-auto border-t-2 border-gray-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex items-center justify-center p-3 text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-colors uppercase tracking-wider text-xs font-bold"
                >
                    {isCollapsed ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                            <span>Collapse</span>
                        </div>
                    )}
                </button>

                {!isCollapsed && (
                    <div className="bg-gray-800 p-6 mt-4 hidden md:block border-l-4 border-green-500">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">System Status</p>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-3 h-3 bg-green-500 animate-pulse"></div>
                            <span className="text-sm text-green-400 font-bold uppercase tracking-wider">Online</span>
                        </div>
                        {/* Change Password button */}
                        <button
                            onClick={() => setShowPwModal(true)}
                            className="w-full text-xs text-white font-bold uppercase tracking-wider border-2 border-gray-700 hover:border-indigo-400 hover:bg-indigo-600 py-3 transition-all flex items-center justify-center gap-2"
                        >
                            <Key className="w-4 h-4" />
                            Change Password
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 256 }}
                className="bg-slate-900 text-white min-h-screen flex-shrink-0 hidden md:block z-30"
            >
                <SidebarContent />
            </motion.aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black z-40 md:hidden"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 md:hidden shadow-xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPwModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-xl font-black text-gray-900 mb-1">Change Password</h2>
                            <p className="text-sm text-gray-500 mb-5">After changing, you'll be logged out on all devices.</p>

                            {pwError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{pwError}</div>
                            )}

                            <form onSubmit={handlePwChange} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Current Password</label>
                                    <input type="password" required
                                        value={pwData.current_password}
                                        onChange={e => setPwData({...pwData, current_password: e.target.value})}
                                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">New Password</label>
                                    <input type="password" required
                                        value={pwData.new_password}
                                        onChange={e => setPwData({...pwData, new_password: e.target.value})}
                                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                        placeholder="Min. 8 characters"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Confirm New Password</label>
                                    <input type="password" required
                                        value={pwData.confirm}
                                        onChange={e => setPwData({...pwData, confirm: e.target.value})}
                                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" disabled={pwLoading}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold text-sm disabled:opacity-50 transition-colors"
                                    >
                                        {pwLoading ? 'Saving...' : 'Change Password'}
                                    </button>
                                    <button type="button" onClick={() => { setShowPwModal(false); setPwError(''); }}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminSidebar;
