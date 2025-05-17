import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectLoading } from "../../store/authSlice";
import { Spin } from "antd";

export default function ProtectedRoute({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectLoading);
    const location = useLocation();

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                replace
            />
        );
    }

    return children;
}
