import { useMutation } from "@tanstack/react-query";
import * as authService from "../../services/AuthServices.js";
import { logger } from "../../utils/logger.js";

/**
 * Hook for user login mutation
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: (data) => {
      logger.info("Login successful", data, "useLogin");
    },
    onError: (error) => {
      logger.error("Login failed", error, "useLogin");
    },
  });
};

/**
 * Hook for user registration mutation
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: ({ fullname, email, password }) => authService.signup(fullname, email, password),
    onSuccess: (data) => {
      logger.info("Registration successful", data, "useRegister");
    },
    onError: (error) => {
      logger.error("Registration failed", error, "useRegister");
    },
  });
};

/**
 * Hook for change password mutation
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: (data) => {
      logger.info("Password changed successfully", data, "useChangePassword");
    },
    onError: (error) => {
      logger.error("Password change failed", error, "useChangePassword");
    },
  });
};

/**
 * Hook for refresh token mutation
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (data) => {
      logger.info("Token refreshed successfully", data, "useRefreshToken");
    },
    onError: (error) => {
      logger.error("Token refresh failed", error, "useRefreshToken");
    },
  });
};

/**
 * Hook for logout mutation
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: (data) => {
      logger.info("Logout successful", data, "useLogout");
    },
    onError: (error) => {
      logger.error("Logout failed", error, "useLogout");
    },
  });
};
