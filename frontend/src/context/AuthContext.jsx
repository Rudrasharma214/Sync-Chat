/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import * as authService from "../services/AuthServices";
import { logger } from "../utils/logger";

const AuthContext = createContext();

const fallbackAuthContext = {
  authUser: null,
  isCheckingAuth: false,
  isLoading: false,
  error: "AuthProvider is missing",
  checkAuth: async () => ({ success: false, message: "AuthProvider is missing" }),
  login: async () => ({ success: false, message: "AuthProvider is missing" }),
  signup: async () => ({ success: false, message: "AuthProvider is missing" }),
  logout: async () => ({ success: false, message: "AuthProvider is missing" }),
  updateAuthUser: () => {},
  clearError: () => {},
};

/**
 * AuthProvider - Provides global auth state and methods
 * Backend uses httpOnly cookies for token storage
 */
export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasCheckedAuth = useRef(false);

  /**
   * Check if user is authenticated on app load
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsCheckingAuth(true);
      setError(null);

      logger.info("Auth check in progress", null, "AuthContext");

      const result = await authService.getMe();

      if (result.success) {
        setAuthUser(result.data);
        logger.info("Auth check successful", result.data, "AuthContext");
      } else {
        setAuthUser(null);
        logger.warn("Auth check failed: user not authenticated", result.message, "AuthContext");
      }
    } catch (err) {
      logger.error("Auth check failed", err, "AuthContext");
      setAuthUser(null);
      setError(err.message);
    } finally {
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
        logger.info("Login successful", result.data, "AuthContext");
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      logger.error("Login failed", err, "AuthContext");
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
        logger.info("Signup successful", result.data, "AuthContext");
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || "Signup failed");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Signup failed";
      setError(errorMessage);
      logger.error("Signup failed", err, "AuthContext");
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
      logger.info("Logout successful", null, "AuthContext");
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || "Logout failed";
      setError(errorMessage);
      logger.error("Logout failed", err, "AuthContext");
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
    logger.info("Auth user updated", userData, "AuthContext");
  }, []);

  /**
   * Clear auth error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check auth on mount
  useEffect(() => {
    if (hasCheckedAuth.current) {
      return;
    }

    hasCheckedAuth.current = true;
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
    logger.error("useAuth called outside AuthProvider", null, "AuthContext");
    return fallbackAuthContext;
  }
  return context;
};

export default AuthContext;
