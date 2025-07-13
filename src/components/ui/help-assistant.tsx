import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Search, BookOpen, MessageCircle, Phone, Mail, ArrowRight } from 'lucide-react';

const helpTopics = [
  {
    category: "Getting Started",
    items: [
      { title: "How to create an account", description: "Step-by-step guide to signing up" },
      { title: "Complete your profile", description: "Required information for investing" },
      { title: "KYC verification process", description: "Document requirements and timeline" },
      { title: "Connect your wallet", description: "Link blockchain wallet for token storage" }
    ]
  },
  {
    category: "Investing",
    items: [
      { title: "Minimum investment amount", description: "Start with as little as $100" },
      { title: "How fractional ownership works", description: "Understanding property tokens" },
      { title: "Expected returns", description: "8-12% annual returns explained" },
      { title: "Payment methods", description: "Accepted payment options" }
    ]
  },
  {
    category: "Portfolio Management",
    items: [
      { title: "Track your investments", description: "Dashboard overview and analytics" },
      { title: "Receiving rental income", description: "Quarterly payments to your wallet" },
      { title: "Trading your tokens", description: "Marketplace liquidity options" },
      { title: "Tax implications", description: "Understanding your obligations" }
    ]
  }
];

const quickActions = [
  { title: "Browse Properties", path: "/properties", icon: BookOpen },
  { title: "View Portfolio", path: "/portfolio", icon: Search },
  { title: "Complete Profile", path: "/profile", icon: HelpCircle },
  { title: "Start Investing", path: "/auth/signup", icon: ArrowRight }
];

export function HelpAssistant() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTopics = helpTopics.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-primary/20 bg-white/95 backdrop-blur-sm"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </DialogTitle>
          <DialogDescription>
            Find answers to common questions or get in touch with our support team
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Actions */}
          {!searchQuery && (
            <div>
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.path}
                    className="group p-3 border rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                  >
                    <action.icon className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium">{action.title}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Help Topics */}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {filteredTopics.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  {category.category}
                  <Badge variant="secondary" className="text-xs">
                    {category.items.length}
                  </Badge>
                </h3>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="p-3 border rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedCategory(item.title)}
                    >
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Need More Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" className="flex items-center gap-2 justify-start">
                <MessageCircle className="h-4 w-4" />
                Live Chat
              </Button>
              <Button variant="outline" className="flex items-center gap-2 justify-start">
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
              <Button variant="outline" className="flex items-center gap-2 justify-start">
                <Phone className="h-4 w-4" />
                Call Us
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Our support team is available 24/7 to help you with any questions
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}