//-----------------packages----------------------

import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";

//-----------------------------------------------

//----------------components---------------------

import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

//-----------------------------------------------

//--------------------pages----------------------

import Signup from "./pages/Signup";
import Login from "./pages/Login";

//----------------------------------------------

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
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
    <div>
      <Navbar />

      <Routes>
        <Route
          path="/signup"
          element={<Signup />}
        />
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/signup" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
