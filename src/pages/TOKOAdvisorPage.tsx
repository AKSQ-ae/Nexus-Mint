import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, MessageCircle, TrendingUp, Sparkles, Shield, Target, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TOKOChatWidget } from '@/components/ai/TOKOChatWidget';
import { useToast } from '@/hooks/use-toast';

const TOKOAdvisorPage: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLearnMore = () => {
    // Track analytics event
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'toko_learn_more_click', {
        event_category: 'TOKO_Advisor',
        event_label: 'Hero_Learn_More'
      });
    }
    
    // Smooth scroll to features section
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLiveChat = () => {
    // Track analytics event
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'toko_live_chat_start', {
        event_category: 'TOKO_Advisor',
        event_label: 'Hero_Live_Chat'
      });
    }
    
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    // Track analytics event
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'toko_chat_session_end', {
        event_category: 'TOKO_Advisor',
        event_label: 'Chat_Session_End'
      });
    }
    
    setIsChatOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-orange-accent/20 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Live Beta Now Available:<br />
            <span className="text-primary">TOKO AI Advisor</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Personalized portfolio guidance powered by regulated AI tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleLearnMore}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
            >
              Learn More
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              onClick={handleLiveChat}
              variant="cta"
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-orange-accent to-orange-accent/90 hover:from-orange-accent/90 hover:to-orange-accent text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              TOKO AI Live Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features-section" className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Your AI Investment Partner
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get personalized insights, smart recommendations, and real-time guidance for your real estate portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Natural Conversations */}
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Natural Conversations</h3>
            <p className="text-slate-600 mb-6">Ask anything—no menus, no jargon.</p>
            <ul className="text-left space-y-3 text-slate-600">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                Text & voice chat support
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                Remembers your preferences
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                24/7 availability
              </li>
            </ul>
          </Card>

          {/* Personalized Insights */}
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Personalized Insights</h3>
            <p className="text-slate-600 mb-6">Recommendations tailored to your risk profile.</p>
            <ul className="text-left space-y-3 text-slate-600">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                Portfolio performance analysis
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                Market opportunities
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                Risk assessment & advice
              </li>
            </ul>
          </Card>

          {/* Smart Suggestions */}
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Smart Suggestions</h3>
            <p className="text-slate-600 mb-6">High-yield alerts, diversification tips, tax-smart moves.</p>
            <ul className="text-left space-y-3 text-slate-600">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-600" />
                8-12% yield opportunities
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-600" />
                Diversification strategies
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-600" />
                Tax optimization tips
              </li>
            </ul>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="p-12 bg-gradient-to-r from-primary/5 to-orange-accent/5 border-primary/20">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Ready to optimize your portfolio?
            </h3>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Start a conversation with TOKO AI and discover personalized investment opportunities today.
            </p>
            <Button 
              onClick={handleLiveChat}
              variant="cta"
              size="lg"
              className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-orange-accent to-orange-accent/90 hover:from-orange-accent/90 hover:to-orange-accent text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Bot className="mr-2 w-6 h-6" />
              Start Chat with TOKO AI
            </Button>
          </Card>
        </div>
      </div>

      {/* Chat Widget */}
      <TOKOChatWidget 
        isOpen={isChatOpen} 
        onClose={handleChatClose} 
      />
    </div>
  );
};

export default TOKOAdvisorPage;