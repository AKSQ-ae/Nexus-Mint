import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { HelpCircle, Search, BookOpen, MessageCircle, Phone, Mail, ArrowRight, Play, CheckCircle, Clock, User, CreditCard, TrendingUp, Star, Lightbulb, MapPin, Zap } from 'lucide-react';

const helpTopics = [
  {
    category: "Getting Started",
    icon: User,
    items: [
      { title: "How to create an account", description: "Step-by-step guide to signing up", status: "video", duration: "2 min" },
      { title: "Complete your profile", description: "Required information for investing", status: "guide", priority: "high" },
      { title: "KYC verification process", description: "Document requirements and timeline", status: "guide", duration: "5 min" },
      { title: "Connect your wallet", description: "Link blockchain wallet for token storage", status: "video", duration: "3 min" }
    ]
  },
  {
    category: "Investing",
    icon: CreditCard,
    items: [
      { title: "Minimum investment amount", description: "Start with as little as $100", status: "guide", priority: "high" },
      { title: "How fractional ownership works", description: "Understanding property tokens", status: "video", duration: "4 min" },
      { title: "Expected returns", description: "8-12% annual returns explained", status: "guide", duration: "3 min" },
      { title: "Payment methods", description: "Accepted payment options", status: "guide", priority: "medium" }
    ]
  },
  {
    category: "Portfolio Management",
    icon: TrendingUp,
    items: [
      { title: "Track your investments", description: "Dashboard overview and analytics", status: "interactive", duration: "2 min" },
      { title: "Receiving rental income", description: "Quarterly payments to your wallet", status: "guide", duration: "3 min" },
      { title: "Trading your tokens", description: "Marketplace liquidity options", status: "video", duration: "5 min" },
      { title: "Tax implications", description: "Understanding your obligations", status: "guide", priority: "high" }
    ]
  }
];

const quickActions = [
  { title: "Browse Properties", path: "/properties", icon: BookOpen, description: "Explore available investment opportunities" },
  { title: "View Portfolio", path: "/portfolio", icon: TrendingUp, description: "Check your investments and returns" },
  { title: "Complete Profile", path: "/profile", icon: User, description: "Finish your account setup", priority: true },
  { title: "Start Investing", path: "/auth/signup", icon: ArrowRight, description: "Join thousands of investors", cta: true }
];

const contextualHelp = {
  "/": {
    title: "Welcome to Nexus Mint",
    tips: [
      { icon: Lightbulb, text: "Start by browsing our curated property collection" },
      { icon: Star, text: "Properties are vetted by our expert team" },
      { icon: Zap, text: "Invest with as little as $100" }
    ]
  },
  "/properties": {
    title: "Property Investment Guide",
    tips: [
      { icon: MapPin, text: "Filter by location, price, and expected returns" },
      { icon: TrendingUp, text: "Look for properties with strong growth potential" },
      { icon: CheckCircle, text: "Check property details and market analysis" }
    ]
  },
  "/portfolio": {
    title: "Portfolio Management",
    tips: [
      { icon: TrendingUp, text: "Track your investment performance over time" },
      { icon: CreditCard, text: "Receive rental income quarterly" },
      { icon: Star, text: "Diversify across multiple properties" }
    ]
  },
  "/profile": {
    title: "Profile Setup",
    tips: [
      { icon: User, text: "Complete KYC verification to unlock investing" },
      { icon: CreditCard, text: "Add payment methods for seamless investing" },
      { icon: CheckCircle, text: "Verify your identity for account security" }
    ]
  }
};

const learningPaths = [
  {
    title: "New Investor Journey",
    description: "Perfect for first-time real estate investors",
    steps: ["Create Account", "Complete Profile", "Browse Properties", "Make First Investment"],
    progress: 25,
    icon: User
  },
  {
    title: "Advanced Strategies",
    description: "Maximize returns with advanced techniques",
    steps: ["Portfolio Diversification", "Market Analysis", "Risk Management", "Tax Optimization"],
    progress: 0,
    icon: TrendingUp
  },
  {
    title: "Platform Mastery",
    description: "Master all platform features",
    steps: ["Navigation", "Analytics", "Trading", "Community"],
    progress: 60,
    icon: Star
  }
];

