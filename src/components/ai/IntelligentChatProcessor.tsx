import React from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InvestmentIntent {
  type: 'investment' | 'portfolio' | 'discovery' | 'kyc' | 'general' | 'register' | 'dashboard' | 'help';
  amount?: number;
  currency?: string;
  location?: string;
  criteria?: string;
  propertyId?: string;
  confidence: number;
  action?: string;
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
    /complete\s+verification/i,
    /start\s+(?:my\s+)?kyc/i
  ];

  private static registerPatterns = [
    /register\s+(?:new\s+)?account/i,
    /sign\s+up/i,
    /create\s+account/i,
    /open\s+account/i,
    /new\s+user/i,
    /get\s+started/i
  ];

  private static dashboardPatterns = [
    /(?:show|open|go\s+to)\s+(?:my\s+)?dashboard/i,
    /main\s+page/i,
    /home\s+page/i,
    /overview/i
  ];

  private static helpPatterns = [
    /help\s+(?:me\s+)?with/i,
    /how\s+(?:do\s+)?i/i,
    /guide\s+me/i,
    /need\s+help/i,
    /assistance/i,
    /support/i
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

    // Check register patterns
    for (const pattern of this.registerPatterns) {
      if (pattern.test(cleanMessage)) {
        return {
          type: 'register',
          confidence: 0.95
        };
      }
    }

    // Check dashboard patterns
    for (const pattern of this.dashboardPatterns) {
      if (pattern.test(cleanMessage)) {
        return {
          type: 'dashboard',
          confidence: 0.9
        };
      }
    }

    // Check help patterns
    for (const pattern of this.helpPatterns) {
      const match = cleanMessage.match(pattern);
      if (match) {
        return {
          type: 'help',
          criteria: cleanMessage,
          confidence: 0.85
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

  static generateSmartResponse(intent: InvestmentIntent, flowResult?: any, navigate?: any): string {
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
        return "🔒 **Opening KYC Verification Page**\n\n✅ **Navigating to Profile → KYC Section**\n\n**What you'll need:**\n• Government-issued ID (passport/Emirates ID)\n• Clear selfie for verification\n\n**Time:** 30 seconds\n**Security:** Bank-grade encryption\n\n🚀 **Page is loading... Get your ID ready!**";

      case 'register':
        return "🎯 **Opening Account Registration**\n\n✅ **Navigating to Sign Up Page**\n\n**Quick setup process:**\n1. Enter your email and create password\n2. Verify email address\n3. Complete basic profile\n4. Start investing!\n\n🚀 **Registration page loading...**";

      case 'dashboard':
        return "📊 **Opening Your Dashboard**\n\n✅ **Navigating to Portfolio Overview**\n\n**You'll see:**\n• Investment performance\n• Property holdings\n• Recent transactions\n• Market insights\n\n🚀 **Dashboard loading...**";

      case 'help':
        return "🆘 **Finding Help Resources**\n\n✅ **Analyzing your request...**\n\n**I can guide you to:**\n• Investor Resources page\n• Step-by-step tutorials\n• Support documentation\n• Relevant help sections\n\n🚀 **Preparing personalized guidance...**";

      default:
        return "🎯 **AI TOKO: Your Navigation Assistant**\n\n**I can guide you anywhere in the app! Try:**\n\n🚀 **Navigation**: *'Open my dashboard'*, *'Go to properties'*\n📋 **Processes**: *'Start KYC'*, *'Register account'*\n💰 **Investing**: *'Find Dubai properties'*, *'Invest 5000 AED'*\n📊 **Portfolio**: *'Show my investments'*, *'Check performance'*\n🆘 **Help**: *'Help me with investing'*, *'Guide me through KYC'*\n\n✨ **Just tell me where you want to go or what you want to do!**";
    }
  }
}