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
    // Execute navigation actions immediately based on intent
    this.executeNavigation(intent, flowResult, navigate);
    
    switch (intent.type) {
      case 'investment':
        if (flowResult?.requiresKyc) {
          if (flowResult.actionRequired === 'authentication') {
            return "🔐 **Navigating to Sign In...**\n\nOpening login page so you can start investing!";
          }
          return "🔒 **Opening KYC Verification**\n\n✅ **Navigated to Profile → KYC**\n\nReady to verify? Just:\n1. 📸 Snap your ID photo\n2. 🤳 Take a selfie\n3. ✨ Start investing!\n\n**Upload area is ready for your documents.**";
        }
        
        if (flowResult?.suggestedProperties) {
          const props = flowResult.suggestedProperties;
          return `🚀 **Opening Property Matches**\n\n✅ **Navigated to Properties Page**\n\nShowing ${props.length} perfect matches for ${intent.amount} ${intent.currency}:\n\n${props.map((p: any, i: number) => 
            `${i + 1}. **${p.title}** - ${p.location}\n   💰 ${p.price_per_token} ${intent.currency}/token`
          ).join('\n\n')}\n\n**Click any property to invest instantly!**`;
        }
        
        return `🔍 **Opening Property Search**\n\n✅ **Navigated to Properties**\n\nFiltering for:\n• Budget: ${intent.amount} ${intent.currency}\n• Location: ${intent.location || 'All Dubai'}\n\n**Perfect matches loading...**`;

      case 'portfolio':
        return "📊 **Opening Your Dashboard**\n\n✅ **Navigated to Portfolio**\n\nYour investment overview is now displayed:\n• Current holdings\n• Performance metrics\n• Recent activity\n• Growth trends";

      case 'discovery':
        return `🔍 **Opening Property Discovery**\n\n✅ **Navigated to Properties**\n\nSearching: ${intent.criteria}\n${intent.location ? `📍 Location: ${intent.location}` : ''}\n\n**Advanced filters applied, showing best matches!**`;

      case 'kyc':
        return "🔒 **Opening KYC Center**\n\n✅ **Navigated to Profile → KYC**\n\n**Ready to verify:**\n• 📸 Document camera active\n• 🔐 Secure upload ready\n• ⚡ 30-second verification\n\n**Start by uploading your ID!**";

      case 'register':
        return "🎯 **Opening Registration**\n\n✅ **Navigated to Sign Up**\n\n**Quick setup form ready:**\n• Email & password fields active\n• Terms & conditions available\n• Instant email verification\n\n**Start typing your email to begin!**";

      case 'dashboard':
        return "📊 **Opening Dashboard**\n\n✅ **Navigated to Overview**\n\n**Your command center is ready:**\n• Portfolio performance visible\n• Recent transactions loaded\n• Market insights updated\n• Quick action buttons active";

      case 'help':
        return "🆘 **Opening Help Center**\n\n✅ **Navigated to Resources**\n\n**Finding relevant guides:**\n• Investment tutorials\n• Platform documentation\n• Video walkthroughs\n• Live support options\n\n**Browse or ask me anything specific!**";

      default:
        return "🎯 **AI TOKO: One Chat to Rule Them All**\n\n**I control the entire platform! Try:**\n\n🚀 **Instant Actions**:\n• *\"Open my dashboard\"* → Portfolio loads\n• *\"Start KYC\"* → Verification opens\n• *\"Find Dubai properties\"* → Search loads\n• *\"Invest 5000 AED\"* → Investment flow starts\n\n📱 **I'll navigate, open pages, and guide you through everything!**";
    }
  }

  static executeNavigation(intent: InvestmentIntent, flowResult?: any, navigate?: any): void {
    if (!navigate) return;

    switch (intent.type) {
      case 'investment':
        if (flowResult?.requiresKyc) {
          if (flowResult.actionRequired === 'authentication') {
            navigate('/auth/signin');
          } else {
            navigate('/profile');
          }
        } else {
          navigate('/properties');
        }
        break;
      
      case 'portfolio':
        navigate('/dashboard');
        break;
      
      case 'discovery':
        navigate('/properties');
        break;
      
      case 'kyc':
        navigate('/profile');
        break;
      
      case 'register':
        navigate('/auth/signup');
        break;
      
      case 'dashboard':
        navigate('/dashboard');
        break;
      
      case 'help':
        navigate('/investor-resources');
        break;
    }
  }
}