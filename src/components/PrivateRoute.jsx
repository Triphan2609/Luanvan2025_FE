import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // If still loading auth state, show loading
    if (loading) {
        return <div className="loading-screen">Đang tải...</div>;
    }

    // If not authenticated, redirect to login with the current location for later redirect
    if (!isAuthenticated) {
        return (
            <Navigate
                to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
            />
        );
    }

    // If authenticated, render the protected component
    return children;
};

export default PrivateRoute;
