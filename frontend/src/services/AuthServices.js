import api from "./ApiInstance"

export const login = async (email,password) => {
    const response = await api.post("/auth/login",{email,password})
    return response.data
};

export const signup = async (name,email,password) => {
    const response = await api.post("/auth/signup",{name,email,password})
    return response.data
};

export const changePassword = async (currentPassword,newPassword) => {
    const response = await api.post("/auth/change-password",{currentPassword,newPassword})
    return response.data
};

export const logout = async () => {
    const response = await api.post("/auth/logout")
    return response.data
};

export const refreshToken = async () => {
    const response = await api.post("/auth/refresh-token")
    return response.data
};