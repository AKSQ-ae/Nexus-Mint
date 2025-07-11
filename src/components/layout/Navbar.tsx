import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { HelpCenter } from '@/components/ui/help-center';
import { Menu, X, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

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
    // Navigate to home page after sign out - using window.location for now
    window.location.href = '/';
  };

  return (
    <nav className="bg-background border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">Nexus Mint</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/properties" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Properties
            </Link>
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/portfolio" 
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Portfolio
                </Link>
                <Link 
                  to="/tokenization-demo" 
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Tokenization Demo
                </Link>
              </>
            )}
            {user && userRole === 'admin' && (
              <Link 
                to="/admin" 
                className="text-foreground hover:text-primary transition-colors"
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
              className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Properties
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