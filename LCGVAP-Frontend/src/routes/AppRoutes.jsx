import { lazy, Suspense } from 'react';
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
import About from '../pages/About';
import AdminManageAdmins from '../pages/admin/AdminManageAdmins';

import NotFound from '../pages/NotFound';

// Dev-only preview of the UI kit (docs/redesign/components.md).
// The import is behind import.meta.env.DEV so it is dropped from production builds.
const UiKitPreview = import.meta.env.DEV ? lazy(() => import('../pages/dev/UiKitPreview')) : null;
const MemberPreview = import.meta.env.DEV ? lazy(() => import('../pages/dev/MemberPreview')) : null;

const AppRoutes = () => {
    return (
        <Routes>
            {UiKitPreview && (
                <Route
                    path="/__kit"
                    element={<Suspense fallback={null}><UiKitPreview /></Suspense>}
                />
            )}
            {MemberPreview && (
                <Route
                    path="/__member"
                    element={<Suspense fallback={null}><MemberPreview /></Suspense>}
                />
            )}

            {/* Public Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/leadership" element={<Leadership />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/directory/:id" element={<ProfileDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
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
                    <Route path="users" element={<AdminVerifiedGraduates />} />
                    <Route path="slides" element={<AdminSlides />} />
                    <Route path="graduates" element={<AdminVerifiedGraduates />} />
                    <Route path="featured-graduates" element={<AdminGraduates />} />
                    <Route path="degrees" element={<AdminDegrees />} />
                    <Route path="faq" element={<AdminFAQ />} />
                    <Route path="leadership" element={<AdminLeadership />} />
                    <Route path="manage-admins" element={<AdminManageAdmins />} />
                </Route>
            </Route>

        </Routes>
    );
};

export default AppRoutes;
