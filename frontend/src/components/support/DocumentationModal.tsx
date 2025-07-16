import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  TrendingUp, 
  Shield, 
  CreditCard, 
  FileText, 
  Users,
  Search,
  ChevronRight,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const documentationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    color: 'bg-blue-500',
    guides: [
      { title: 'How to Create Your Account', time: '5 min read', difficulty: 'Beginner' },
      { title: 'Completing KYC Verification', time: '8 min read', difficulty: 'Beginner' },
      { title: 'Making Your First Investment', time: '10 min read', difficulty: 'Beginner' },
      { title: 'Understanding Property Tokens', time: '12 min read', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'investment-strategies',
    title: 'Investment Strategies',
    icon: TrendingUp,
    color: 'bg-green-500',
    guides: [
      { title: 'Diversification Best Practices', time: '15 min read', difficulty: 'Intermediate' },
      { title: 'Risk Assessment Framework', time: '20 min read', difficulty: 'Advanced' },
      { title: 'Market Analysis Techniques', time: '18 min read', difficulty: 'Advanced' },
      { title: 'Long-term vs Short-term Strategies', time: '12 min read', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    icon: Shield,
    color: 'bg-purple-500',
    guides: [
      { title: 'Account Security Best Practices', time: '8 min read', difficulty: 'Beginner' },
      { title: 'Two-Factor Authentication Setup', time: '5 min read', difficulty: 'Beginner' },
      { title: 'Regulatory Compliance Overview', time: '25 min read', difficulty: 'Advanced' },
      { title: 'Data Protection & Privacy', time: '10 min read', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Transactions',
    icon: CreditCard,
    color: 'bg-orange-500',
    guides: [
      { title: 'Payment Methods Overview', time: '7 min read', difficulty: 'Beginner' },
      { title: 'Understanding Transaction Fees', time: '6 min read', difficulty: 'Beginner' },
      { title: 'Cryptocurrency Payments', time: '15 min read', difficulty: 'Intermediate' },
      { title: 'International Wire Transfers', time: '12 min read', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'legal',
    title: 'Legal Documents',
    icon: FileText,
    color: 'bg-red-500',
    guides: [
      { title: 'Terms of Service', time: '20 min read', difficulty: 'Beginner' },
      { title: 'Privacy Policy', time: '15 min read', difficulty: 'Beginner' },
      { title: 'Investment Agreement Template', time: '30 min read', difficulty: 'Advanced' },
      { title: 'Risk Disclosure Statement', time: '25 min read', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'community',
    title: 'Community & Support',
    icon: Users,
    color: 'bg-cyan-500',
    guides: [
      { title: 'Community Guidelines', time: '5 min read', difficulty: 'Beginner' },
      { title: 'How to Get Help', time: '4 min read', difficulty: 'Beginner' },
      { title: 'Investor Forums Best Practices', time: '8 min read', difficulty: 'Beginner' },
      { title: 'Reporting Issues & Feedback', time: '6 min read', difficulty: 'Beginner' }
    ]
  }
];

export function DocumentationModal({ isOpen, onClose }: DocumentationModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.guides.some(guide => 
      guide.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredGuides = selectedSection
    ? documentationSections.find(s => s.id === selectedSection)?.guides.filter(guide =>
        guide.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    : [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl">Investment Documentation</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r bg-muted/30">
            <ScrollArea className="h-full p-4">
              {selectedSection && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSection(null)}
                  className="mb-4 w-full justify-start"
                >
                  ← Back to sections
                </Button>
              )}
              
              <div className="space-y-2">
                {!selectedSection ? (
                  // Show sections
                  filteredSections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <div
                        key={section.id}
                        onClick={() => setSelectedSection(section.id)}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-background transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${section.color} text-white`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{section.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {section.guides.length} guides
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Show guides for selected section
                  filteredGuides.map((guide, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-background transition-colors"
                    >
                      <h4 className="font-medium mb-2">{guide.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{guide.time}</span>
                        <Separator orientation="vertical" className="h-3" />
                        <Badge variant="secondary" className={getDifficultyColor(guide.difficulty)}>
                          {guide.difficulty}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-6">
              {!selectedSection ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Welcome to our Documentation</h2>
                    <p className="text-muted-foreground">
                      Comprehensive guides to help you make informed investment decisions and navigate our platform successfully.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSections.slice(0, 4).map((section) => {
                      const IconComponent = section.icon;
                      return (
                        <div
                          key={section.id}
                          onClick={() => setSelectedSection(section.id)}
                          className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded ${section.color} text-white`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <h3 className="font-medium">{section.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {section.guides.length} comprehensive guides available
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Quick Links</h3>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Download Investment Guide PDF
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Platform Terms & Conditions
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Security Best Practices
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selected section content */}
                  {(() => {
                    const section = documentationSections.find(s => s.id === selectedSection);
                    if (!section) return null;
                    
                    const IconComponent = section.icon;
                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded ${section.color} text-white`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">{section.title}</h2>
                            <p className="text-muted-foreground">
                              {section.guides.length} guides in this section
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {filteredGuides.map((guide, index) => (
                            <div
                              key={index}
                              className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium">{guide.title}</h3>
                                <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{guide.time}</span>
                                <Separator orientation="vertical" className="h-3" />
                                <Badge variant="secondary" className={getDifficultyColor(guide.difficulty)}>
                                  {guide.difficulty}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}