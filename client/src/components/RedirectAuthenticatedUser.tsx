import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface RedirectAuthenticatedUserProps {
    children: ReactNode;
}

export const RedirectAuthenticatedUser: React.FC<RedirectAuthenticatedUserProps> = ({ children }) => {
    const { isAuthenticated, isCheckingAuth } = useAuthStore();
    
    // Only redirect if we've finished checking auth and user is authenticated
    if (isAuthenticated && !isCheckingAuth) {
        return <Navigate to="/" replace />;
    }

    return children;
};
