import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = () => {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        auth?.isAuthenticated && auth.accessToken
            ? <Outlet />
            : <Navigate to='/login' state={{ from: location }} replace />
    );
}

export default RequireAuth