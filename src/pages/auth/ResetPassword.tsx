import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, EyeIcon, EyeOffIcon } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // React-Router can only parse query parameters (after '?'). Supabase delivers
  // its `access_token` & `refresh_token` in the URL fragment (after '#').
  // To be resilient to both, we combine the search & hash segments into a single
  // URLSearchParams instance.
  const [searchParams] = useSearchParams();

  // Helper: Merge ?query and #hash param sources into one object.
  const getAllParams = () => {
    // params from ?search
    const params = new URLSearchParams(searchParams.toString());

    // params from #hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      hashParams.forEach((value, key) => {
        if (!params.has(key)) {
          params.append(key, value);
        }
      });
    }
    return params;
  };
  const navigate = useNavigate();

  useEffect(() => {
    const initializePasswordReset = async () => {
      const params = getAllParams();
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type') || params.get('action'); // allow 'action=recovery' variants
      
      console.log('Reset Password - URL params:', { type, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
      
      if (type === 'recovery' && accessToken && refreshToken) {
        try {
          // Set the session from URL parameters to enable password reset
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Session error:', error);
            setError('Invalid or expired reset link. Please request a new one.');
          } else {
            console.log('Session set successfully for password reset');
          }
        } catch (err) {
          console.error('Failed to set session:', err);
          setError('Invalid or expired reset link. Please request a new one.');
        }
      } else {
        // Fallback to internal token validation flow (e.g. /auth/reset?token=...)
        const fallbackToken = params.get('token');

        if (fallbackToken) {
          try {
            const res = await fetch(`/api/auth/validate-reset?token=${fallbackToken}`);
            const data = await res.json();

            if (!data?.valid) {
              setError('Invalid or expired reset link. Please request a new one.');
            }
          } catch (err) {
            console.error('Failed to validate token:', err);
            setError('Invalid or expired reset link. Please request a new one.');
          }
        } else {
          // No valid tokens found
          setError('Invalid or expired reset link. Please request a new one.');
        }
      }
    };

    initializePasswordReset();
  }, [searchParams]);

  const validateForm = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!confirmPassword) {
      setError('Please confirm your password');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const params = getAllParams();
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const hasSupabaseSession = accessToken && refreshToken;

      if (hasSupabaseSession) {
        const { error } = await supabase.auth.updateUser({
          password: password
        });

        if (error) {
          setError(error.message);
          return;
        }
      } else {
        const fallbackToken = params.get('token');
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: fallbackToken, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.message || 'Unable to reset password.');
        }
      }

      setPasswordUpdated(true);
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/auth/signin');
      }, 3000);
    } catch (error: any) {
      setError(error?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (passwordUpdated) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Password updated</CardTitle>
            <CardDescription>
              Your password has been successfully updated. You'll be redirected to sign in shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/auth/signin')}
              className="w-full"
            >
              Continue to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}