import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    login as loginApi,
    logout as logoutApi,
    getProfile,
} from "../api/authApi";

// Create context
const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // Load user data on mount
    useEffect(() => {
        const loadUserData = async () => {
            const userStr = localStorage.getItem("user");
            const token = localStorage.getItem("accessToken");

            if (userStr && token) {
                try {
                    // Try to parse stored user
                    const parsedUser = JSON.parse(userStr);
                    setCurrentUser(parsedUser);

                    // Optionally verify with backend
                    await getProfile()
                        .then((response) => {
                            // Update with fresh data if needed
                            if (response.account) {
                                setCurrentUser(response.account);
                                localStorage.setItem(
                                    "user",
                                    JSON.stringify(response.account)
                                );
                            }
                        })
                        .catch(() => {
                            // If verification fails, remove stored data but don't log out yet
                            // The token refresh interceptor will handle this if possible
                        });
                } catch (e) {
                    // Clear invalid data
                    setCurrentUser(null);
                }
            }

            setLoading(false);
        };

        loadUserData();
    }, []);

    // Login function
    const login = async (username, password) => {
        setLoading(true);
        setError("");

        try {
            const response = await loginApi(username, password);
            setCurrentUser(response.account);

            // Redirect to desired page or dashboard
            const redirect = new URLSearchParams(location.search).get(
                "redirect"
            );
            navigate(redirect || "/dashboard");

            return response;
        } catch (error) {
            setError(error.response?.data?.message || "Đăng nhập thất bại");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        setLoading(true);

        try {
            await logoutApi();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setCurrentUser(null);
            navigate("/login");
            setLoading(false);
        }
    };

    // Provide auth values and functions
    const value = {
        currentUser,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!currentUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
