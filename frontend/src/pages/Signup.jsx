import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeClosed, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const { isLoading, signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.fullname.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = validateForm();
    if (!valid) return;

    const result = await signup(formData.fullname, formData.email, formData.password);
    if (result.success) {
      toast.success("Account created successfully");
      navigate("/chat");
    } else {
      toast.error(result.message || "Signup failed");
    }
  };

  return (
    <div className="theme-bg min-h-screen">
      <Navbar />
      <div className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-2">
        <div className="relative flex items-center justify-center px-6 py-16 sm:px-10 lg:px-14">
          <div className="theme-surface relative w-full max-w-md sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="theme-text mt-4 text-3xl font-semibold tracking-tight">
                Create Account
              </h1>
              <p className="theme-muted mt-2 text-sm">
                Join Sync-Chat and start messaging in seconds.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="theme-muted mb-2 block text-sm font-medium">Full Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className="theme-muted h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    className="theme-input w-full rounded-2xl border px-4 py-3 pl-11 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    placeholder="John Doe"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="theme-muted mb-2 block text-sm font-medium">Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="theme-muted h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    className="theme-input w-full rounded-2xl border px-4 py-3 pl-11 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="theme-muted mb-2 block text-sm font-medium">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="theme-muted h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="theme-input w-full rounded-2xl border px-4 py-3 pl-11 pr-11 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="theme-muted absolute inset-y-0 right-0 flex items-center pr-4 transition hover:text-amber-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeClosed className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                    Loading...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <p className="theme-muted text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-700">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>

        <AuthImagePattern
          title="Join our community"
          subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
        />
      </div>
    </div>
  );
};

export default Signup;