export function HelpAssistant() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('help');
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentContext = contextualHelp[location.pathname as keyof typeof contextualHelp] || contextualHelp["/"];

  const filteredTopics = helpTopics.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'video': return <Play className="h-3 w-3" />;
      case 'interactive': return <Zap className="h-3 w-3" />;
      default: return <BookOpen className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-primary/20 bg-gradient-to-br from-white/95 to-primary/5 backdrop-blur-sm hover:scale-105 group"
        >
          <HelpCircle className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 bg-primary text-white text-xs flex items-center justify-center">
            ?
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden p-0">
        <div className="bg-gradient-to-br from-primary/5 to-secondary/10 p-6 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-full">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              Help Center
            </DialogTitle>
            <DialogDescription className="text-base">
              {currentContext.title} - Get help when you need it most
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mx-6 mt-4 mb-4">
            <TabsTrigger 
              value="help" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="h-4 w-4" />
              Help Topics
            </TabsTrigger>
            <TabsTrigger 
              value="contextual" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Lightbulb className="h-4 w-4" />
              Page Tips
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              Learning Paths
            </TabsTrigger>
            <TabsTrigger 
              value="support" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <TabsContent value="help" className="space-y-6 mt-0">
              {/* Enhanced Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search help topics, guides, and tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {/* Enhanced Quick Actions */}
              {!searchQuery && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <Card key={index} className={`group hover:shadow-md transition-all duration-200 ${action.priority ? 'ring-1 ring-primary/20' : ''} ${action.cta ? 'bg-gradient-to-br from-primary/5 to-primary/10' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                              <action.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                                <Button 
                                  size="sm" 
                                  variant={action.cta ? "default" : "outline"} 
                                  className="w-full"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Close the dialog first
                                    const dialogClose = document.querySelector('[data-state="open"] [data-radix-dialog-close]') as HTMLElement;
                                    if (dialogClose) {
                                      dialogClose.click();
                                    } else {
                                      // Fallback: find and close any open dialog
                                      const dialog = document.querySelector('[data-state="open"]') as HTMLElement;
                                      if (dialog) {
                                        const event = new KeyboardEvent('keydown', { key: 'Escape' });
                                        dialog.dispatchEvent(event);
                                      }
                                    }
                                    // Navigate after a short delay to ensure dialog closes
                                    setTimeout(() => {
                                      navigate(action.path);
                                    }, 150);
                                  }}
                                >
                                  {action.cta ? "Get Started" : "Open"}
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Help Topics */}
              <div className="space-y-6">
                {filteredTopics.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-primary" />
                      {category.category}
                      <Badge variant="secondary" className="text-xs">
                        {category.items.length}
                      </Badge>
                    </h3>
                    <div className="grid gap-3">
                      {category.items.map((item, itemIndex) => (
                        <Card key={itemIndex} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-sm">{item.title}</h4>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(item.status)}
                                    {item.duration && (
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {item.duration}
                                      </Badge>
                                    )}
                                    {item.priority && (
                                      <Badge variant={getPriorityColor(item.priority) as any} className="text-xs">
                                        {item.priority}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contextual" className="space-y-6 mt-0">
              <div className="text-center py-8">
                <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{currentContext.title}</h3>
                <p className="text-muted-foreground text-sm mb-6">Here are some tips for this page</p>
              </div>

              <div className="space-y-4">
                {currentContext.tips.map((tip, index) => (
                  <Card key={index} className="border-l-4 border-l-primary/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <tip.icon className="h-5 w-5 text-primary flex-shrink-0" />
                        <p className="text-sm">{tip.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="learning" className="space-y-6 mt-0">
              <div className="text-center py-6">
                <h3 className="font-semibold text-lg mb-2">Learning Paths</h3>
                <p className="text-muted-foreground text-sm">Structured learning journeys to master real estate investing</p>
              </div>

              <div className="space-y-4">
                {learningPaths.map((path, index) => (
                  <Card key={index} className="hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <path.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{path.title}</h4>
                          <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{path.progress}%</span>
                            </div>
                            <Progress value={path.progress} className="h-2" />
                            <div className="flex flex-wrap gap-2">
                              {path.steps.map((step, stepIndex) => (
                                <Badge key={stepIndex} variant={stepIndex < path.steps.length * (path.progress / 100) ? "default" : "outline"} className="text-xs">
                                  {stepIndex < path.steps.length * (path.progress / 100) && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {step}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="support" className="space-y-6 mt-0">
              <div className="text-center py-6">
                <h3 className="font-semibold text-lg mb-2">Contact Support</h3>
                <p className="text-muted-foreground text-sm">Our expert team is here to help you succeed</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-all duration-200 group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Live Chat</h4>
                    <p className="text-sm text-muted-foreground mb-4">Get instant help from our team</p>
                    <Badge variant="outline" className="text-xs">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                      Online now
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all duration-200 group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Email Support</h4>
                    <p className="text-sm text-muted-foreground mb-4">Detailed help via email</p>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      4-hour response
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all duration-200 group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                      <Phone className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Phone Support</h4>
                    <p className="text-sm text-muted-foreground mb-4">Speak directly with an expert</p>
                    <Badge variant="outline" className="text-xs">
                      Mon-Fri 9AM-6PM
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-secondary/10 rounded-lg p-6 text-center">
                <Star className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Premium Support</h4>
                <p className="text-sm text-muted-foreground mb-4">Get priority support and dedicated account management</p>
                <Button className="w-full">Upgrade to Premium</Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}