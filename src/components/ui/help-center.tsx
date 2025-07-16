import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CursorToggle } from '@/components/ui/cursor-toggle';
import { Search, HelpCircle, MessageSquare, FileText, Shield, TrendingUp, Wallet, Settings } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  icon: any;
}

const faqs: FAQItem[] = [
  {
    category: "Getting Started",
    icon: HelpCircle,
    question: "What is the minimum investment amount?",
    answer: "Start investing with just $100 USD (≈ AED 367). Access premium properties through fractional ownership with instant confirmation."
  },
  {
    category: "Getting Started", 
    icon: HelpCircle,
    question: "How quickly can I start investing?",
    answer: "Complete KYC verification in under 2 hours. Upload ID and proof of address, get instant approval, and start investing immediately with our streamlined process."
  },
  {
    category: "Payments",
    icon: Wallet,
    question: "What payment methods do you support?",
    answer: "Multiple options: Stripe, Apple Pay, Google Pay, and cryptocurrency. All payments process instantly with immediate investment confirmation."
  },
  {
    category: "Referrals",
    icon: TrendingUp,
    question: "How do referral rewards work?",
    answer: "Earn token rewards for every successful referral. Both you and your friend receive bonus tokens when they complete their first investment. Track rewards in your dashboard."
  },
  {
    category: "Investments",
    icon: TrendingUp,
    question: "How fast are investment confirmations?",
    answer: "Instant confirmation! Unlike traditional 24-hour settlement cycles, your investments are confirmed immediately with real-time portfolio updates."
  },
  {
    category: "Security",
    icon: Shield,
    question: "How secure are my investments?",
    answer: "Bank-grade security with blockchain transparency. All investments are legally documented, regulated, and protected by smart contracts with multi-signature wallets."
  }
];

export function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];
  
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Investor Resources
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed top-16 left-1/2 -translate-x-1/2 max-w-[600px] w-[calc(100%-2rem)] max-h-[600px] overflow-y-auto p-4 z-[1000]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Investor Resources
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Live Chat</CardTitle>
                </div>
                <CardDescription className="text-xs">Get instant support from our team</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Documentation</CardTitle>
                </div>
                <CardDescription className="text-xs">Comprehensive guides and tutorials</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Account Support</CardTitle>
                </div>
                <CardDescription className="text-xs">Help with account and verification</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Frequently Asked Questions</h3>
            {filteredFAQs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <faq.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <CardTitle className="text-base">{faq.question}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{faq.answer}</CardDescription>
                      <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Cursor Settings */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Preferences</h3>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Custom Cursor</p>
                <p className="text-xs text-muted-foreground">Enable the Nexus branded cursor</p>
              </div>
              <CursorToggle />
            </div>
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No results found. Try adjusting your search or contact support.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}