import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import branding from '@/config/branding.config';

interface BiometricAuthProps {
  onSuccess: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function BiometricAuth({ onSuccess, onError, className }: BiometricAuthProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if WebAuthn is supported
    const checkSupport = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsSupported(available);
        } catch (error) {
          console.log('Biometric authentication not available');
          setIsSupported(false);
        }
      }
    };

    checkSupport();
  }, []);

  const authenticate = async () => {
    if (!isSupported) {
      const errorMsg = 'Biometric authentication is not supported on this device';
      onError?.(errorMsg);
      toast({
        title: "Not Supported",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    setIsAuthenticating(true);

    try {
      // Create a credential for biometric authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32), // Should be random in production
          rp: {
            name: branding.companyName,
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16), // Should be user-specific in production
            name: "user@example.com",
            displayName: `${branding.companyName} User`,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "direct"
        }
      });

      if (credential) {
        toast({
          title: "Authentication Successful",
          description: "Welcome back! Biometric authentication completed.",
        });
        onSuccess();
      }
    } catch (error: any) {
      const errorMsg = error.name === 'NotAllowedError' 
        ? 'Biometric authentication was cancelled or failed'
        : 'Biometric authentication failed';
      
      console.error('Biometric auth error:', error);
      onError?.(errorMsg);
      
      toast({
        title: "Authentication Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground text-sm ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span>Biometric authentication not available</span>
      </div>
    );
  }

  return (
    <Button
      onClick={authenticate}
      disabled={isAuthenticating}
      variant="outline"
      className={`gap-2 ${className}`}
    >
      {isAuthenticating ? (
        <Shield className="w-4 h-4 animate-pulse" />
      ) : (
        <Fingerprint className="w-4 h-4" />
      )}
      {isAuthenticating ? 'Authenticating...' : 'Use Biometrics'}
    </Button>
  );
}

// Enhanced hook for biometric preferences
export function useBiometricAuth() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsSupported(available);
          
          // Check user preference
          const preference = localStorage.getItem(`${branding.shortName.toLowerCase()}_biometric_enabled`);
          setIsEnabled(preference === 'true' && available);
        } catch (error) {
          setIsSupported(false);
        }
      }
    };

    checkSupport();
  }, []);

  const enableBiometric = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${branding.shortName.toLowerCase()}_biometric_enabled`, 'true');
    }
    setIsEnabled(true);
  };

  const disableBiometric = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${branding.shortName.toLowerCase()}_biometric_enabled`, 'false');
    }
    setIsEnabled(false);
  };

  return {
    isSupported,
    isEnabled,
    enableBiometric,
    disableBiometric
  };
}