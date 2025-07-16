export interface BrandingConfig {
  companyName: string;
  shortName: string;
  tagline: string;
  baseUrl: string;
  supportEmail: string;
  legalEmail: string;
  twitterHandle: string;
  defaultMetaDescription: string;
  phone?: string;
  address?: string;
}

// Utility to read environment variables from both browser (Vite) and Node environments
function getEnv(key: string, fallback: string): string {
  // Frontend (Vite) environment: use import.meta.env
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - import.meta is a Vite construct and not part of TS standard libs
  const viteEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;

  if (viteEnv && viteEnv[key] !== undefined) {
    return viteEnv[key] as string;
  }

  // Backend / Node-like environments
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return process.env[key] as string;
  }

  return fallback;
}

const branding: BrandingConfig = {
  companyName: getEnv('VITE_BRAND_COMPANY_NAME', 'Your Company'),
  shortName: getEnv('VITE_BRAND_SHORT_NAME', 'YourCo'),
  tagline: getEnv('VITE_BRAND_TAGLINE', 'A Modern Investment Platform'),
  baseUrl: getEnv('VITE_BRAND_BASE_URL', 'https://yourcompany.com'),
  supportEmail: getEnv('VITE_BRAND_SUPPORT_EMAIL', 'support@yourcompany.com'),
  legalEmail: getEnv('VITE_BRAND_LEGAL_EMAIL', 'legal@yourcompany.com'),
  twitterHandle: getEnv('VITE_BRAND_TWITTER_HANDLE', '@yourcompany'),
  defaultMetaDescription: getEnv(
    'VITE_BRAND_DEFAULT_META_DESCRIPTION',
    'Invest in fractional real estate with Your Company – secure, regulated, and accessible.'
  ),
  phone: getEnv('VITE_BRAND_PHONE', '+1 (555) 555-5555'),
  address: getEnv('VITE_BRAND_ADDRESS', 'City, Country'),
};

export default branding;