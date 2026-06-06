import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import Login from '../pages/Login';
import AdminLogin from '../pages/AdminLogin';
import Home from '../pages/Home';
import Directory from '../pages/Directory';
import ProfileDetail from '../pages/ProfileDetail';
import ProfilePage from '../pages/ProfilePage';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import StudentDashboard from '../pages/StudentDashboard';
import AdminUniversities from '../pages/admin/AdminUniversities';
import AdminDepartments from '../pages/admin/AdminDepartments';
import AdminAdvisors from '../pages/admin/AdminAdvisors';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminSlides from '../pages/admin/AdminSlides';
import AdminVerifiedGraduates from '../pages/admin/AdminVerifiedGraduates';
import AdminGraduates from '../pages/admin/AdminGraduates';
import AdminFAQ from '../pages/admin/AdminFAQ';
import AdminDegrees from '../pages/admin/AdminDegrees';
import News from '../pages/News';
import NewsDetail from '../pages/NewsDetail';
import AdminNews from '../pages/admin/AdminNews';
import Leadership from '../pages/Leadership';
import AdminLeadership from '../pages/admin/AdminLeadership';
import AdminRegister from '../pages/AdminRegister';
import AdminManageAdmins from '../pages/admin/AdminManageAdmins';

// Placeholder Pages
const NotFound = () => <div className="p-8 text-center text-red-500">404 Not Found</div>;

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/leadership" element={<Leadership />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/directory/:id" element={<ProfileDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Standalone Hidden Admin Registration Route */}
            <Route path="/boss-entry" element={<AdminRegister />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<PublicLayout />}>
                    <Route path="/profile"    element={<ProfilePage />} />
                    <Route path="/dashboard"  element={<StudentDashboard />} />
                </Route>
            </Route>

            {/* Admin/Private Routes */}
            <Route path="/patron-entry" element={<AdminLogin />} />
            <Route path="/patron" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="news" element={<AdminNews />} />
                    <Route path="universities" element={<AdminUniversities />} />
                    <Route path="departments" element={<AdminDepartments />} />
                    <Route path="advisors" element={<AdminAdvisors />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="slides" element={<AdminSlides />} />
                    <Route path="graduates" element={<AdminVerifiedGraduates />} />
                    <Route path="featured-graduates" element={<AdminGraduates />} />
                    <Route path="degrees" element={<AdminDegrees />} />
                    <Route path="faq" element={<AdminFAQ />} />
                    <Route path="leadership" element={<AdminLeadership />} />
                    <Route path="manage-admins" element={<AdminManageAdmins />} />
                </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
