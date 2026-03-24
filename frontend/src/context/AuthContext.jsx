import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as authService from '../services/AuthServices';
import { logger } from '../utils/logger';

const AuthContext = createContext();

/**
 * AuthProvider - Provides global auth state and methods
 * Backend uses httpOnly cookies for token storage
 */
export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Check if user is authenticated on app load
     */
    const checkAuth = useCallback(async () => {
        try {
            setIsCheckingAuth(true);
            setError(null);

            // Call a GET endpoint to verify auth (e.g., GET /api/auth/me)
            // For now, we'll check if cookies are valid by making a test request
            // You should create a GET /api/auth/me endpoint on backend

            logger.info('Auth check in progress', null, 'AuthContext');
            // Mock: assume user is authenticated if we reach here (backend validates cookie)
            // Real implementation: call an endpoint to verify token in cookie

            setIsCheckingAuth(false);
        } catch (err) {
            logger.error('Auth check failed', err, 'AuthContext');
            setAuthUser(null);
            setError(err.message);
            setIsCheckingAuth(false);
        }
    }, []);

    /**
     * Handle login
     */
    const login = useCallback(async (email, password) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await authService.login(email, password);

            if (result.success) {
                setAuthUser(result.data);
                logger.info('Login successful', result.data, 'AuthContext');
                return { success: true, data: result.data };
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMessage);
            logger.error('Login failed', err, 'AuthContext');
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Handle signup
     */
    const signup = useCallback(async (fullname, email, password) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await authService.signup(fullname, email, password);

            if (result.success) {
                setAuthUser(result.data);
                logger.info('Signup successful', result.data, 'AuthContext');
                return { success: true, data: result.data };
            } else {
                throw new Error(result.message || 'Signup failed');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Signup failed';
            setError(errorMessage);
            logger.error('Signup failed', err, 'AuthContext');
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Handle logout
     */
    const logout = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            await authService.logout();
            setAuthUser(null);
            logger.info('Logout successful', null, 'AuthContext');
            return { success: true };
        } catch (err) {
            const errorMessage = err.message || 'Logout failed';
            setError(errorMessage);
            logger.error('Logout failed', err, 'AuthContext');
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update auth user (e.g., after profile update)
     */
    const updateAuthUser = useCallback((userData) => {
        setAuthUser(userData);
        logger.info('Auth user updated', userData, 'AuthContext');
    }, []);

    /**
     * Clear auth error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value = {
        // State
        authUser,
        isCheckingAuth,
        isLoading,
        error,

        // Methods
        checkAuth,
        login,
        signup,
        logout,
        updateAuthUser,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
