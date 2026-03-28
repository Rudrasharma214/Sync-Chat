//-----------------packages----------------------

import { Loader } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//-----------------------------------------------

//----------------components---------------------

import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

//-----------------------------------------------

//--------------------routes---------------------

import AppRoutes from "./routes/AppRoutes";

//----------------------------------------------

const AppContent = () => {
  const { isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="theme-bg theme-text flex h-screen items-center justify-center">
        <Loader className="size-10 animate-spin text-amber-500" />
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
