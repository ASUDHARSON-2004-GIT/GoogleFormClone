import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const storedUser = JSON.parse(localStorage.getItem("user"));
                    if (storedUser) setUser(storedUser);
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify({ _id: res.data._id, email: res.data.email }));
        setUser({ _id: res.data._id, email: res.data.email });
        return res.data;
    };

    const register = async (email, password) => {
        const res = await api.post("/auth/register", { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify({ _id: res.data._id, email: res.data.email }));
        setUser({ _id: res.data._id, email: res.data.email });
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
