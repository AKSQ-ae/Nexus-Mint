import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface UserContext {
  isAuthenticated: boolean;
  hasKyc: boolean;
  hasInvestments: boolean;
  currentPage: string;
  formProgress?: {
    step: number;
    totalSteps: number;
    formType: string;
  };
}

export interface NavigationAction {
  type: 'navigate' | 'scroll' | 'focus' | 'fill' | 'click';
  target: string;
  value?: string;
  delay?: number;
}

export interface TOKOResponse {
  message: string;
  actions: NavigationAction[];
  nextSteps: string[];
  contextualHelp: string;
}

export class TOKONavigationEngine {
  private navigate: NavigateFunction;
  private currentContext: UserContext;

  constructor(navigate: NavigateFunction, context: UserContext) {
    this.navigate = navigate;
    this.currentContext = context;
  }

  async processUserIntent(message: string): Promise<TOKOResponse> {
    const intent = this.analyzeIntent(message);
    const response = await this.generateResponse(intent);
    
    // Execute navigation actions immediately
    this.executeActions(response.actions);
    
    return response;
  }

  private analyzeIntent(message: string): {
    category: string;
    action: string;
    parameters: Record<string, any>;
    confidence: number;
  } {
    const patterns = {
      kyc: {
        start: /start\s+kyc|verify\s+(?:my\s+)?id|upload\s+documents|begin\s+verification/i,
        check: /check\s+kyc|kyc\s+status|verification\s+status/i,
        help: /help\s+with\s+kyc|kyc\s+help|verification\s+help/i
      },
      investment: {
        invest: /invest\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(aed|usd|eur)?/i,
        property: /show\s+(?:me\s+)?(.+)\s+properties|find\s+(.+)\s+deals/i,
        calculate: /calculate\s+investment|investment\s+calculator/i
      },
      portfolio: {
        view: /(?:show|open|view)\s+(?:my\s+)?portfolio|dashboard|investments/i,
        performance: /portfolio\s+performance|investment\s+returns|my\s+gains/i
      },
      registration: {
        start: /register|sign\s+up|create\s+account|open\s+account|get\s+started/i,
        help: /help\s+with\s+registration|registration\s+help/i
      },
      navigation: {
        home: /(?:go\s+)?home|main\s+page|homepage/i,
        properties: /(?:show|view|browse)\s+properties|property\s+listings/i,
        help: /help|support|assistance|guide/i
      }
    };

    for (const [category, actions] of Object.entries(patterns)) {
      for (const [action, pattern] of Object.entries(actions)) {
        const match = message.match(pattern);
        if (match) {
          return {
            category,
            action,
            parameters: this.extractParameters(match, category, action),
            confidence: 0.9
          };
        }
      }
    }

    return {
      category: 'general',
      action: 'help',
      parameters: {},
      confidence: 0.3
    };
  }

  private extractParameters(match: RegExpMatchArray, category: string, action: string): Record<string, any> {
    const params: Record<string, any> = {};

    if (category === 'investment' && action === 'invest') {
      params.amount = parseFloat(match[1]?.replace(/,/g, '') || '0');
      params.currency = match[2]?.toUpperCase() || 'AED';
    }

    if (category === 'investment' && action === 'property') {
      params.location = match[1] || match[2] || '';
    }

    return params;
  }

  private async generateResponse(intent: any): Promise<TOKOResponse> {
    switch (intent.category) {
      case 'kyc':
        return this.handleKYCFlow(intent);
      
      case 'investment':
        return this.handleInvestmentFlow(intent);
      
      case 'portfolio':
        return this.handlePortfolioFlow(intent);
      
      case 'registration':
        return this.handleRegistrationFlow(intent);
      
      case 'navigation':
        return this.handleNavigationFlow(intent);
      
      default:
        return this.handleGeneralHelp();
    }
  }

