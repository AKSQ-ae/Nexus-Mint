import React from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InvestmentIntent {
  type: 'investment' | 'portfolio' | 'discovery' | 'kyc' | 'general';
  amount?: number;
  currency?: string;
  location?: string;
  criteria?: string;
  propertyId?: string;
  confidence: number;
}

export class IntelligentChatProcessor {
  private static investmentPatterns = [
    /invest\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(aed|usd|eur)?\s*(?:in\s+)?(.+)?/i,
    /buy\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(aed|usd|eur)?\s*(?:of\s+)?(.+)?/i,
    /purchase\s+(.+)\s+for\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(aed|usd|eur)?/i
  ];

  private static portfolioPatterns = [
    /show\s+(?:me\s+)?(?:my\s+)?portfolio/i,
    /portfolio\s+performance/i,
    /my\s+investments/i,
    /what\s+(?:do\s+)?i\s+own/i
  ];

  private static discoveryPatterns = [
    /find\s+(?:me\s+)?(.+)\s+properties/i,
    /show\s+(?:me\s+)?(.+)\s+deals/i,
    /search\s+for\s+(.+)/i,
    /properties\s+(?:in\s+)?(.+)/i
  ];

  private static kycPatterns = [
    /verify\s+(?:my\s+)?id/i,
    /kyc\s+verification/i,
    /upload\s+documents/i,
    /complete\s+verification/i
  ];

  static analyzeIntent(message: string): InvestmentIntent {
    const cleanMessage = message.trim().toLowerCase();

    // Check investment patterns
    for (const pattern of this.investmentPatterns) {
      const match = cleanMessage.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        const currency = match[2]?.toUpperCase() || 'AED';
        const details = match[3] || '';
        
        return {
          type: 'investment',
          amount,
          currency,
          location: this.extractLocation(details),
          confidence: 0.9
        };
      }
    }

    // Check portfolio patterns
    for (const pattern of this.portfolioPatterns) {
      if (pattern.test(cleanMessage)) {
        return {
          type: 'portfolio',
          confidence: 0.95
        };
      }
    }

    // Check discovery patterns
    for (const pattern of this.discoveryPatterns) {
      const match = cleanMessage.match(pattern);
      if (match) {
        return {
          type: 'discovery',
          criteria: match[1],
          location: this.extractLocation(match[1]),
          confidence: 0.85
        };
      }
    }

    // Check KYC patterns
    for (const pattern of this.kycPatterns) {
      if (pattern.test(cleanMessage)) {
        return {
          type: 'kyc',
          confidence: 0.9
        };
      }
    }

    return {
      type: 'general',
      confidence: 0.1
    };
  }

  private static extractLocation(text: string): string | undefined {
    const locations = ['dubai', 'abu dhabi', 'sharjah', 'marina', 'downtown', 'jbr', 'difc'];
    const foundLocation = locations.find(loc => 
      text.toLowerCase().includes(loc)
    );
    return foundLocation;
  }

  static async processInvestmentFlow(intent: InvestmentIntent): Promise<{
    requiresKyc: boolean;
    suggestedProperties?: any[];
    estimatedTokens?: number;
    estimatedFees?: number;
    actionRequired?: string;
  }> {
    try {
      // Check if user needs KYC
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return {
          requiresKyc: true,
          actionRequired: 'authentication'
        };
      }

      // Check KYC status
      const { data: kycDocs } = await supabase
        .from('kyc_documents')
        .select('status')
        .eq('user_id', user.user.id)
        .eq('status', 'approved')
        .limit(1);

      if (!kycDocs || kycDocs.length === 0) {
        return {
          requiresKyc: true,
          actionRequired: 'kyc_verification'
        };
      }

      if (intent.type === 'investment' && intent.amount) {
        // Find suitable properties based on criteria
        let query = supabase
          .from('properties')
          .select(`
            id, title, price, price_per_token, location, city, 
            min_investment, images, property_type
          `)
          .eq('is_active', true)
          .lte('min_investment', intent.amount);

        if (intent.location) {
          query = query.or(`location.ilike.%${intent.location}%,city.ilike.%${intent.location}%`);
        }

        const { data: properties } = await query.limit(3);

        if (properties && properties.length > 0) {
          const firstProperty = properties[0];
          const estimatedTokens = Math.floor(intent.amount / (firstProperty.price_per_token || 100));
          const estimatedFees = intent.amount * 0.025; // 2.5% fee

          return {
            requiresKyc: false,
            suggestedProperties: properties,
            estimatedTokens,
            estimatedFees,
            actionRequired: 'confirm_investment'
          };
        }
      }

      return {
        requiresKyc: false,
        actionRequired: 'property_search'
      };

    } catch (error) {
      console.error('Error processing investment flow:', error);
      return {
        requiresKyc: false,
        actionRequired: 'error_recovery'
      };
    }
  }

  static generateSmartResponse(intent: InvestmentIntent, flowResult?: any): string {
    switch (intent.type) {
      case 'investment':
        if (flowResult?.requiresKyc) {
          if (flowResult.actionRequired === 'authentication') {
            return "🔐 To start investing, I'll need you to sign in first. Would you like me to guide you through the process?";
          }
          return "🔒 **Instant KYC Required**\n\nTo invest, I need to verify your identity first. This takes just 30 seconds:\n\n1. Snap a photo of your ID\n2. Take a quick selfie\n3. You're ready to invest!\n\nShall I start the verification process?";
        }
        
        if (flowResult?.suggestedProperties) {
          const props = flowResult.suggestedProperties;
          return `🚀 **Perfect! Found ${props.length} matches for your ${intent.amount} ${intent.currency} investment:**\n\n${props.map((p: any, i: number) => 
            `${i + 1}. **${p.title}** - ${p.location}\n   💰 ${p.price_per_token} ${intent.currency}/token\n   📍 Min: ${p.min_investment} ${intent.currency}`
          ).join('\n\n')}\n\n**Ready to invest?** Say *"Invest in property 1"* to proceed instantly.`;
        }
        
        return `🤖 **Investment Processing**\n\nLooking for properties matching:\n• Amount: ${intent.amount} ${intent.currency}\n• Location: ${intent.location || 'Any'}\n\nLet me find the perfect matches...`;

      case 'portfolio':
        return "📈 **Your Portfolio Dashboard**\n\nAnalyzing your investments and performance...\n\n*Tip: Try asking 'What's my ROI?' or 'Show gains this month'*";

      case 'discovery':
        return `🔍 **Smart Property Discovery**\n\nSearching for: ${intent.criteria}\n${intent.location ? `📍 Location: ${intent.location}` : ''}\n\nFiltering thousands of properties to find your perfect match...`;

      case 'kyc':
        return "🔒 **Instant KYC Verification**\n\n**What I need:**\n• Government-issued ID (passport/Emirates ID)\n• Clear selfie for verification\n\n**Time:** 30 seconds\n**Security:** Bank-grade encryption\n\nReady to start? Say *'Yes, verify me'*";

      default:
        return "👋 I'm AI TOKO! I can help you:\n\n🚀 **Invest faster**: *'Invest 5000 AED in Dubai'*\n📊 **Track portfolio**: *'Show my investments'*\n🔍 **Find deals**: *'8%+ yield properties'*\n🔒 **Quick KYC**: *'Verify my ID'*\n\nWhat would you like to do?";
    }
  }
}