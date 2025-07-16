/**
 * 🔧 Service Configuration
 * 
 * This file contains all configurable service integrations and provider settings.
 * All values can be overridden via environment variables.
 */

export interface ServiceConfig {
  // Database Configuration
  database: {
    provider: string;
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  
  // Blockchain Configuration
  blockchain: {
    network: string;
    rpcUrl: string;
    privateKey?: string;
    apiKey?: string;
  };
  
  // Payment Service Configuration
  payment: {
    provider: string;
    publicKey: string;
    secretKey?: string;
    webhookSecret?: string;
  };
  
  // KYC Service Configuration
  kyc: {
    provider: string;
    apiKey: string;
    secretKey?: string;
    baseUrl?: string;
  };
  
  // Email Service Configuration
  email: {
    provider: string;
    apiKey?: string;
    fromEmail: string;
    fromName: string;
  };
  
  // File Storage Configuration
  storage: {
    provider: string;
    accessKey?: string;
    secretKey?: string;
    bucketName?: string;
    region?: string;
  };
  
  // Analytics Configuration
  analytics: {
    provider: string;
    googleAnalyticsId?: string;
    hotjarId?: string;
    mixpanelToken?: string;
  };
  
  // AI Service Configuration
  ai: {
    provider: string;
    apiKey?: string;
    model: string;
    baseUrl?: string;
  };
  
  // Security Configuration
  security: {
    sentryDsn?: string;
    recaptchaSiteKey?: string;
    recaptchaSecretKey?: string;
  };
  
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
}

// Environment variable helpers
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return typeof window !== 'undefined' 
    ? (window as any).__APP_CONFIG__?.[key] || defaultValue
    : process.env[key] || defaultValue;
};

const getEnvVarNumber = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key, defaultValue.toString());
  return parseInt(value, 10) || defaultValue;
};

// Default service configuration
export const defaultServiceConfig: ServiceConfig = {
  database: {
    provider: getEnvVar('VITE_DATABASE_PROVIDER', 'supabase'),
    url: getEnvVar('SUPABASE_URL', 'https://your-project.supabase.co'),
    anonKey: getEnvVar('SUPABASE_ANON_KEY', 'your-anon-key'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  },
  
  blockchain: {
    network: getEnvVar('VITE_BLOCKCHAIN_NETWORK', 'polygon-mumbai'),
    rpcUrl: getEnvVar('VITE_RPC_URL', 'https://polygon-mumbai.g.alchemy.com/v2/your-api-key'),
    privateKey: getEnvVar('TESTNET_PRIVATE_KEY'),
    apiKey: getEnvVar('POLYGON_API_KEY'),
  },
  
  payment: {
    provider: getEnvVar('VITE_PAYMENT_PROVIDER', 'stripe'),
    publicKey: getEnvVar('VITE_STRIPE_PUBLIC_KEY', 'pk_test_your-stripe-key'),
    secretKey: getEnvVar('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET'),
  },
  
  kyc: {
    provider: getEnvVar('VITE_KYC_PROVIDER', 'jumio'),
    apiKey: getEnvVar('VITE_KYC_API_KEY', 'your-kyc-api-key'),
    secretKey: getEnvVar('KYC_API_SECRET'),
    baseUrl: getEnvVar('VITE_KYC_BASE_URL', 'https://netverify.com/api/v4'),
  },
  
  email: {
    provider: getEnvVar('VITE_EMAIL_PROVIDER', 'sendgrid'),
    apiKey: getEnvVar('SENDGRID_API_KEY'),
    fromEmail: getEnvVar('SENDGRID_FROM_EMAIL', 'notifications@yourcompany.com'),
    fromName: getEnvVar('VITE_COMPANY_NAME', 'Your Company'),
  },
  
  storage: {
    provider: getEnvVar('VITE_STORAGE_PROVIDER', 'supabase'),
    accessKey: getEnvVar('AWS_ACCESS_KEY_ID'),
    secretKey: getEnvVar('AWS_SECRET_ACCESS_KEY'),
    bucketName: getEnvVar('AWS_BUCKET_NAME'),
    region: getEnvVar('AWS_REGION', 'us-east-1'),
  },
  
  analytics: {
    provider: getEnvVar('VITE_ANALYTICS_PROVIDER', 'google'),
    googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
    hotjarId: getEnvVar('VITE_HOTJAR_ID'),
    mixpanelToken: getEnvVar('VITE_MIXPANEL_TOKEN'),
  },
  
  ai: {
    provider: getEnvVar('VITE_AI_PROVIDER', 'openai'),
    apiKey: getEnvVar('OPENAI_API_KEY'),
    model: getEnvVar('VITE_AI_MODEL', 'gpt-4'),
    baseUrl: getEnvVar('VITE_AI_BASE_URL', 'https://api.openai.com/v1'),
  },
  
  security: {
    sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
    recaptchaSiteKey: getEnvVar('VITE_RECAPTCHA_SITE_KEY'),
    recaptchaSecretKey: getEnvVar('RECAPTCHA_SECRET_KEY'),
  },
  
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000'),
    timeout: getEnvVarNumber('VITE_API_TIMEOUT', 10000),
    retryAttempts: getEnvVarNumber('VITE_API_RETRY_ATTEMPTS', 3),
  },
};

// Export the configuration
export const serviceConfig = defaultServiceConfig;

// Helper function to get service configuration
export const getServiceConfig = (): ServiceConfig => {
  return serviceConfig;
};

// Helper functions for common service configurations
export const getDatabaseConfig = () => serviceConfig.database;
export const getBlockchainConfig = () => serviceConfig.blockchain;
export const getPaymentConfig = () => serviceConfig.payment;
export const getKycConfig = () => serviceConfig.kyc;
export const getEmailConfig = () => serviceConfig.email;
export const getStorageConfig = () => serviceConfig.storage;
export const getAnalyticsConfig = () => serviceConfig.analytics;
export const getAiConfig = () => serviceConfig.ai;
export const getSecurityConfig = () => serviceConfig.security;
export const getApiConfig = () => serviceConfig.api;

// Service availability checks
export const isServiceAvailable = (service: keyof ServiceConfig): boolean => {
  const config = serviceConfig[service];
  if (!config) return false;
  
  // Check if essential keys are present for each service
  switch (service) {
    case 'database':
      return !!(config as any).url && !!(config as any).anonKey;
    case 'payment':
      return !!(config as any).publicKey;
    case 'kyc':
      return !!(config as any).apiKey;
    case 'email':
      return !!(config as any).fromEmail;
    case 'ai':
      return !!(config as any).apiKey;
    default:
      return true;
  }
};

// Get placeholder message for unavailable services
export const getServicePlaceholder = (service: string): string => {
  return `⚠️ ${service} service configuration pending. Please configure environment variables.`;
};