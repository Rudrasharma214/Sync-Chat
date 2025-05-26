import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogOut,
  LogIn,
  MessageSquare,
  Settings,
  User,
  UserPlus,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, authUser } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Sync-Chat</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/settings" className="btn btn-sm gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {!authUser && (
              <>
                {!isLoginPage && (
                  <Link to="/login" className="btn btn-sm  gap-2">
                    <LogIn className="size-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                )}
                {!isSignupPage && (
                  <Link to="/signup" className="btn btn-sm  gap-2">
                    <UserPlus className="size-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Link>
                )}
              </>
            )}

            {authUser && (
              <>
                {/* 👇 AI Chat Button */}
                <Link to="/aichat" className="btn btn-sm gap-2">
                  <MessageSquare className="size-4" />
                  <span className="hidden sm:inline">AI Chat</span>
                </Link>

                <Link to="/profile" className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button
                  className="flex gap-2 items-center btn btn-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
