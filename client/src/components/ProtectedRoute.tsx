import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();
    const [localLoading, setLocalLoading] = useState(false);
    const location = useLocation();

    // Re-verify auth on route change for extra security
    useEffect(() => {
        if (!isAuthenticated && !isCheckingAuth && !localLoading) {
            setLocalLoading(true);
            checkAuth().finally(() => {
                setLocalLoading(false);
            });
        }
    }, [location.pathname, isAuthenticated, isCheckingAuth, checkAuth]);

    // Show loading state while checking auth, but limit it to 3 seconds
    if (isCheckingAuth || localLoading) {
        return <div className="flex h-screen w-full items-center justify-center">
            <div className="text-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
                <p>Loading...</p>
            </div>
        </div>;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    return <>{children}</>;
};
