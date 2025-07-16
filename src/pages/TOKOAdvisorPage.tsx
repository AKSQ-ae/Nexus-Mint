import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, MessageCircle, TrendingUp, HeadphonesIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TOKOAdvisorModal } from '@/components/modals/TOKOAdvisorModal';

const TOKOAdvisorPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setIsModalOpen(true);
  };

  const handleLiveChat = () => {
    navigate('/investor-resources');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Bot className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">TOKO AI Advisor</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Live Beta Now Available: TOKO AI Advisor. Personalized portfolio guidance powered by regulated AI tools.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Coming Soon Card */}
        <div className="lg:col-span-2">
          <Card className="p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Live Beta Now Available</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              TOKO AI Advisor. Personalized portfolio guidance powered by regulated AI tools.
            </p>
            <div className="space-y-3">
              <Button onClick={handleGetStarted} className="w-full max-w-xs">
                Learn More
              </Button>
              <Button onClick={handleLiveChat} variant="outline" className="w-full max-w-xs">
                <MessageCircle className="w-4 h-4 mr-2" />
                TOKO AI Live Chat
              </Button>
            </div>
          </Card>
        </div>

        {/* Features Sidebar */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold">Natural Conversations</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Chat naturally about your investments. No complex menus - just ask what you want to know.
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Text & voice chat support
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Remembers your preferences
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                24/7 availability
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold">Personalized Insights</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get recommendations tailored to your portfolio, risk tolerance, and goals.
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Portfolio performance analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Market opportunities
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Growth strategies
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold">Smart Suggestions</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Discover new opportunities with impact predictions for your specific portfolio.
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Property recommendations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Reward opportunities
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Diversification tips
              </li>
            </ul>
          </Card>
        </div>
      </div>
      
      <TOKOAdvisorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default TOKOAdvisorPage;