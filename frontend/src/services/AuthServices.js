import { api } from "./ApiInstance"
import { logger } from "../utils/logger"

/**
 * Login user with email and password
 * Backend returns user data and sets httpOnly cookies
 */
export const login = async (email, password) => {
    try {
        const response = await api.post("/auth/login", { email, password })
        logger.info('Login API call successful', null, 'AuthServices')
        return { success: true, data: response.data.data }
    } catch (error) {
        logger.error('Login API call failed', error.response?.data, 'AuthServices')
        return {
            success: false,
            message: error.response?.data?.message || error.message
        }
    }
}

/**
 * Register new user
 * Backend returns user data and sets httpOnly cookies
 */
export const signup = async (fullname, email, password) => {
    try {
        const response = await api.post("/auth/signup", { fullname, email, password })
        logger.info('Signup API call successful', null, 'AuthServices')
        return { success: true, data: response.data.data }
    } catch (error) {
        logger.error('Signup API call failed', error.response?.data, 'AuthServices')
        return {
            success: false,
            message: error.response?.data?.message || error.message
        }
    }
}

/**
 * Change user password
 */
export const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await api.patch("/auth/change-password", {
            currentPassword,
            newPassword
        })
        logger.info('Change password API call successful', null, 'AuthServices')
        return { success: true, data: response.data.data }
    } catch (error) {
        logger.error('Change password API call failed', error.response?.data, 'AuthServices')
        return {
            success: false,
            message: error.response?.data?.message || error.message
        }
    }
}

/**
 * Logout user
 * Backend clears httpOnly cookies
 */
export const logout = async () => {
    try {
        const response = await api.post("/auth/logout")
        logger.info('Logout API call successful', null, 'AuthServices')
        return { success: true }
    } catch (error) {
        logger.error('Logout API call failed', error.response?.data, 'AuthServices')
        return {
            success: false,
            message: error.response?.data?.message || error.message
        }
    }
}

/**
 * Refresh access token using refresh token from httpOnly cookie
 * Backend returns new accessToken in httpOnly cookie
 */
export const refreshToken = async () => {
    try {
        const response = await api.post("/auth/refresh-token")
        logger.info('Token refresh API call successful', null, 'AuthServices')
        return { success: true, data: response.data.data }
    } catch (error) {
        logger.error('Token refresh API call failed', error.response?.data, 'AuthServices')
        return {
            success: false,
            message: error.response?.data?.message || error.message
        }
    }
}