import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AIBuddy from '@/components/ai/AIBuddy';
import { Card } from '@/components/ui/card';
import { Sparkles, MessageCircle, TrendingUp } from 'lucide-react';

const AIBuddyPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Your AI Investment Buddy</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Meet your personal investment advisor. Get insights, discover opportunities, 
          and grow your portfolio with conversational AI that knows your investments inside out.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AI Chat */}
        <div className="lg:col-span-2">
          <AIBuddy userId={user?.id} className="w-full" />
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
              <Sparkles className="w-6 h-6 text-purple-600" />
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
    </div>
  );
};

export default AIBuddyPage;