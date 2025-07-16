import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, HelpCircle, Sparkles, MessageCircle, Mail, ExternalLink, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

const categories = ['All', 'Platform', 'Fees', 'Eligibility', 'Trading', 'Legal'];

export function EnhancedFAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandAllToggle, setExpandAllToggle] = useState(false);

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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const expandAll = () => {
    if (expandAllToggle) {
      setExpandedItems(new Set());
      setExpandAllToggle(false);
    } else {
      setExpandedItems(new Set(filteredFAQs.map(item => item.id)));
      setExpandAllToggle(true);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <HelpCircle className="h-8 w-8 text-primary" />
              <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about investing in real estate through Nexus
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{filteredFAQs.length} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{categories.length - 1} categories</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Enhanced Search and Filter */}
          <Card className="mb-8 shadow-elegant border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Search questions, answers, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 text-base border-primary/30 focus:border-primary"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Categories:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Badge
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-md"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                        {category !== 'All' && selectedCategory === category && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                  
                  {(searchQuery || selectedCategory !== 'All') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredFAQs.length} of {faqData.length} questions
                  </div>
                  <Button variant="ghost" size="sm" onClick={expandAll} className="text-xs">
                    {expandAllToggle ? 'Collapse all' : 'Expand all'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced FAQ Items */}
          <div className="grid gap-4">
            {filteredFAQs.map((item, index) => (
              <Card key={item.id} className="shadow-elegant hover:shadow-premium transition-all duration-300 border-l-4 border-l-primary/30 hover:border-l-primary">
                <Collapsible 
                  open={expandedItems.has(item.id)} 
                  onOpenChange={() => toggleExpanded(item.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="w-full p-6 text-left flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer group">
                      <div className="flex-1 flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{item.question}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                            <div className="flex gap-1">
                              {item.keywords.slice(0, 3).map(keyword => (
                                <span key={keyword} className="text-xs text-muted-foreground bg-accent/50 px-1.5 py-0.5 rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-6 pb-6 animate-accordion-down">
                      <div className="ml-12 bg-gradient-subtle rounded-lg p-4 border border-accent">
                        <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-accent">
                          <div className="text-xs text-muted-foreground">
                            Was this helpful?
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-xs hover:text-green-600">
                              👍 Yes
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs hover:text-red-600">
                              👎 No
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>

          {/* Enhanced No Results */}
          {filteredFAQs.length === 0 && (
            <Card className="shadow-elegant border-dashed border-2 border-muted">
              <CardContent className="text-center py-12">
                <div className="animate-bounce mb-4">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No questions match your search</h3>
                <p className="text-muted-foreground mb-4">
                  Try different keywords or browse by category
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Contact Support */}
          <div className="mt-12">
            <Card className="bg-gradient-to-br from-white via-blue-50/5 to-white dark:from-background dark:via-blue-950/5 dark:to-background shadow-elegant border border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Still need help?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Our expert support team is standing by to help you succeed with your real estate investments
                </p>
                <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h4 className="font-medium mb-1">Live Chat</h4>
                      <p className="text-xs text-muted-foreground mb-3">Chat with our team now</p>
                      <Button variant="default" size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <Mail className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h4 className="font-medium mb-1">Email Support</h4>
                      <p className="text-xs text-muted-foreground mb-3">Get detailed help via email</p>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href="mailto:support@nexus.com">
                          Contact Us
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}