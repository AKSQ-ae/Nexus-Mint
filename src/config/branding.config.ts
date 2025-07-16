/**
 * 🎨 Platform Branding Configuration
 * 
 * This file contains all configurable branding elements for the platform.
 * All values can be overridden via environment variables or admin settings.
 */

export interface BrandingConfig {
  // Company Information
  company: {
    name: string;
    shortName: string;
    legalName: string;
    description: string;
    tagline: string;
  };
  
  // Contact Information
  contact: {
    email: string;
    phone: string;
    address: string;
    supportEmail: string;
    notificationEmail: string;
  };
  
  // Platform Information
  platform: {
    title: string;
    description: string;
    domain: string;
    logo: {
      text: string;
      url?: string;
      favicon?: string;
    };
  };
  
  // Colors and Styling
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  
  // Legal Links
  legal: {
    termsOfService: string;
    privacyPolicy: string;
    riskDisclaimer: string;
    cookiePolicy: string;
  };
  
  // Social and Marketing
  social: {
    website: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    facebook: string;
  };
  
  // Investment Platform Specific
  investment: {
    minimumInvestment: string;
    expectedReturns: string;
    paymentFrequency: string;
    currency: string;
    jurisdiction: string;
  };
}

// Environment variable helpers
const getEnvVar = (key: string, defaultValue: string): string => {
  return typeof window !== 'undefined' 
    ? (window as any).__APP_CONFIG__?.[key] || defaultValue
    : process.env[key] || defaultValue;
};

// Default branding configuration with neutral placeholders
export const defaultBrandingConfig: BrandingConfig = {
  company: {
    name: getEnvVar('VITE_COMPANY_NAME', 'Your Company'),
    shortName: getEnvVar('VITE_COMPANY_SHORT_NAME', 'Investment Platform'),
    legalName: getEnvVar('VITE_COMPANY_LEGAL_NAME', 'Your Company DMCC'),
    description: getEnvVar('VITE_COMPANY_DESCRIPTION', 'Professional real estate investment platform'),
    tagline: getEnvVar('VITE_COMPANY_TAGLINE', 'Smart Real Estate Investment'),
  },
  
  contact: {
    email: getEnvVar('VITE_CONTACT_EMAIL', 'info@yourcompany.com'),
    phone: getEnvVar('VITE_CONTACT_PHONE', '+1-555-0123'),
    address: getEnvVar('VITE_CONTACT_ADDRESS', 'Business Address'),
    supportEmail: getEnvVar('VITE_SUPPORT_EMAIL', 'support@yourcompany.com'),
    notificationEmail: getEnvVar('VITE_NOTIFICATION_EMAIL', 'notifications@yourcompany.com'),
  },
  
  platform: {
    title: getEnvVar('VITE_PLATFORM_TITLE', 'Investment Platform | Professional Real Estate Tokenization'),
    description: getEnvVar('VITE_PLATFORM_DESCRIPTION', 'Professional real estate tokenization platform with regulated compliance'),
    domain: getEnvVar('VITE_PLATFORM_DOMAIN', 'yourcompany.com'),
    logo: {
      text: getEnvVar('VITE_LOGO_TEXT', 'Your Company'),
      url: getEnvVar('VITE_LOGO_URL', '/logo.png'),
      favicon: getEnvVar('VITE_FAVICON_URL', '/favicon.ico'),
    },
  },
  
  theme: {
    primary: getEnvVar('VITE_THEME_PRIMARY', '#3B82F6'),
    secondary: getEnvVar('VITE_THEME_SECONDARY', '#1E40AF'),
    accent: getEnvVar('VITE_THEME_ACCENT', '#10B981'),
    background: getEnvVar('VITE_THEME_BACKGROUND', '#FFFFFF'),
    text: getEnvVar('VITE_THEME_TEXT', '#1F2937'),
  },
  
  legal: {
    termsOfService: getEnvVar('VITE_TERMS_URL', '/legal/terms'),
    privacyPolicy: getEnvVar('VITE_PRIVACY_URL', '/legal/privacy'),
    riskDisclaimer: getEnvVar('VITE_RISK_DISCLAIMER_URL', '/legal/risk-disclosure'),
    cookiePolicy: getEnvVar('VITE_COOKIE_POLICY_URL', '/legal/cookies'),
  },
  
  social: {
    website: getEnvVar('VITE_SOCIAL_WEBSITE', 'https://yourcompany.com'),
    twitter: getEnvVar('VITE_SOCIAL_TWITTER', 'https://twitter.com/yourcompany'),
    linkedin: getEnvVar('VITE_SOCIAL_LINKEDIN', 'https://linkedin.com/company/yourcompany'),
    instagram: getEnvVar('VITE_SOCIAL_INSTAGRAM', 'https://instagram.com/yourcompany'),
    facebook: getEnvVar('VITE_SOCIAL_FACEBOOK', 'https://facebook.com/yourcompany'),
  },
  
  investment: {
    minimumInvestment: getEnvVar('VITE_MIN_INVESTMENT', '500'),
    expectedReturns: getEnvVar('VITE_EXPECTED_RETURNS', '8–12% p.a.'),
    paymentFrequency: getEnvVar('VITE_PAYMENT_FREQUENCY', 'quarterly'),
    currency: getEnvVar('VITE_CURRENCY', 'AED'),
    jurisdiction: getEnvVar('VITE_JURISDICTION', 'UAE'),
  },
};

// Export the configuration
export const brandingConfig = defaultBrandingConfig;

// Helper function to get branding values
export const getBrandingConfig = (): BrandingConfig => {
  return brandingConfig;
};

// Helper functions for common branding elements
export const getCompanyName = (): string => brandingConfig.company.name;
export const getCompanyShortName = (): string => brandingConfig.company.shortName;
export const getPlatformTitle = (): string => brandingConfig.platform.title;
export const getSupportEmail = (): string => brandingConfig.contact.supportEmail;
export const getNotificationEmail = (): string => brandingConfig.contact.notificationEmail;