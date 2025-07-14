import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, MessageSquare, History, Settings, Shield, TrendingUp, Search, Calculator, AlertTriangle, Sparkles } from 'lucide-react';
import AIBuddy from '@/components/ai/AIBuddy';
import { AdviceHistory } from '@/components/ai/AdviceHistory';
import AISettings from '@/components/ai/AISettings';
import { PrivacyControls } from '@/components/ai/PrivacyControls';
import { useAuth } from '@/contexts/AuthContext';

const AIBuddyPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">AI Investment Buddy</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to access your personalized AI investment assistant.
            </p>
            <Button onClick={() => window.location.href = '/auth/signin'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section - Start With the Outcome */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="h-10 w-10 text-primary" />
          <Sparkles className="h-6 w-6 text-primary/60" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Your AI buddy that predicts exactly how much you'll earn before you invest
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Get personalized investment insights with real-time ROI predictions, portfolio optimization, and smart recommendations tailored to your investment style.
        </p>
        <Button size="lg" className="mr-4">
          <MessageSquare className="h-5 w-5 mr-2" />
          Start Chatting
        </Button>
        <Button variant="outline" size="lg">
          <TrendingUp className="h-5 w-5 mr-2" />
          See Examples
        </Button>
      </div>

      {/* Real Examples Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 border-primary/20">
          <div className="text-2xl font-bold text-primary mb-2">$12,480</div>
          <p className="text-sm text-muted-foreground">
            "You've invested $5,000 in Dubai Marina—this new listing could add 12% more to your returns."
          </p>
        </Card>
        <Card className="p-6 border-primary/20">
          <div className="text-2xl font-bold text-primary mb-2">$5,000</div>
          <p className="text-sm text-muted-foreground">
            "Last month you earned $1,200; here's how to hit $5,000 by year-end."
          </p>
        </Card>
        <Card className="p-6 border-primary/20">
          <div className="text-2xl font-bold text-primary mb-2">Perfect Match</div>
          <p className="text-sm text-muted-foreground">
            "Based on your $500/month habit, this property fits your portfolio pattern."
          </p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <AIBuddy userId={user.id} className="h-[600px]" />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-left h-auto p-3">
                    <Calculator className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">"Calculate returns for $1000 in tech properties"</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left h-auto p-3">
                    <Search className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">"Find properties similar to my Dubai investment"</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left h-auto p-3">
                    <TrendingUp className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">"Analyze my portfolio performance"</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-8">
          {/* Four Core Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* What It Does */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                What It Does
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Predicts your exact earnings before you invest a single dollar</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Finds properties that match your investment patterns and goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Optimizes your portfolio for maximum returns with minimum risk</span>
                </li>
              </ul>
            </Card>

            {/* How You Interact */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                How You Interact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Natural conversation in your preferred language</span>
                </div>
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>Voice commands and audio responses</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span>Mobile-friendly for investing on the go</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sample Dialogue */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              See It In Action
            </h3>
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">AI Buddy</p>
                  <p>"I see you prefer safe gains—shall I show you properties with 8–10% ROI?"</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold">You</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">You</p>
                  <p>"Yes, please."</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">AI Buddy</p>
                  <p>"Here are two options in Abu Dhabi. One boosts your diversification by 15%."</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Capabilities */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Key Capabilities
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">ROI Prediction Engine</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  "This $2,000 investment could return $2,350 in 12 months based on market trends."
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Portfolio Optimization</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  "Adding this Dubai property would reduce your risk by 8% while maintaining 12% returns."
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Market Intelligence</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  "London properties are up 3% this month—perfect timing for your UK allocation."
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Risk Assessment</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  "I recommend avoiding this property—it's outside your risk tolerance for emerging markets."
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Specs */}
          <Card className="p-6 bg-muted/30">
            <h3 className="text-lg font-semibold mb-2">Quick Specs</h3>
            <p className="text-sm text-muted-foreground">
              Powered by advanced AI with real-time market data, portfolio analytics, and personalized learning algorithms.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <AdviceHistory />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AISettings />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <PrivacyControls />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIBuddyPage;