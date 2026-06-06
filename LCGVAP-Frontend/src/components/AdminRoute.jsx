import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_ROLES = ['admin', 'master_admin'];

const AdminRoute = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/patron-entry" replace />;
    }

    if (!ADMIN_ROLES.includes(user.role)) {
        // Graduate or unknown role — send to public home
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
