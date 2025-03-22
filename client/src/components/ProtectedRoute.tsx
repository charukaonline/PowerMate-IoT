import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

// Define the type for the component props
interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated || !user?.isVerified) {
        return <Navigate to="/auth/login" replace />;
    }

    return children;
};
