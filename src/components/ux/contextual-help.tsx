import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Info, HelpCircle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface HelpContent {
  title: string;
  description: string;
  learnMoreUrl?: string;
  examples?: string[];
  relatedTerms?: string[];
}

interface ContextualHelpProps {
  term: string;
  content: HelpContent;
  variant?: 'tooltip' | 'inline' | 'modal';
  trigger?: 'hover' | 'click';
  className?: string;
  children?: React.ReactNode;
}

export function ContextualHelp({ 
  term, 
  content, 
  variant = 'tooltip',
  trigger = 'hover',
  className,
  children 
}: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  const TriggerIcon = variant === 'inline' ? Info : HelpCircle;

  const helpContent = (
    <Card className="w-80 shadow-lg border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          {content.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm text-muted-foreground mb-3">
          {content.description}
        </CardDescription>
        
        {content.examples && content.examples.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-foreground mb-2">Examples:</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {content.examples.map((example, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {content.relatedTerms && content.relatedTerms.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-foreground mb-2">Related:</div>
            <div className="flex flex-wrap gap-1">
              {content.relatedTerms.map((term, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {content.learnMoreUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={() => window.open(content.learnMoreUrl, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Learn More
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (variant === 'inline') {
    return (
      <div className={cn("inline-flex items-center gap-1", className)}>
        {children || <span className="underline decoration-dotted">{term}</span>}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onMouseEnter={() => trigger === 'hover' && setIsOpen(true)}
              onMouseLeave={() => trigger === 'hover' && setIsOpen(false)}
              onClick={() => trigger === 'click' && setIsOpen(!isOpen)}
            >
              <TriggerIcon className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="p-0">
            {helpContent}
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          className={cn(
            "underline decoration-dotted cursor-help hover:decoration-solid transition-all",
            className
          )}
          onMouseEnter={() => trigger === 'hover' && setIsOpen(true)}
          onMouseLeave={() => trigger === 'hover' && setIsOpen(false)}
          onClick={() => trigger === 'click' && setIsOpen(!isOpen)}
        >
          {children || term}
        </span>
      </PopoverTrigger>
      <PopoverContent side="top" className="p-0">
        {helpContent}
      </PopoverContent>
    </Popover>
  );
}

// Common help content definitions for Nexus Mint
export const HELP_CONTENT: Record<string, HelpContent> = {
  tokenization: {
    title: 'Property Tokenization',
    description: 'Converting real estate assets into digital tokens that represent ownership shares, making property investment more accessible and liquid.',
    examples: [
      'A $1M property divided into 10,000 tokens at $100 each',
      'Owning 100 tokens = 1% ownership of the property',
      'Tokens can be traded on secondary markets'
    ],
    relatedTerms: ['Smart Contract', 'Fractional Ownership', 'Blockchain'],
    learnMoreUrl: 'https://nexusmint.com/learn/tokenization'
  },
  
  shariaCompliant: {
    title: 'Sharia-Compliant Investment',
    description: 'Investments that follow Islamic financial principles, avoiding interest (riba), excessive uncertainty (gharar), and prohibited activities.',
    examples: [
      'Asset-backed investments rather than debt-based',
      'Transparent profit-sharing arrangements',
      'Ethical screening of properties and tenants'
    ],
    relatedTerms: ['Halal Investing', 'Islamic Finance', 'Musharakah'],
    learnMoreUrl: 'https://nexusmint.com/learn/sharia-compliance'
  },
  
  dNFT: {
    title: 'Dynamic NFT (dNFT)',
    description: 'Non-Fungible Tokens that can change their properties over time based on external data or conditions, unlike static NFTs.',
    examples: [
      'Property ownership certificate that updates with rental income',
      'Investment badge that evolves as you reach milestones',
      'Referral NFT that grows with successful invites'
    ],
    relatedTerms: ['NFT', 'Smart Contract', 'Metadata'],
    learnMoreUrl: 'https://nexusmint.com/learn/dynamic-nfts'
  },
  
  roi: {
    title: 'Return on Investment (ROI)',
    description: 'A measure of the efficiency and profitability of an investment, typically expressed as a percentage.',
    examples: [
      'Annual rental yield of 6-8%',
      'Capital appreciation over 5-10 years',
      'Combined total returns of 12-15% annually'
    ],
    relatedTerms: ['Yield', 'Capital Gains', 'Dividend'],
    learnMoreUrl: 'https://nexusmint.com/learn/returns'
  },
  
  kyc: {
    title: 'Know Your Customer (KYC)',
    description: 'A regulatory process to verify the identity of investors and assess their suitability for investment products.',
    examples: [
      'Government-issued ID verification',
      'Address confirmation via utility bill',
      'Financial background assessment'
    ],
    relatedTerms: ['AML', 'Compliance', 'Due Diligence'],
    learnMoreUrl: 'https://nexusmint.com/learn/kyc'
  },
  
  liquidityPool: {
    title: 'Liquidity Pool',
    description: 'A collection of funds locked in a smart contract to facilitate trading and provide liquidity for tokenized property shares.',
    examples: [
      'Pool of tokens available for immediate purchase',
      'Automated market making for price discovery',
      'Exit liquidity for investors wanting to sell'
    ],
    relatedTerms: ['AMM', 'Market Making', 'Trading'],
    learnMoreUrl: 'https://nexusmint.com/learn/liquidity'
  },
  
  smartContract: {
    title: 'Smart Contract',
    description: 'Self-executing contracts with terms directly written into code, automatically enforcing agreements without intermediaries.',
    examples: [
      'Automatic rental income distribution',
      'Programmed property management fees',
      'Transparent voting on property decisions'
    ],
    relatedTerms: ['Blockchain', 'DeFi', 'Automation'],
    learnMoreUrl: 'https://nexusmint.com/learn/smart-contracts'
  }
};

// Helper component for common terms
export function HelpTerm({ term, children, ...props }: { term: keyof typeof HELP_CONTENT; children?: React.ReactNode } & Omit<ContextualHelpProps, 'content' | 'term'>) {
  const content = HELP_CONTENT[term];
  if (!content) return children || <span>{term}</span>;
  
  return (
    <ContextualHelp term={term} content={content} {...props}>
      {children}
    </ContextualHelp>
  );
}