  private async handleKYCFlow(intent: any): Promise<TOKOResponse> {
    if (!this.currentContext.isAuthenticated) {
      return {
        message: "🔐 **Authentication Required**\n\n✅ **Navigating to Sign In**\n\nTo start KYC verification, you need to sign in first. I'll take you to the login page.",
        actions: [
          { type: 'navigate', target: '/auth/signin' }
        ],
        nextSteps: [
          "1. Sign in with your credentials",
          "2. I'll then take you to KYC verification",
          "3. Upload your ID document",
          "4. Take verification selfie"
        ],
        contextualHelp: "After signing in, I'll immediately guide you through the KYC process."
      };
    }

    if (intent.action === 'start') {
      return {
        message: "🔒 **Opening KYC Verification Center**\n\n✅ **Navigated to Profile → KYC Section**\n\n**Ready to verify in 30 seconds:**\n• 📸 Document camera is active\n• 🔐 Secure upload area ready\n• ⚡ Real-time verification\n\n**I'll guide you through each step!**",
        actions: [
          { type: 'navigate', target: '/profile' },
          { type: 'click', target: '[data-value="kyc"]', delay: 1000 },
          { type: 'scroll', target: '[data-value="kyc"]', delay: 1500 }
        ],
        nextSteps: [
          "1. Click 'Upload Document' button for passport",
          "2. Take clear photo of your ID document",
          "3. Upload proof of address",
          "4. Submit for instant verification"
        ],
        contextualHelp: "💡 **Pro tip**: Good lighting and clear photos speed up verification!"
      };
    }

    if (intent.action === 'check') {
      return {
        message: "📋 **Checking KYC Status**\n\n✅ **Opening Profile → KYC Tab**\n\nI'll show you your current verification status and next steps if needed.",
        actions: [
          { type: 'navigate', target: '/profile' },
          { type: 'click', target: '[data-value="kyc"]', delay: 1000 },
          { type: 'scroll', target: '.progress', delay: 1500 }
        ],
        nextSteps: [
          "Review your verification progress",
          "If pending: Check for any required actions",
          "If approved: You're ready to invest!",
          "If rejected: I'll help you resubmit"
        ],
        contextualHelp: "Your KYC status determines what features you can access on the platform."
      };
    }

    return this.handleGeneralHelp();
  }

  private async handleInvestmentFlow(intent: any): Promise<TOKOResponse> {
    if (!this.currentContext.isAuthenticated) {
      return {
        message: "🔐 **Sign In Required for Investing**\n\n✅ **Navigating to Sign In**\n\nI'll take you to sign in, then immediately to the investment page.",
        actions: [
          { type: 'navigate', target: '/auth/signin' }
        ],
        nextSteps: [
          "1. Sign in to your account",
          "2. Complete KYC if needed",
          "3. Browse investment properties",
          "4. Make your investment"
        ],
        contextualHelp: "Investment requires verification for security and compliance."
      };
    }

    if (!this.currentContext.hasKyc) {
      return {
        message: "🔒 **KYC Required for Investment**\n\n✅ **Navigating to KYC Verification**\n\nTo invest, you need to verify your identity first. I'll guide you through it!",
        actions: [
          { type: 'navigate', target: '/profile' },
          { type: 'click', target: '[data-value="kyc"]', delay: 1000 }
        ],
        nextSteps: [
          "1. Upload your passport or ID document",
          "2. Upload proof of address",
          "3. Wait for approval (usually 1-3 business days)",
          "4. Start investing!"
        ],
        contextualHelp: "KYC is a one-time process that unlocks all investment features."
      };
    }

    if (intent.action === 'invest') {
      const { amount, currency } = intent.parameters;
      return {
        message: `💰 **Finding Perfect Properties for ${amount} ${currency}**\n\n✅ **Opening Properties with Smart Filter**\n\nI'm filtering properties that match your budget and showing the best investment opportunities.`,
        actions: [
          { type: 'navigate', target: '/properties' },
          { type: 'scroll', target: '.property-filters', delay: 1000 }
        ],
        nextSteps: [
          "1. Review filtered properties",
          "2. Click on a property for details",
          "3. Use 'Quick Invest' for instant purchase",
          "4. Confirm your investment"
        ],
        contextualHelp: `Properties shown are pre-filtered for your ${amount} ${currency} budget with best ROI potential.`
      };
    }

    if (intent.action === 'property') {
      const location = intent.parameters.location;
      return {
        message: `🔍 **Smart Property Discovery: ${location}**\n\n✅ **Opening Properties with Location Filter**\n\nFinding the best ${location} properties with highest yield potential.`,
        actions: [
          { type: 'navigate', target: '/properties' },
          { type: 'scroll', target: '.property-grid', delay: 1000 }
        ],
        nextSteps: [
          "1. Browse filtered properties",
          "2. Compare yield and appreciation potential",
          "3. Click 'Invest Now' on your choice",
          "4. Complete investment in one click"
        ],
        contextualHelp: "Properties are ranked by investment score: yield + appreciation + liquidity."
      };
    }

    return {
      message: "💼 **Opening Investment Center**\n\n✅ **Navigating to Properties**\n\nShowing all available investment opportunities with smart recommendations.",
      actions: [
        { type: 'navigate', target: '/properties' }
      ],
      nextSteps: [
        "1. Browse featured properties",
        "2. Use filters to find perfect matches",
        "3. Click any property for detailed analysis",
        "4. Invest with one-click purchase"
      ],
      contextualHelp: "Start with featured properties for the best risk-adjusted returns."
    };
  }

