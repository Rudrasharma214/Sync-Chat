import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "../pages/Signup";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoutes";
import OpenRoute from "./OpenRoutes";

/**
 * AppRoutes component
 * Centralized route definitions for the application
 */
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes - Only accessible when not authenticated */}
            <Route
                path="/signup"
                element={
                    <OpenRoute>
                        <Signup />
                    </OpenRoute>
                }
            />
            <Route
                path="/login"
                element={
                    <OpenRoute>
                        <Login />
                    </OpenRoute>
                }
            />

            {/* Protected Routes - Only accessible when authenticated */}
            {/* Add protected routes here as you build chat features */}

            {/* Catch-all - Redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
