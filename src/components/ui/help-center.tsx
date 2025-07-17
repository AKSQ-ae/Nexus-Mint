import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CursorToggle } from '@/components/ui/cursor-toggle';
import { Search, HelpCircle, MessageSquare, FileText, Shield, TrendingUp, Wallet, Settings, X, Book, Lightbulb, Headphones } from 'lucide-react';

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

type TabType = 'help-topics' | 'page-tips' | 'learning-paths' | 'support';

export function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<TabType>('help-topics');
  const [isOpen, setIsOpen] = useState(false);

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];
  
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'help-topics', label: 'Help Topics', icon: HelpCircle },
    { id: 'page-tips', label: 'Page Tips', icon: Lightbulb },
    { id: 'learning-paths', label: 'Learning Paths', icon: Book },
    { id: 'support', label: 'Support', icon: Headphones }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Investor Resources
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] max-w-[90vw] h-auto max-h-[80vh] p-0 overflow-hidden rounded-xl shadow-[0_0_12px_rgba(0,0,0,0.08)] border-0">
        {/* Header */}
        <div className="h-[62px] bg-[#F3F4F6] border-b border-[#E5E7EB] flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl leading-7 font-semibold text-[#111827]">Help Center</h2>
            <p className="text-sm leading-5 text-[#6B7280]">Find answers and get support</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Bar */}
        <div className="h-[52px] bg-white border-b border-[#E5E7EB] flex items-center px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 h-full text-sm font-medium transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-[#3B82F6]' 
                  : 'text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3B82F6]" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 114px)' }}>
          {activeTab === 'help-topics' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Search for help..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-[#E5E7EB] focus:border-[#3B82F6] text-[#374151]"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedCategory === category 
                        ? 'bg-[#3B82F6] text-white' 
                        : 'text-[#374151] border-[#E5E7EB] hover:bg-[#F3F4F6]'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-3">
                {filteredFAQs.map((faq, index) => (
                  <Card key={index} className="border-[#E5E7EB] hover:border-[#3B82F6] transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-[#111827]">
                        <faq.icon className="h-4 w-4 text-[#3B82F6]" />
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm text-[#6B7280] leading-relaxed">
                        {faq.answer}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'page-tips' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <Lightbulb className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#111827] mb-2">Page Tips</h3>
                <p className="text-sm text-[#6B7280]">Get contextual help for the current page</p>
              </div>
            </div>
          )}

          {activeTab === 'learning-paths' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <Book className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#111827] mb-2">Learning Paths</h3>
                <p className="text-sm text-[#6B7280]">Structured courses to master the platform</p>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <Headphones className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#111827] mb-2">Contact Support</h3>
                <p className="text-sm text-[#6B7280] mb-6">Need more help? Reach out to our support team</p>
                <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}