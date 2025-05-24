//-----------------packages----------------------

import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";

//-----------------------------------------------

//----------------components---------------------

import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

//-----------------------------------------------

//--------------------pages----------------------

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SettingsP from "./pages/SettingsP";

//----------------------------------------------

const App = () => {
  const { authUser, checkAuth, isCheckingAuth,onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  //  console.log({onlineUsers})

  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  // console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme} >
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <Signup /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsP />} />
        <Route
          path="/profile"
          element={authUser ? <Profile /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
