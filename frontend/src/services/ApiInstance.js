import axios from 'axios';
import { logger } from '../utils/logger';

// Create axios instance
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Important: enables cookie handling for httpOnly tokens
});

/**
 * Request Interceptor
 * Logs outgoing requests
 */
api.interceptors.request.use(
    (config) => {
        logger.debug('API Request', {
            method: config.method,
            url: config.url,
        }, 'ApiInterceptor');
        return config;
    },
    (error) => {
        logger.error('Request interceptor error', error, 'ApiInterceptor');
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles token refresh on 401, automatic logout, error logging
 */
api.interceptors.response.use(
    (response) => {
        logger.debug('API Response', {
            status: response.status,
            url: response.config.url,
        }, 'ApiInterceptor');
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            logger.warn('Unauthorized (401) - Attempting token refresh', {
                url: originalRequest.url,
            }, 'ApiInterceptor');

            // Prevent infinite retry loop
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // Attempt to refresh token
                    // Backend will set new accessToken in httpOnly cookie
                    const refreshResponse = await api.post('/auth/refresh-token');

                    logger.info('Token refreshed successfully', null, 'ApiInterceptor');

                    // Retry original request with new token (in cookie)
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - user must login again
                    logger.error('Token refresh failed', refreshError, 'ApiInterceptor');

                    // Clear any stale cookies
                    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

                    // Redirect to login
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }

                    return Promise.reject(refreshError);
                }
            }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            logger.error('Forbidden (403)', {
                url: originalRequest.url,
                message: error.response.data?.message,
            }, 'ApiInterceptor');
        }

        // Handle 500 Server Error
        if (error.response?.status >= 500) {
            logger.error('Server Error', {
                status: error.response.status,
                url: originalRequest.url,
                message: error.response.data?.message,
            }, 'ApiInterceptor');
        }

        // Log other errors
        logger.error('API Error', {
            status: error.response?.status,
            message: error.message,
            url: originalRequest.url,
        }, 'ApiInterceptor');

        return Promise.reject(error);
    }
);