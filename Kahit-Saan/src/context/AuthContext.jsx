import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken as setApiAuthToken } from '../api/adminApi'; // Adjust path as needed

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const userString = localStorage.getItem('adminUser');
        if (token && userString) {
            try {
                const user = JSON.parse(userString);
                setAdminUser(user);
                setApiAuthToken(token); // Set token for API calls
            } catch (e) {
                console.error("Failed to parse adminUser from localStorage", e);
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
            }
        }
        setLoadingAuth(false);
    }, []);

    const loginAdmin = (userData, token) => {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        setAdminUser(userData);
        setApiAuthToken(token);
    };

    const logoutAdmin = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAdminUser(null);
        setApiAuthToken(null); // Clear token from API calls
    };

    return (
        <AuthContext.Provider value={{ adminUser, loginAdmin, logoutAdmin, loadingAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;