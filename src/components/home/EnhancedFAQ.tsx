import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'What is Nexus and how does it work?',
    answer: 'Nexus is a global real estate tokenization platform that enables fractional ownership of properties through blockchain technology. You can invest in real estate with as little as $100, receive rental income, and trade property tokens on our marketplace.',
    category: 'Platform',
    keywords: ['tokenization', 'blockchain', 'fractional', 'ownership']
  },
  {
    id: '2',
    question: 'What are the fees associated with investing?',
    answer: 'Our transparent fee structure includes: Investment fee (1.5%), Annual management fee (0.5%), Exit fee (0.5%), and Performance fee (10% on appreciation above 8% annually). All fees are clearly displayed before investment.',
    category: 'Fees',
    keywords: ['fees', 'costs', 'investment', 'management', 'performance']
  },
  {
    id: '3',
    question: 'How much do I need to start investing?',
    answer: 'You can start investing with as little as $100 USD equivalent. There is no maximum investment limit, but individual property ownership is capped at 25% to ensure diversification.',
    category: 'Investment',
    keywords: ['minimum', 'start', 'investment', 'amount']
  },
  {
    id: '4',
    question: 'Who can invest with Nexus?',
    answer: 'Nexus is available globally to users 18+ who complete our KYC verification process. We comply with local regulations in each jurisdiction and provide appropriate access levels based on investor classification.',
    category: 'Eligibility',
    keywords: ['global', 'kyc', 'verification', 'age', 'eligibility']
  },
  {
    id: '5',
    question: 'How do property tokens work?',
    answer: 'Each property is divided into tokens representing fractional ownership. Token value is calculated by dividing the property value by total tokens issued. You receive proportional rental income and appreciation based on your token holdings.',
    category: 'Tokens',
    keywords: ['tokens', 'fractional', 'ownership', 'value', 'calculation']
  },
  {
    id: '6',
    question: 'Can I sell my tokens anytime?',
    answer: 'Tokens can be traded on our marketplace after a 90-day holding period. Liquidity depends on market demand, but we actively work to maintain healthy trading volumes through market-making activities.',
    category: 'Trading',
    keywords: ['sell', 'trade', 'liquidity', 'marketplace', 'holding period']
  },
  {
    id: '7',
    question: 'What regulatory compliance does Nexus maintain?',
    answer: 'Nexus maintains comprehensive regulatory compliance across all operating jurisdictions. We work with leading legal firms and regulatory advisors to ensure full compliance with securities, AML, and consumer protection laws.',
    category: 'Legal',
    keywords: ['regulatory', 'compliance', 'legal', 'securities', 'aml']
  },
  {
    id: '8',
    question: 'How is rental income distributed?',
    answer: 'Rental income is distributed monthly to token holders proportional to their ownership percentage. Payments are processed automatically to your Nexus wallet and can be withdrawn or reinvested.',
    category: 'Income',
    keywords: ['rental', 'income', 'distribution', 'monthly', 'payments']
  }
];

const categories = ['All', 'Platform', 'Fees', 'Investment', 'Eligibility', 'Tokens', 'Trading', 'Legal', 'Income'];

export function EnhancedFAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = useMemo(() => {
    return faqData.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about investing in real estate through Nexus
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map(item => (
              <Card key={item.id} className="shadow-elegant hover:shadow-premium transition-all duration-300">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{item.question}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {expandedItems.has(item.id) && (
                    <div className="px-6 pb-6 animate-fade-in">
                      <div className="bg-accent/30 rounded-lg p-4">
                        <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse by category
              </p>
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-subtle p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Our support team is here to help you with any questions about investing with Nexus
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@nexus.com" 
                  className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Email Support
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}