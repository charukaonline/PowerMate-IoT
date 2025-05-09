import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();
    const [localLoading, setLocalLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated && !isCheckingAuth && !localLoading) {
            setLocalLoading(true);
            checkAuth()
                .catch(err => {
                    console.error("Auth check failed:", err);
                    setAuthError("Authentication check failed");
                })
                .finally(() => {
                    setLocalLoading(false);
                });
        }
    }, [location.pathname, isAuthenticated, isCheckingAuth, checkAuth]);

    if (isCheckingAuth || localLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center text-red-500">
                    <p>Authentication error. Please try logging in again.</p>
                    <button 
                        onClick={() => window.location.href = '/auth/login'} 
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    return <>{children}</>;
};
