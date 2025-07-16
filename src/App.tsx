import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { SmartBreadcrumbs } from "@/components/ui/smart-breadcrumbs";
import { TapAnimationProvider } from "@/components/ui/tap-animation";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { HelpAssistant } from "@/components/ui/help-assistant";
// import { useCapacitor } from "@/hooks/useCapacitor"; // Temporarily disabled

// Pages
const Index = lazy(() => import("./pages/Index"));
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const InvestmentSuccess = lazy(() => import("./pages/investment/InvestmentSuccess").then(m => ({ default: m.InvestmentSuccess })));
const InvestmentCancel = lazy(() => import("./pages/investment/InvestmentCancel").then(m => ({ default: m.InvestmentCancel })));
const TokenizationDemo = lazy(() => import("./pages/TokenizationDemo"));
const TokenizationDashboard = lazy(() => import("./pages/TokenizationDashboard"));
const Trading = lazy(() => import("./pages/Trading"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const GlobalTrading = lazy(() => import("./pages/GlobalTrading"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Demo = lazy(() => import("./pages/Demo"));
const Referrals = lazy(() => import("./pages/Referrals"));
const Payments = lazy(() => import("./pages/Payments"));
const Compliance = lazy(() => import("./pages/Compliance"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const RiskDisclaimer = lazy(() => import("./pages/legal/RiskDisclaimer"));
const InvestorResources = lazy(() => import("./pages/InvestorResources"));
const EarlyAccess = lazy(() => import("./pages/EarlyAccess"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const QualityAssurance = lazy(() => import("./pages/QualityAssurance"));
const SystemResilience = lazy(() => import("./pages/SystemResilience"));
const TOKOAdvisorPage = lazy(() => import("./pages/TOKOAdvisorPage"));
const Phase1Validation = lazy(() => import("./pages/Phase1Validation"));
const Documentation = lazy(() => import("./pages/Documentation"));
const ShariaTokenization = lazy(() => import("./pages/ShariaTokenization"));

// QueryClient is now handled in Providers component

function AppContent() {
  console.log('AppContent loading - useCapacitor disabled');
  // Temporarily removed useCapacitor to fix React context issue
  // const { isNative, deviceInfo, isKeyboardOpen } = useCapacitor();

  return (
    <div className="min-h-screen flex flex-col bg-background">{/* removed ${isKeyboardOpen ? 'keyboard-open' : ''} */}
      <Navbar />
      <SmartBreadcrumbs />
      <main className="flex-1">
        <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
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
          <Route path="/quality-assurance" element={<QualityAssurance />} />
          <Route path="/system-resilience" element={<SystemResilience />} />
          <Route path="/toko-advisor" element={<TOKOAdvisorPage />} />
          <Route path="/phase1-validation" element={<Phase1Validation />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/sharia-tokenization" element={<ShariaTokenization />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <PWAInstallPrompt />
      <HelpAssistant />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Providers>
        <TapAnimationProvider>
          <AppContent />
          <CustomCursor />
          <Toaster />
        </TapAnimationProvider>
      </Providers>
    </BrowserRouter>
  );
}

export default App;