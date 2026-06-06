import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import logo from '../assets/logo.jpeg';

const PublicLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Navbar */}
            <Navbar user={user} logout={logout} />

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* --- Institutional Registry Footer --- */}
<footer className="bg-gray-900 text-gray-400 mt-24 border-t border-gray-800">
    <div className="container mx-auto px-6 py-16">

        <div className="grid md:grid-cols-3 gap-12">

            {/* Platform Identity */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={logo}
                        alt="LCGVAP Logo"
                        className="h-10 w-10 rounded-full border border-gray-700"
                    />
                    <h3 className="text-lg font-bold text-white">
                        LCGVAP
                    </h3>
                </div>
                <p className="text-sm leading-relaxed">
                    The official alumni verification registry for Liberian
                    graduates in Northern Cyprus. This platform facilitates
                    institutional credential confirmation and academic identity
                    validation.
                </p>
            </div>

            {/* Registry Navigation */}
            <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
                    Registry Access
                </h4>
                <ul className="!text-white space-y-3 text-sm">
                    <li>
                        <Link to="/" className="!text-white hover:text-white transition-colors">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/register" className="!text-white hover:text-white transition-colors">
                            Begin Verification
                        </Link>
                    </li>
                    <li>
                        <Link to="/login" className="!text-white hover:text-white transition-colors">
                            Applicant Login
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Verification Office */}
            <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
                    Verification Office
                </h4>
                <div className="space-y-2 text-sm">
                    <p>lcgvapliberiancyprusgraduatesv@gmail.com</p>
                    <p>Processing Window: 2–5 Business Days</p>
                    <p>Monrovia, Republic of Liberia</p>
                </div>
            </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-6 text-xs text-gray-500 text-center leading-relaxed">
            <p>© {new Date().getFullYear()} Liberian Cyprus Graduates Alumni Verification Portal
            All rights reserved.</p>
            <p>This platform operates solely for alumni
            credential validation and institutional verification purposes.</p>
            <p className="mt-2">Built and developed by NexSolveX.</p>
        </div>

    </div>
</footer>
        </div>
    );
};

export default PublicLayout;
