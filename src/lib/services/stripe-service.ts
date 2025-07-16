// Stripe Payment Integration for Nexus Mint Tokenisation
// This service handles Stripe payment processing for token purchases

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  client_secret: string;
  created: number;
  payment_method_types: string[];
  metadata: Record<string, string>;
}

export interface StripePaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'sepa_debit';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details?: {
    name: string;
    email: string;
    address?: {
      country: string;
      state: string;
      city: string;
      line1: string;
      line2?: string;
      postal_code: string;
    };
  };
}

export interface StripePaymentRequest {
  amount: number;
  currency: string;
  payment_method_types: string[];
  metadata: {
    assetId: string;
    userId: string;
    sessionId: string;
  };
  description?: string;
  receipt_email?: string;
}

export interface StripePaymentResponse {
  success: boolean;
  paymentIntent?: StripePaymentIntent;
  error?: {
    code: string;
    message: string;
    type: string;
  };
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

// Mock Stripe service for development
// In production, this would integrate with the actual Stripe API
export class StripeService {
  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock_secret';
  }

  async createPaymentIntent(request: StripePaymentRequest): Promise<StripePaymentResponse> {
    try {
      // In production, this would make a real API call to Stripe
      console.log('Creating Stripe payment intent:', request);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful payment intent
      const paymentIntent: StripePaymentIntent = {
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        amount: request.amount,
        currency: request.currency,
        status: 'requires_payment_method',
        client_secret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
        created: Math.floor(Date.now() / 1000),
        payment_method_types: request.payment_method_types,
        metadata: request.metadata
      };

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      return {
        success: false,
        error: {
          code: 'payment_intent_creation_failed',
          message: 'Failed to create payment intent',
          type: 'api_error'
        }
      };
    }
  }

  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<StripePaymentResponse> {
    try {
      console.log('Confirming Stripe payment intent:', { paymentIntentId, paymentMethodId });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful confirmation
      const paymentIntent: StripePaymentIntent = {
        id: paymentIntentId,
        amount: 10000, // Mock amount
        currency: 'usd',
        status: 'succeeded',
        client_secret: `pi_${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`,
        created: Math.floor(Date.now() / 1000),
        payment_method_types: ['card'],
        metadata: {}
      };

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error);
      return {
        success: false,
        error: {
          code: 'payment_confirmation_failed',
          message: 'Failed to confirm payment',
          type: 'api_error'
        }
      };
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<StripePaymentResponse> {
    try {
      console.log('Getting Stripe payment intent:', paymentIntentId);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock payment intent
      const paymentIntent: StripePaymentIntent = {
        id: paymentIntentId,
        amount: 10000, // Mock amount
        currency: 'usd',
        status: 'succeeded',
        client_secret: `pi_${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`,
        created: Math.floor(Date.now() / 1000),
        payment_method_types: ['card'],
        metadata: {}
      };

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      console.error('Stripe payment intent retrieval failed:', error);
      return {
        success: false,
        error: {
          code: 'payment_intent_retrieval_failed',
          message: 'Failed to retrieve payment intent',
          type: 'api_error'
        }
      };
    }
  }

  async createPaymentMethod(cardDetails: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    billing_details?: {
      name: string;
      email: string;
    };
  }): Promise<{ success: boolean; paymentMethod?: StripePaymentMethod; error?: any }> {
    try {
      console.log('Creating Stripe payment method:', { ...cardDetails, number: '****' });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful payment method
      const paymentMethod: StripePaymentMethod = {
        id: `pm_${Math.random().toString(36).substr(2, 9)}`,
        type: 'card',
        card: {
          brand: 'visa',
          last4: cardDetails.number.slice(-4),
          exp_month: cardDetails.exp_month,
          exp_year: cardDetails.exp_year
        },
        billing_details: cardDetails.billing_details
      };

      return {
        success: true,
        paymentMethod
      };
    } catch (error) {
      console.error('Stripe payment method creation failed:', error);
      return {
        success: false,
        error: {
          code: 'payment_method_creation_failed',
          message: 'Failed to create payment method',
          type: 'api_error'
        }
      };
    }
  }

  async attachPaymentMethodToCustomer(paymentMethodId: string, customerId: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('Attaching payment method to customer:', { paymentMethodId, customerId });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return { success: true };
    } catch (error) {
      console.error('Stripe payment method attachment failed:', error);
      return {
        success: false,
        error: {
          code: 'payment_method_attachment_failed',
          message: 'Failed to attach payment method to customer',
          type: 'api_error'
        }
      };
    }
  }

  async createCustomer(customerData: {
    email: string;
    name: string;
    phone?: string;
    address?: {
      country: string;
      state: string;
      city: string;
      line1: string;
      line2?: string;
      postal_code: string;
    };
  }): Promise<{ success: boolean; customerId?: string; error?: any }> {
    try {
      console.log('Creating Stripe customer:', customerData);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const customerId = `cus_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        customerId
      };
    } catch (error) {
      console.error('Stripe customer creation failed:', error);
      return {
        success: false,
        error: {
          code: 'customer_creation_failed',
          message: 'Failed to create customer',
          type: 'api_error'
        }
      };
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // In production, this would verify the webhook signature using crypto
    console.log('Verifying Stripe webhook signature:', { payload: payload.slice(0, 50) + '...', signature });
    return true; // Mock verification
  }

  parseWebhookEvent(payload: string): StripeWebhookEvent | null {
    try {
      const event = JSON.parse(payload) as StripeWebhookEvent;
      console.log('Parsed Stripe webhook event:', event.type);
      return event;
    } catch (error) {
      console.error('Failed to parse Stripe webhook event:', error);
      return null;
    }
  }

  // Utility methods
  formatAmount(amount: number, currency: string = 'usd'): number {
    // Convert dollars to cents for Stripe
    return Math.round(amount * 100);
  }

  formatAmountFromStripe(amount: number, currency: string = 'usd'): number {
    // Convert cents from Stripe to dollars
    return amount / 100;
  }

  getSupportedCurrencies(): string[] {
    return ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'];
  }

  getSupportedPaymentMethods(): string[] {
    return ['card', 'bank_transfer', 'sepa_debit'];
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// React hook for Stripe integration
export function useStripePayment() {
  const createPayment = async (amount: number, currency: string, metadata: Record<string, string>) => {
    const request: StripePaymentRequest = {
      amount: stripeService.formatAmount(amount, currency),
      currency,
      payment_method_types: ['card'],
      metadata,
      description: `Token purchase for ${metadata.assetId}`,
      receipt_email: metadata.userEmail
    };

    return await stripeService.createPaymentIntent(request);
  };

  const confirmPayment = async (paymentIntentId: string, paymentMethodId: string) => {
    return await stripeService.confirmPaymentIntent(paymentIntentId, paymentMethodId);
  };

  const getPaymentStatus = async (paymentIntentId: string) => {
    return await stripeService.getPaymentIntent(paymentIntentId);
  };

  return {
    createPayment,
    confirmPayment,
    getPaymentStatus,
    formatAmount: stripeService.formatAmount,
    formatAmountFromStripe: stripeService.formatAmountFromStripe
  };
}