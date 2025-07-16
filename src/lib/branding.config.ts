// Centralized branding and contact configuration
// All values should be updated via environment variables, CMS, or admin dashboard in production

export const brandingConfig = {
  appName: process.env.REACT_APP_BRAND_NAME || 'Your Company',
  tagline: process.env.REACT_APP_BRAND_TAGLINE || 'Your trusted investment platform.',
  description: process.env.REACT_APP_BRAND_DESCRIPTION || 'Revolutionizing investment through technology. Own, Earn, Multiply.',
  contact: {
    email: process.env.REACT_APP_CONTACT_EMAIL || 'contact@yourcompany.com',
    phone: process.env.REACT_APP_CONTACT_PHONE || '+1 (555) 000-0000',
    address: process.env.REACT_APP_CONTACT_ADDRESS || 'Your City, Country',
  },
  legal: {
    termsUrl: process.env.REACT_APP_TERMS_URL || '/legal/terms',
    privacyUrl: process.env.REACT_APP_PRIVACY_URL || '/legal/privacy',
    riskDisclaimerUrl: process.env.REACT_APP_RISK_URL || '/legal/risk-disclaimer',
  },
  copyright: process.env.REACT_APP_COPYRIGHT || `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
};