import { toast as sonnerToast } from 'sonner';
import { CheckCircle, AlertTriangle, Info, X, ExternalLink } from 'lucide-react';

interface ToastOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export const enhancedToast = {
  success: ({ title = 'Success', description, action, duration = 4000 }: ToastOptions = {}) => {
    return sonnerToast.success(title, {
      description,
      duration,
      icon: <CheckCircle className="h-4 w-4" />,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    });
  },

  error: ({ title = 'Error', description, action, duration = 6000 }: ToastOptions = {}) => {
    return sonnerToast.error(title, {
      description,
      duration,
      icon: <AlertTriangle className="h-4 w-4" />,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    });
  },

  info: ({ title = 'Info', description, action, duration = 4000 }: ToastOptions = {}) => {
    return sonnerToast.info(title, {
      description,
      duration,
      icon: <Info className="h-4 w-4" />,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    });
  },

  loading: ({ title = 'Loading...', description }: { title?: string; description?: string } = {}) => {
    return sonnerToast.loading(title, {
      description,
    });
  },

  // Investment-specific toasts
  investment: {
    started: (amount: number, propertyTitle: string) => {
      return enhancedToast.info({
        title: 'Investment Started',
        description: `Processing $${amount.toLocaleString()} investment in ${propertyTitle}`,
        duration: 3000,
      });
    },

    completed: (amount: number, propertyTitle: string, txHash?: string) => {
      return enhancedToast.success({
        title: 'Investment Successful!',
        description: `$${amount.toLocaleString()} invested in ${propertyTitle}`,
        action: txHash ? {
          label: 'View Transaction',
          onClick: () => window.open(`https://etherscan.io/tx/${txHash}`, '_blank'),
        } : undefined,
      });
    },

    failed: (error: string) => {
      return enhancedToast.error({
        title: 'Investment Failed',
        description: error,
        action: {
          label: 'Try Again',
          onClick: () => window.location.reload(),
        },
      });
    },
  },

  // KYC-specific toasts
  kyc: {
    documentUploaded: (documentType: string) => {
      return enhancedToast.success({
        title: 'Document Uploaded',
        description: `${documentType} has been uploaded and is under review`,
      });
    },

    verified: () => {
      return enhancedToast.success({
        title: 'KYC Verified',
        description: 'Your identity has been verified. You can now invest!',
        duration: 6000,
      });
    },

    rejected: (reason?: string) => {
      return enhancedToast.error({
        title: 'KYC Rejected',
        description: reason || 'Please review and resubmit your documents',
        duration: 8000,
      });
    },
  },

  // Tokenization-specific toasts
  tokenization: {
    auditStarted: () => {
      return enhancedToast.loading({
        title: 'Running Property Audit',
        description: 'Validating property documents and compliance...',
      });
    },

    auditCompleted: (score: number) => {
      return enhancedToast.success({
        title: 'Audit Complete',
        description: `Property scored ${score}/100 and passed all compliance checks`,
      });
    },

    contractDeployed: (address: string) => {
      return enhancedToast.success({
        title: 'Smart Contract Deployed',
        description: 'Property tokenization contract is live on blockchain',
        action: {
          label: 'View Contract',
          onClick: () => window.open(`https://etherscan.io/address/${address}`, '_blank'),
        },
      });
    },

    launched: (propertyTitle: string) => {
      return enhancedToast.success({
        title: 'Tokenization Launched!',
        description: `${propertyTitle} is now available for investment`,
        duration: 6000,
      });
    },
  },

  // Payment-specific toasts
  payment: {
    processing: () => {
      return enhancedToast.loading({
        title: 'Processing Payment',
        description: 'Redirecting to secure payment gateway...',
      });
    },

    successful: (amount: number) => {
      return enhancedToast.success({
        title: 'Payment Successful',
        description: `$${amount.toLocaleString()} payment processed successfully`,
      });
    },

    failed: (error: string) => {
      return enhancedToast.error({
        title: 'Payment Failed',
        description: error,
        action: {
          label: 'Try Again',
          onClick: () => window.location.reload(),
        },
      });
    },
  },

  // Wallet-specific toasts
  wallet: {
    connected: (address: string) => {
      return enhancedToast.success({
        title: 'Wallet Connected',
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    },

    disconnected: () => {
      return enhancedToast.info({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected',
      });
    },

    transactionSubmitted: (txHash: string) => {
      return enhancedToast.info({
        title: 'Transaction Submitted',
        description: 'Your transaction has been submitted to the blockchain',
        action: {
          label: 'View on Etherscan',
          onClick: () => window.open(`https://etherscan.io/tx/${txHash}`, '_blank'),
        },
      });
    },
  },
};