import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Welcome from "../pages/Welcome";
import ChatDashboard from "../pages/ChatDashboard";
import Groups from "../pages/Groups";
import Settings from "../pages/Settings";
import OpenRoute from "./OpenRoutes";
import ProtectedRoute from "./ProtectedRoutes";

/**
 * AppRoutes component
 * Centralized route definitions for the application
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<Welcome />} />

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
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        }
      />

      {/* Catch-all - Redirect to welcome */}
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};

export default AppRoutes;
