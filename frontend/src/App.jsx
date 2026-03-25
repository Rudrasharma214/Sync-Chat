//-----------------packages----------------------

import React from "react";
import { Loader } from "lucide-react";

//-----------------------------------------------

//----------------components---------------------

import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

//-----------------------------------------------

//--------------------routes---------------------

import AppRoutes from "./routes/AppRoutes";

//----------------------------------------------

const AppContent = () => {
  const { isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <AppRoutes />
      <Toaster />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
