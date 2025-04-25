import { useState, useEffect } from "react";

export default function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra token trong localStorage hoặc call API verify token
        const token = localStorage.getItem("access_token");
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        // Call API login và lưu token
        // const response = await authService.login(credentials);
        // localStorage.setItem('access_token', response.data.token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
    };

    return { isAuthenticated, loading, login, logout };
}
