import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Welcome from "../pages/Welcome";
import OpenRoute from "./OpenRoutes";

/**
 * AppRoutes component
 * Centralized route definitions for the application
 */
const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Welcome />} />

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

            {/* Catch-all - Redirect to welcome */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
