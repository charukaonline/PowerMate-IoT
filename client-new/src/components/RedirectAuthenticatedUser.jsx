import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, isCheckingAuth } = useAuthStore();

    // Only redirect if we've finished checking auth and user is authenticated
    if (isAuthenticated && !isCheckingAuth) {
        return <Navigate to="/" replace />;
    }

    return children;
};
