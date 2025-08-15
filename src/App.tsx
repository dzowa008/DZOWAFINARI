import { useEffect, useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import Spinner from "./components/spinner";

// (If you use a morphing blobs background you may re-add it in your own way.)

type AppState = "landing" | "auth" | "dashboard";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppState>("landing");

  // Automatically switch view based on auth state
  useEffect(() => {
    if (isLoading) return; // show spinner/loading until auth check finishes
    if (user) {
      setCurrentView("dashboard");
    } else if (currentView === "dashboard" || currentView === "auth") {
      setCurrentView("auth");
    } // remain on landing if user logs out and started there
    // You can further refine this logic for your UX.
    // eslint-disable-next-line
  }, [user, isLoading]);

  if (isLoading) return <Spinner />;

  if (currentView === "landing") {
    return <LandingPage onGetStarted={() => setCurrentView("auth")} />;
  }
  if (currentView === "auth") {
    return (
      <AuthPage
        onBackToLanding={() => setCurrentView("landing")}
      />
    );
  }
  if (currentView === "dashboard") {
    return <Dashboard />;
  }

  // fallback (should never hit)
  return <LandingPage onGetStarted={() => setCurrentView("auth")} />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
