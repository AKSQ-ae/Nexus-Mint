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
    answer: "You can start investing with just $100 USD (approximately AED 367). This allows you to purchase fractional ownership in premium real estate properties."
  },
  {
    category: "Getting Started", 
    icon: HelpCircle,
    question: "How do I verify my account?",
    answer: "Complete KYC verification by uploading a government-issued ID and proof of address. The process takes 1-2 business days and ensures compliance with UAE regulations."
  },
  {
    category: "Investments",
    icon: TrendingUp,
    question: "How are returns calculated and distributed?",
    answer: "Returns come from rental income (distributed quarterly) and property appreciation. All distributions are automatic and transparent through your dashboard."
  },
  {
    category: "Investments",
    icon: TrendingUp,
    question: "Can I sell my tokens before the property is sold?",
    answer: "Yes, tokens can be traded on our secondary marketplace (coming soon) or held until property exit events for maximum returns."
  },
  {
    category: "Security",
    icon: Shield,
    question: "How is my investment protected?",
    answer: "Investments are secured through blockchain technology, regulated by UAE authorities, and backed by real property ownership with legal documentation."
  },
  {
    category: "Payments",
    icon: Wallet,
    question: "What payment methods are accepted?",
    answer: "We accept credit/debit cards, bank transfers, and cryptocurrency payments. All transactions are processed through licensed payment partners."
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
          Help Center
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help Center
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