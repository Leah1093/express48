import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// יצירת הקונטקסט
const AuthContext = createContext();

// hook לשימוש נוח בקונטקסט
export function useAuth() {
    return useContext(AuthContext);
}

// ה-Provider שמנהל את מצב המשתמש
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // כאן נשמר המשתמש המחובר
    const [loading, setLoading] = useState(true); // כדי לדעת מתי טעינה הסתיימה

    useEffect(() => {
        // בדיקת התחברות ראשונית כשנכנסים לאתר
        const checkAuth = async () => {
            try {
                const res = await axios.get("https://api.express48.com/entrance/me", { withCredentials: true });
                setUser(res.data.user);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        await axios.post("https://api.express48.com/entrance/logout", {}, { withCredentials: true });

        setUser(null);
    };

    const value = { user, login, logout, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
