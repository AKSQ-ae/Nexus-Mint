import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { Menu, X, Building2 } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-background border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">Nexus Platform</span>
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
              </>
            )}
          </div>
          
          {/* Right side with wallet and auth */}
          <div className="hidden md:flex items-center space-x-4">
            <ConnectButton />
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
              className="text-foreground hover:text-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <Link 
              to="/properties" 
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Properties
            </Link>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/portfolio" 
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Portfolio
                </Link>
                <Button variant="outline" onClick={handleSignOut} className="w-full">
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/auth/signin" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link to="/auth/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}