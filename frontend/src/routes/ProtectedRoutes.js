import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "lucide-react";

/**
 * ProtectedRoute component for authenticated-only routes
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
    const { authUser, isCheckingAuth } = useAuth();

    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );
    }

    return authUser ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