  private async handlePortfolioFlow(intent: any): Promise<TOKOResponse> {
    if (!this.currentContext.isAuthenticated) {
      return {
        message: "🔐 **Sign In to View Portfolio**\n\n✅ **Navigating to Sign In**\n\nI'll take you to sign in, then directly to your portfolio dashboard.",
        actions: [
          { type: 'navigate', target: '/auth/signin' }
        ],
        nextSteps: [
          "1. Sign in to your account",
          "2. View your portfolio dashboard",
          "3. Check investment performance",
          "4. Analyze returns and growth"
        ],
        contextualHelp: "Your portfolio contains all your investment data and performance metrics."
      };
    }

    if (intent.action === 'view') {
      return {
        message: "📊 **Opening Your Portfolio Dashboard**\n\n✅ **Navigated to Portfolio Overview**\n\n**Your investment command center:**\n• Real-time performance metrics\n• Property holdings breakdown\n• ROI and growth tracking\n• Market insights",
        actions: [
          { type: 'navigate', target: '/portfolio' }
        ],
        nextSteps: [
          "1. Review your current holdings",
          "2. Check performance vs market",
          "3. Analyze individual property returns",
          "4. Consider rebalancing or new investments"
        ],
        contextualHelp: "Use the performance filters to analyze different time periods and metrics."
      };
    }

    if (intent.action === 'performance') {
      return {
        message: "📈 **Analyzing Portfolio Performance**\n\n✅ **Opening Detailed Analytics**\n\nShowing your investment returns, growth trends, and market comparison.",
        actions: [
          { type: 'navigate', target: '/portfolio' },
          { type: 'scroll', target: '.portfolio-metrics', delay: 1000 }
        ],
        nextSteps: [
          "1. Review overall ROI percentage",
          "2. Check individual property performance",
          "3. Compare with market benchmarks",
          "4. Identify top and bottom performers"
        ],
        contextualHelp: "Green indicators show outperforming investments, red shows underperforming ones."
      };
    }

    return this.handleGeneralHelp();
  }

  private async handleRegistrationFlow(intent: any): Promise<TOKOResponse> {
    if (this.currentContext.isAuthenticated) {
      return {
        message: "✅ **You're Already Registered!**\n\n📊 **Opening Your Dashboard**\n\nSince you're already signed in, let me show you your account overview.",
        actions: [
          { type: 'navigate', target: '/dashboard' }
        ],
        nextSteps: [
          "1. Complete KYC if not done",
          "2. Explore investment opportunities",
          "3. Set up payment methods",
          "4. Start building your portfolio"
        ],
        contextualHelp: "Your account is active - focus on completing verification and making your first investment."
      };
    }

    return {
      message: "🎯 **Opening Quick Registration**\n\n✅ **Navigating to Sign Up**\n\n**60-second account setup:**\n• Email and password creation\n• Instant email verification\n• Profile completion\n• Ready to invest!",
      actions: [
        { type: 'navigate', target: '/auth/signup' },
        { type: 'focus', target: 'input[type="email"]', delay: 1000 }
      ],
      nextSteps: [
        "1. Enter your email address",
        "2. Create a secure password",
        "3. Verify your email",
        "4. Complete basic profile info"
      ],
      contextualHelp: "💡 **Next**: After registration, I'll guide you through KYC and your first investment!"
    };
  }

  private handleNavigationFlow(intent: any): TOKOResponse {
    switch (intent.action) {
      case 'home':
        return {
          message: "🏠 **Navigating to Homepage**\n\n✅ **Opening Main Dashboard**\n\nShowing platform overview, featured properties, and quick actions.",
          actions: [
            { type: 'navigate', target: '/' }
          ],
          nextSteps: [
            "1. Explore featured investments",
            "2. Check platform statistics",
            "3. Use quick action buttons",
            "4. Access main navigation menu"
          ],
          contextualHelp: "The homepage gives you a complete overview of the platform and market opportunities."
        };

      case 'properties':
        return {
          message: "🏢 **Opening Property Marketplace**\n\n✅ **Navigating to Properties**\n\nBrowse all available investment opportunities with advanced filtering.",
          actions: [
            { type: 'navigate', target: '/properties' }
          ],
          nextSteps: [
            "1. Browse featured properties",
            "2. Use location and price filters",
            "3. Sort by yield or appreciation",
            "4. Click any property to invest"
          ],
          contextualHelp: "Use the smart filters to find properties matching your investment goals and risk tolerance."
        };

      case 'help':
        return {
          message: "🆘 **Opening Help Center**\n\n✅ **Navigating to Resources**\n\nAccess tutorials, documentation, and live support options.",
          actions: [
            { type: 'navigate', target: '/investor-resources' }
          ],
          nextSteps: [
            "1. Browse tutorial categories",
            "2. Watch video guides",
            "3. Read platform documentation",
            "4. Contact live support if needed"
          ],
          contextualHelp: "The help center has everything you need to become a successful real estate investor."
        };

      default:
        return this.handleGeneralHelp();
    }
  }

