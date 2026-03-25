import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, LogIn, MessageSquare, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, logout } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result?.success) {
      navigate("/login");
    }
  };

  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-80">
          
          <h1 className="text-lg font-bold text-amber-500">Sync-Chat</h1>
        </Link>

        <div className="flex items-center gap-2">
          {!authUser && !isLoginPage && (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/60 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}

          {!authUser && !isSignupPage && (
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-600"
            >
              <UserPlus className="h-4 w-4" />
              <span>Sign Up</span>
            </Link>
          )}

          {authUser && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
