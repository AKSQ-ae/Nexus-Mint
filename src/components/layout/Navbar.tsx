import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';
// Removed HelpCenter import - now using direct Link to investor-resources page
import { NexusLogo } from '@/components/ui/nexus-logo';

import { Menu, X, Building2, Coins } from 'lucide-react';
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
    <nav className="bg-gradient-to-r from-blue-primary/5 via-white to-orange-accent/5 backdrop-blur-xl border-b border-blue-primary/10 sticky top-0 z-50 shadow-elegant transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center h-20 relative">
          
          {/* Left Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/how-it-works" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              How it works
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-accent transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link 
              to="/properties" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              Properties
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-accent transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link 
              to="/global-trading" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              Trading
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-accent transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link 
              to="/analytics" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              Analytics
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-accent transition-all duration-300 group-hover:w-full"></div>
            </Link>
          </div>

          {/* Center Logo */}
          <div className="flex items-center justify-center lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
            <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <div className="relative w-10 h-10">
                {/* Two-tone donut - blue half */}
                <div className="absolute inset-0 rounded-full bg-blue-600 shadow-lg" style={{
                  clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'
                }}></div>
                {/* Two-tone donut - orange half */}
                <div className="absolute inset-0 rounded-full bg-orange-500 shadow-lg" style={{
                  clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
                }}></div>
                {/* Center hole */}
                <div className="absolute inset-[12px] rounded-full bg-white"></div>
              </div>
              <div className="text-2xl font-black tracking-wide">
                <span className="text-blue-600">NEXUS</span>
                <span className="text-orange-500 ml-1">MINT</span>
              </div>
            </Link>
          </div>

          {/* Right Side Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4 ml-auto">
            <Link 
              to="/early-access" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <span>Early Access</span>
            </Link>
            <Link 
              to="/investor-resources" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <span>Investor Resources</span>
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/portfolio" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105"
                >
                  Portfolio
                </Link>
                <UserMenu user={user} />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth/signin">
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 px-6 py-2.5 rounded-full font-medium"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button 
                    variant="cta"
                    className="bg-orange-accent hover:bg-orange-accent/90 text-white px-6 py-2.5 rounded-full font-semibold shadow-glow transition-all duration-300 hover:scale-105"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-orange-accent p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-6 space-y-2 border-t border-white/10 bg-grey-dark/95 backdrop-blur-xl">
            <div className="space-y-1">
              <Link 
                to="/how-it-works" 
                className="flex items-center space-x-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Building2 className="h-5 w-5" />
                <span>How it works</span>
              </Link>
              <Link 
                to="/properties" 
                className="flex items-center space-x-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Building2 className="h-5 w-5" />
                <span>Properties</span>
              </Link>
              <Link 
                to="/global-trading" 
                className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Trading
              </Link>
              <Link 
                to="/analytics" 
                className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Analytics
              </Link>
              <Link 
                to="/early-access" 
                className="block px-4 py-3 bg-orange-accent/20 text-orange-accent hover:bg-orange-accent/30 rounded-lg transition-all duration-300 font-medium border border-orange-accent/30"
                onClick={() => setIsOpen(false)}
              >
                Early Access
              </Link>
              <Link 
                to="/investor-resources" 
                className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Investor Resources
              </Link>
              <Link 
                to="/referrals" 
                className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Referrals
              </Link>
              <Link 
                to="/tokenization-demo" 
                className="flex items-center space-x-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Coins className="h-5 w-5" />
                <span>Tokenization</span>
              </Link>
              <Link 
                to="/demo" 
                className="block px-4 py-3 bg-orange-accent/20 text-orange-accent hover:bg-orange-accent/30 rounded-lg transition-all duration-300 font-medium border border-orange-accent/30"
                onClick={() => setIsOpen(false)}
              >
                Investment Sandbox
              </Link>
            </div>
            
            {user ? (
              <div className="pt-4 border-t border-white/10 space-y-1">
                <Link 
                  to="/dashboard" 
                  className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/portfolio" 
                  className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Portfolio
                </Link>
                {userRole === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="px-4 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut} 
                    className="w-full bg-transparent border-white/30 text-white hover:bg-white/10"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-4 pt-4 border-t border-white/10 space-y-3">
                <Link to="/auth/signin" onClick={() => setIsOpen(false)} className="block">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center h-12 bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup" onClick={() => setIsOpen(false)} className="block">
                  <Button 
                    variant="cta"
                    className="w-full justify-center h-12 bg-orange-accent hover:bg-orange-accent/90 text-white rounded-full font-semibold"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}