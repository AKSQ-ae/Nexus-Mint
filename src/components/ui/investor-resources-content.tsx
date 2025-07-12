import React, { useState } from 'react';
import { Search, HelpCircle, MessageSquare, FileText, Settings, TrendingUp, DollarSign, Shield, Users, Home, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CursorToggle } from '@/components/ui/cursor-toggle';
import { useToast } from '@/hooks/use-toast';

const faqs = [
  {
    category: "Getting Started",
    icon: Home,
    question: "What is the minimum investment amount?",
    answer: "Start investing with just $100 USD (≈ AED 367). Access premium properties through fractional ownership with instant confirmation."
  },
  {
    category: "Getting Started", 
    icon: Users,
    question: "How quickly can I start investing?",
    answer: "Complete KYC verification in under 2 hours. Upload ID and proof of address, get instant approval, and start investing immediately."
  },
  {
    category: "Investments",
    icon: TrendingUp,
    question: "How are property tokens priced?",
    answer: "Each property is divided into tokens representing fractional ownership. Token value is calculated by dividing the property value by total tokens issued. You receive proportional rental income and appreciation based on your token holdings."
  },
  {
    category: "Investments",
    icon: DollarSign,
    question: "How is rental income distributed?",
    answer: "Rental income is automatically distributed monthly to token holders based on their ownership percentage. All distributions are processed through smart contracts for transparency and efficiency."
  },
  {
    category: "Payments",
    icon: CreditCard,
    question: "What payment methods do you accept?",
    answer: "We accept major credit cards, bank transfers, and cryptocurrency payments. All transactions are secured with bank-grade encryption and processed through verified payment gateways."
  },
  {
    category: "Security",
    icon: Shield,
    question: "How secure are my investments?",
    answer: "Bank-grade security with blockchain transparency. All investments are legally documented, regulated, and protected by smart contracts with multi-signature wallets."
  }
];

export function InvestorResourcesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { toast } = useToast();

  const handleLiveChat = () => {
    toast({
      title: "Live Chat",
      description: "Starting live chat session... Our support team will be with you shortly.",
    });
  };

  const handleDocumentation = () => {
    toast({
      title: "Documentation",
      description: "Opening comprehensive investment guides and tutorials...",
    });
  };

  const handleAccountSupport = () => {
    toast({
      title: "Account Support",
      description: "Connecting you with account verification and setup assistance...",
    });
  };

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];
  
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base border-primary/30 focus:border-primary"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-primary/20"
          onClick={handleLiveChat}
        >
          <CardHeader className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Live Chat</CardTitle>
            <CardDescription>Get instant support from our team</CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-primary/20"
          onClick={handleDocumentation}
        >
          <CardHeader className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Documentation</CardTitle>
            <CardDescription>Comprehensive guides and tutorials</CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-primary/20"
          onClick={handleAccountSupport}
        >
          <CardHeader className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Account Support</CardTitle>
            <CardDescription>Help with account and verification</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* FAQ List */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-center">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <Card key={index} className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <faq.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <CardTitle className="text-lg leading-relaxed">{faq.question}</CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </CardDescription>
                    <Badge variant="outline" className="text-xs px-3 py-1">
                      {faq.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Cursor Settings */}
      <div className="border-t pt-8 max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold mb-4 text-center">Preferences</h3>
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg max-w-md mx-auto">
          <div>
            <p className="font-medium">Custom Cursor</p>
            <p className="text-sm text-muted-foreground">Enable the Nexus branded cursor</p>
          </div>
          <CursorToggle />
        </div>
      </div>

      {filteredFAQs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No results found. Try adjusting your search or contact support.</p>
        </div>
      )}
    </div>
  );
}