import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Providers } from "./components/providers/Providers";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import Index from "./pages/Index";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-foreground">
          🏢 Nexus Platform
        </h1>
        <p className="text-center text-muted-foreground mt-4">
          Real Estate Investment Made Simple
        </p>
        <div className="text-center mt-8">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
