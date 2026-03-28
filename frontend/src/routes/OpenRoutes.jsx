import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "lucide-react";

/**
 * OpenRoute component for public routes (auth pages)
 * Redirects to chat if user is already authenticated
 */
const OpenRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return !authUser ? children : <Navigate to="/chat" replace />;
};

export default OpenRoute;
