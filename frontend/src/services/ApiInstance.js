import axios from 'axios';
import { logger } from '../utils/logger';

let refreshPromise = null;

const shouldSkipRefresh = (url = '') => {
    return (
        url.includes('/auth/login') ||
        url.includes('/auth/signup') ||
        url.includes('/auth/refresh-token')
    );
};

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
        if (error.response?.status === 401 && originalRequest && !shouldSkipRefresh(originalRequest.url)) {
            logger.warn('Unauthorized (401) - Attempting token refresh', {
                url: originalRequest.url,
            }, 'ApiInterceptor');

            // Prevent infinite retry loop
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    if (!refreshPromise) {
                        // Execute one refresh request and share it across pending 401 retries.
                        refreshPromise = api.post('/auth/refresh-token').finally(() => {
                            refreshPromise = null;
                        });
                    }

                    await refreshPromise;

                    logger.info('Token refreshed successfully', null, 'ApiInterceptor');

                    // Retry original request with new token (in cookie)
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - user must login again
                    logger.error('Token refresh failed', refreshError, 'ApiInterceptor');

                    // Redirect to login
                    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
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