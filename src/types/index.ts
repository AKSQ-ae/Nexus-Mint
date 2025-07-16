// 🏗️ Nexus Mint - Enterprise TypeScript Types
// This file defines all the core types to eliminate 'any' usage

// ========================
// 🏠 PROPERTY TYPES
// ========================

export interface Property {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  price: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  images?: string[] | null;
  amenities?: string[] | null;
  tokenization_active: boolean;
  tokens_issued?: number | null;
  total_tokens?: number | null;
  price_per_token?: number | null;
  created_at: string;
  updated_at?: string | null;
  status: 'active' | 'pending' | 'sold' | 'inactive';
  roi_estimate: number;
  rental_yield: number;
  property_type?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  is_featured?: boolean;
}

export interface PropertyToken {
  id: string;
  property_id: string;
  token_address: string;
  symbol: string;
  decimals: number;
  total_supply: number;
  circulating_supply: number;
  price_usd: number;
  created_at: string;
}

// ========================
// 💼 INVESTMENT TYPES
// ========================

export interface Investment {
  id: string;
  user_id: string;
  property_id: string;
  token_amount: number;
  investment_amount: number;
  currency: 'USD' | 'AED' | 'ETH';
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentData {
  property: Property;
  investment: Investment;
  user: UserProfile;
  payment_method: PaymentMethod;
}

// ========================
// 👤 USER TYPES
// ========================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  country: string;
  kyc_status: 'pending' | 'approved' | 'rejected';
  kyc_documents: KYCDocument[];
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: 'passport' | 'license' | 'utility_bill' | 'bank_statement';
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
}

// ========================
// 💳 PAYMENT TYPES
// ========================

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'bank_transfer' | 'crypto' | 'wallet';
  provider: 'stripe' | 'metamask' | 'walletconnect' | 'bank';
  details: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  investment_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  provider_transaction_id?: string;
  blockchain_hash?: string;
  created_at: string;
}

// ========================
// 🔗 BLOCKCHAIN TYPES
// ========================

export interface BlockchainTransaction {
  hash: string;
  block_number: number;
  from_address: string;
  to_address: string;
  value: string;
  gas_used: number;
  gas_price: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
}

export interface ContractData {
  address: string;
  abi: Record<string, unknown>[];
  bytecode: string;
  network: 'mainnet' | 'polygon' | 'testnet';
  deployed_at: string;
}

// ========================
// 📊 ANALYTICS TYPES
// ========================

export interface AnalyticsData {
  user_metrics: {
    total_users: number;
    active_users: number;
    new_signups: number;
    kyc_approved: number;
  };
  investment_metrics: {
    total_investments: number;
    total_value: number;
    average_investment: number;
    success_rate: number;
  };
  property_metrics: {
    total_properties: number;
    tokenized_properties: number;
    average_roi: number;
    total_tokens_issued: number;
  };
  time_range: {
    start_date: string;
    end_date: string;
  };
}

// ========================
// 🤖 AI TYPES
// ========================

export interface AIInteraction {
  id: string;
  user_id: string;
  message: string;
  response: string;
  intent: 'investment_advice' | 'property_inquiry' | 'general_support';
  confidence: number;
  created_at: string;
}

export interface AIRecommendation {
  property_id: string;
  score: number;
  reasoning: string;
  risk_level: 'low' | 'medium' | 'high';
  recommended_amount: number;
}

// ========================
// 📱 UI TYPES
// ========================

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface FormData {
  [key: string]: string | number | boolean | File | unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ========================
// 📋 FORM TYPES
// ========================

export interface InvestmentFormData {
  property_id: string;
  investment_amount: number;
  payment_method_id: string;
  terms_accepted: boolean;
  risk_acknowledged: boolean;
}

export interface KYCFormData {
  full_name: string;
  date_of_birth: string;
  nationality: string;
  address: string;
  phone: string;
  documents: File[];
}

// ========================
// 🔄 STATE TYPES
// ========================

export interface AppState {
  user: UserProfile | null;
  properties: Property[];
  investments: Investment[];
  notifications: NotificationData[];
  loading: boolean;
  error: string | null;
}

// ========================
// 🎯 EVENT TYPES
// ========================

export interface EventData {
  event_name: string;
  event_properties: Record<string, unknown>;
  user_id?: string;
  timestamp: string;
}

export interface ErrorData {
  message: string;
  stack?: string;
  user_id?: string;
  url?: string;
  timestamp: string;
}

// ========================
// 🔧 UTILITY TYPES
// ========================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortDirection = 'asc' | 'desc';

export type FilterOptions = {
  property_type?: string;
  price_range?: [number, number];
  location?: string;
  roi_range?: [number, number];
};

// ========================
// 📡 API TYPES
// ========================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ========================
// 🎨 COMPONENT TYPES
// ========================

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface InputProps extends ComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
}

// ========================
// 🌐 EXPORTS
// ========================

// All types are exported individually above