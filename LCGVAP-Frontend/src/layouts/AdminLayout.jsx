import { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/patron-entry');
    };

    return (
        <div className="min-h-screen flex bg-white relative" style={{
            backgroundImage: `linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}>
            {/* Sidebar */}
            <AdminSidebar
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
                <header className="bg-white border-b-2 border-gray-100 p-4 sm:p-6 flex justify-between items-center gap-3 sticky top-0 z-20">
                    <div className="flex items-center space-x-3 sm:space-x-6 min-w-0">
                        {/* Hamburger Button (Mobile Only) */}
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="md:hidden p-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all flex-shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <h1 className="text-lg sm:text-2xl font-black text-gray-900 uppercase tracking-wider truncate">
                            Dashboard
                        </h1>
                        {/* Quick nav for verify graduates */}
                        <a href="/patron/graduates" className="hidden md:block text-gray-600 hover:text-white text-xs font-bold uppercase tracking-wider bg-gray-100 hover:bg-indigo-600 px-6 py-3 transition-all">
                            Verified Graduates
                        </a>
                    </div>

                    <div className="flex items-center space-x-4 sm:space-x-8 flex-shrink-0">
                        <div className="hidden sm:block text-right">
                            <span className="text-sm font-black text-gray-900 block">
                                {user?.first_name} {user?.last_name}
                            </span>
                            <span className={`text-xs font-bold uppercase tracking-wider ${user?.role === 'master_admin' ? 'text-indigo-600' : 'text-gray-600'} inline-flex items-center gap-1`}>
                                {user?.role === 'master_admin' ? (
                                    <>
                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                        Master Admin
                                    </>
                                ) : 'Administrator'}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-3 border-2 border-gray-900 text-gray-900 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                            title="Logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </div>
                </header>

                <main className="flex-grow p-4 sm:p-8 md:p-12 overflow-y-auto">
                    <Outlet />
                </main>
            </div >
        </div >
    );
};

export default AdminLayout;
