import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { HelpCenter } from '@/components/ui/help-center';
import { InteractiveLogo } from '@/components/ui/interactive-logo';

import { Menu, X, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadUserRole();
    } else {
      setUserRole(null);
    }
  }, [user]);

  const loadUserRole = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .rpc('get_user_role', { user_id: user.id });
      setUserRole(data);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-background/95 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50 shadow-elegant transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <InteractiveLogo 
                src="/lovable-uploads/3d8c3e2f-d52c-46f4-9a7b-aadf54ab83fb.png"
                alt="Nexus Logo"
                className="h-8 w-auto shadow-md"
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/properties" 
              className="px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium flex items-center space-x-2 border border-transparent hover:border-primary/20"
            >
              <Building2 className="h-4 w-4" />
              <span>Properties</span>
            </Link>
            <Link 
              to="/analytics" 
              className="px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium"
            >
              Analytics
            </Link>
            <Link 
              to="/global-trading" 
              className="px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium"
            >
              Trading
            </Link>
            <Link 
              to="/referrals" 
              className="px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium"
            >
              Referrals
            </Link>
            <Link 
              to="/demo" 
              className="px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 hover:text-secondary-foreground transition-all duration-200 font-medium border border-secondary/20 hover:border-secondary/40"
            >
              <span>Investment Sandbox</span>
            </Link>
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/portfolio" 
                  className="px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium"
                >
                  Portfolio
                </Link>
              </>
            )}
            {user && userRole === 'admin' && (
              <Link 
                to="/admin" 
                className="px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium"
              >
                Admin
              </Link>
            )}
          </div>
          
          {/* Right side with auth */}
          <div className="hidden md:flex items-center space-x-4">
            <HelpCenter />
            {/* Wallet integration temporarily disabled for debugging */}
            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-1 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Link 
              to="/properties" 
              className="flex items-center space-x-3 px-4 py-3 text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-primary/20"
              onClick={() => setIsOpen(false)}
            >
              <Building2 className="h-5 w-5" />
              <span>Properties</span>
            </Link>
            <Link 
              to="/analytics" 
              className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Analytics
            </Link>
            <Link 
              to="/global-trading" 
              className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Trading
            </Link>
            <Link 
              to="/referrals" 
              className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Referrals
            </Link>
            <Link 
              to="/demo" 
              className="block px-4 py-3 bg-secondary/10 text-secondary hover:bg-secondary/20 hover:text-secondary-foreground rounded-lg transition-all duration-200 font-medium border border-secondary/20"
              onClick={() => setIsOpen(false)}
            >
              Investment Sandbox
            </Link>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/portfolio" 
                  className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Portfolio
                </Link>
                <div className="px-4 pt-2">
                  <Button variant="outline" onClick={handleSignOut} className="w-full">
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="px-4 pt-2 space-y-2">
                <Link to="/auth/signin" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start h-12">Sign In</Button>
                </Link>
                <Link to="/auth/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full justify-start h-12">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}