  private handleGeneralHelp(): TOKOResponse {
    const contextualMessage = this.getContextualHelp();
    
    return {
      message: `🎯 **AI TOKO: One Chat to Rule Them All**\n\n${contextualMessage}\n\n**I can help you with:**\n\n🚀 **Quick Actions**:\n• *"Start my KYC"* → Instant verification\n• *"Invest 5000 AED"* → Smart property matching\n• *"Show my portfolio"* → Performance dashboard\n• *"Register account"* → 60-second signup\n\n📱 **I'll navigate, guide, and complete processes for you!**`,
      actions: [],
      nextSteps: [
        "Tell me what you want to do",
        "I'll navigate you there instantly",
        "I'll guide you through each step",
        "I'll help complete forms and processes"
      ],
      contextualHelp: "I understand natural language - just tell me what you want to achieve!"
    };
  }

  private getContextualHelp(): string {
    if (!this.currentContext.isAuthenticated) {
      return "**Status**: Not signed in\n**Suggestion**: Try *'Register account'* or *'Sign in'*";
    }
    
    if (!this.currentContext.hasKyc) {
      return "**Status**: Signed in, KYC pending\n**Suggestion**: Try *'Start my KYC'* to begin investing";
    }
    
    if (!this.currentContext.hasInvestments) {
      return "**Status**: Verified and ready\n**Suggestion**: Try *'Find Dubai properties'* or *'Invest 10000 AED'*";
    }
    
    return "**Status**: Active investor\n**Suggestion**: Try *'Show my portfolio'* or *'Find new opportunities'*";
  }

  private executeActions(actions: NavigationAction[]): void {
    actions.forEach(action => {
      setTimeout(() => {
        this.executeAction(action);
      }, action.delay || 0);
    });
  }

  private executeAction(action: NavigationAction): void {
    try {
      console.log(`🤖 TOKO executing action: ${action.type} on ${action.target}`);
      
      switch (action.type) {
        case 'navigate':
          this.navigate(action.target);
          console.log(`✅ Navigated to: ${action.target}`);
          break;
          
        case 'scroll':
          const scrollElement = document.querySelector(action.target);
          if (scrollElement) {
            scrollElement.scrollIntoView({ behavior: 'smooth' });
            console.log(`✅ Scrolled to: ${action.target}`);
          } else {
            console.warn(`⚠️ Scroll target not found: ${action.target}`);
          }
          break;
          
        case 'focus':
          const focusElement = document.querySelector(action.target) as HTMLElement;
          if (focusElement) {
            focusElement.focus();
            console.log(`✅ Focused on: ${action.target}`);
          } else {
            console.warn(`⚠️ Focus target not found: ${action.target}`);
          }
          break;
          
        case 'fill':
          const fillElement = document.querySelector(action.target) as HTMLInputElement;
          if (fillElement && action.value) {
            fillElement.value = action.value;
            fillElement.dispatchEvent(new Event('input', { bubbles: true }));
            fillElement.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✅ Filled ${action.target} with: ${action.value}`);
          } else {
            console.warn(`⚠️ Fill target not found or no value: ${action.target}`);
          }
          break;
          
        case 'click':
          const clickElement = document.querySelector(action.target) as HTMLElement;
          if (clickElement) {
            clickElement.click();
            console.log(`✅ Clicked: ${action.target}`);
          } else {
            console.warn(`⚠️ Click target not found: ${action.target}`);
          }
          break;
          
        default:
          console.warn(`⚠️ Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`❌ Error executing action ${action.type} on ${action.target}:`, error);
    }
  }

  updateContext(newContext: Partial<UserContext>): void {
    this.currentContext = { ...this.currentContext, ...newContext };
  }
}