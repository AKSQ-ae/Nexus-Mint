import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { SmartBreadcrumbs } from "@/components/ui/smart-breadcrumbs";
import { TapAnimationProvider } from "@/components/ui/tap-animation";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

// Pages
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Portfolio from "./pages/Portfolio";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/NotFound";
import { InvestmentSuccess } from "./pages/investment/InvestmentSuccess";
import { InvestmentCancel } from "./pages/investment/InvestmentCancel";
import TokenizationDemo from "./pages/TokenizationDemo";
import TokenizationDashboard from "./pages/TokenizationDashboard";
import Trading from "./pages/Trading";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import GlobalTrading from "./pages/GlobalTrading";
import HowItWorks from "./pages/HowItWorks";
import Demo from "./pages/Demo";
import Referrals from "./pages/Referrals";
import Payments from "./pages/Payments";
import Compliance from "./pages/Compliance";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import RiskDisclaimer from "./pages/legal/RiskDisclaimer";
import InvestorResources from "./pages/InvestorResources";
import EarlyAccess from "./pages/EarlyAccess";
import SystemHealth from "./pages/SystemHealth";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Providers>
          <TapAnimationProvider>
            <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <SmartBreadcrumbs />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/investment/success" element={<InvestmentSuccess />} />
                <Route path="/investment/cancel" element={<InvestmentCancel />} />
                <Route path="/tokenization-demo" element={<TokenizationDemo />} />
                <Route path="/tokenization/:propertyId?" element={<TokenizationDashboard />} />
                <Route path="/analytics" element={<AdvancedAnalytics />} />
                <Route path="/global-trading" element={<GlobalTrading />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/referrals" element={<Referrals />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/legal/terms" element={<Terms />} />
                <Route path="/legal/privacy" element={<Privacy />} />
                <Route path="/legal/risk-disclaimer" element={<RiskDisclaimer />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/trading/:id" element={<Trading />} />
                <Route path="/trading" element={<GlobalTrading />} />
                <Route path="/investor-resources" element={<InvestorResources />} />
                <Route path="/early-access" element={<EarlyAccess />} />
                <Route path="/system-health" element={<SystemHealth />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <PWAInstallPrompt />
            </div>
            <CustomCursor />
            <Toaster />
          </TapAnimationProvider>
        </Providers>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;