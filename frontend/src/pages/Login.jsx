import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthImagePattern from "../components/AuthImagePattern";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      toast.success("Login successful");
      navigate("/");
    } else {
      toast.error(result.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-2">
        <div className="relative flex items-center justify-center px-6 py-16 sm:px-10 lg:px-14">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-2xl shadow-slate-300/30 backdrop-blur sm:p-10">
            <div className="mb-8 text-center ">
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Welcome Back</h1>
              <p className="mt-2 text-sm text-slate-600">Sign in to continue your conversations.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 pr-11 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 transition hover:text-slate-700"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>

              <p className="text-center text-sm text-slate-600">
                New here?{" "}
                <Link to="/signup" className="font-semibold text-amber-600 hover:text-amber-700">
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </div>

        <AuthImagePattern
          title={"Welcome back!"}
          subtitle={"Sign in to continue your conversations and catch up with your messages."}
        />
      </div>
    </div>
  );
};

export default Login;