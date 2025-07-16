import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TOKO from '@/components/ai/TOKO';
import { Card } from '@/components/ui/card';
import { Sparkles, MessageCircle, TrendingUp } from 'lucide-react';

const TOKOPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="toko-icon" style={{ width: '32px', height: '32px' }} />
          <h1 className="text-3xl font-bold">TOKO - Your AI Investment Assistant</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Meet TOKO, your personal investment advisor. Get insights, discover opportunities, 
          and grow your portfolio with conversational AI that knows your investments inside out.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AI Chat */}
        <div className="lg:col-span-2">
          <TOKO userId={user?.id} className="w-full" />
        </div>

        {/* Features Sidebar */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold">Natural Conversations</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Chat naturally with TOKO about your investments. No complex menus - just ask what you want to know.
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
              <h3 className="font-semibold">Smart Validation</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              TOKO validates your tokenisation submissions in real-time, ensuring compliance and accuracy.
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Real-time form validation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Compliance checking
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Instant feedback
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold">Quick Actions</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              TOKO provides quick-reply buttons for common actions, making navigation effortless.
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                View Portfolio instantly
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Start Tokenisation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Learn More options
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TOKOPage;