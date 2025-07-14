import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/providers/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

// Pages
import Index from '@/pages/Index';
import Properties from '@/pages/Properties';
import PropertyDetail from '@/pages/PropertyDetail';
import Dashboard from '@/pages/Dashboard';
import Portfolio from '@/pages/Portfolio';
import Profile from '@/pages/Profile';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import TokenizationDashboard from '@/pages/TokenizationDashboard';
import TokenizationWidget from '@/pages/TokenizationWidget';
import AIBuddyPage from '@/pages/AIBuddyPage';
import InvestorResources from '@/pages/InvestorResources';
import NotFound from '@/pages/NotFound';
import { ChatProvider } from '@/ai/Chat/ChatContext';
import { FloatingChatWidget } from '@/ai/Chat/FloatingChatWidget';

function App() {
  return (
    <Providers>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tokenization" element={<TokenizationDashboard />} />
                <Route path="/tokenization-widget" element={<TokenizationWidget />} />
                <Route path="/ai-buddy" element={<AIBuddyPage />} />
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />
                <Route path="/investor-resources" element={<InvestorResources />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <FloatingChatWidget />
            <Toaster />
          </div>
        </Router>
      </ChatProvider>
    </Providers>
  );
}

export default App;