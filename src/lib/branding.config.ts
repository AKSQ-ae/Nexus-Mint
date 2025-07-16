// Branding Configuration - Customize platform appearance and content
export const BRANDING_CONFIG = {
  // Platform Identity
  platformName: process.env.PLATFORM_NAME || "Investment Platform",
  companyName: process.env.COMPANY_NAME || "Your Company",
  
  // Contact Information
  supportEmail: process.env.SUPPORT_EMAIL || "support@platform.com",
  contactPhone: process.env.CONTACT_PHONE || "+1 (555) 123-4567",
  
  // Legal Links (configurable URLs)
  legal: {
    termsOfService: process.env.TERMS_URL || "/legal/terms",
    privacyPolicy: process.env.PRIVACY_URL || "/legal/privacy", 
    riskDisclaimer: process.env.RISK_DISCLAIMER_URL || "/legal/risk-disclaimer"
  },
  
  // AI Assistant Configuration
  aiAssistant: {
    name: process.env.AI_ASSISTANT_NAME || "TOKO AI Advisor",
    description: process.env.AI_ASSISTANT_DESCRIPTION || "Your AI investment assistant"
  },
  
  // Platform Features
  features: {
    kycIntegration: process.env.KYC_INTEGRATION_STATUS || "Coming Soon",
    liveChat: process.env.LIVE_CHAT_STATUS || "Live Beta Now Available"
  },
  
  // Styling (can be extended for theme customization)
  theme: {
    primaryColor: process.env.PRIMARY_COLOR || "hsl(var(--primary))",
    logoUrl: process.env.LOGO_URL || "/nexus-logo.png"
  }
};