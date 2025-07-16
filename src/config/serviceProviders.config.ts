export interface ServiceProviderConfig {
  kycProvider: string;
  paymentProvider: string;
  storageProvider: string;
  kycApiKey?: string;
  paymentApiKey?: string;
  storageBucket?: string;
}

function env(key: string, fallback: string): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const viteEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  if (viteEnv && viteEnv[key] !== undefined) return viteEnv[key] as string;
  if (typeof process !== 'undefined' && process.env[key] !== undefined) return process.env[key] as string;
  return fallback;
}

const serviceProviders: ServiceProviderConfig = {
  kycProvider: env('VITE_KYC_PROVIDER', 'onfido'),
  paymentProvider: env('VITE_PAYMENT_PROVIDER', 'stripe'),
  storageProvider: env('VITE_STORAGE_PROVIDER', 'supabase'),
  kycApiKey: env('VITE_KYC_API_KEY', ''),
  paymentApiKey: env('VITE_PAYMENT_API_KEY', ''),
  storageBucket: env('VITE_STORAGE_BUCKET', ''),
};

export default serviceProviders;