import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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
    <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-[100] transition-all duration-300 md:h-[62px] h-[44px]"
      style={{ WebkitTransform: 'translateZ(0)' }}
    >
      <div className="mx-auto max-w-7xl md:px-6 px-2 h-full">
        <div className="flex items-center justify-between h-full md:py-[7px] py-2">
          
          {/* Left Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-8 flex-1">
            <Link 
              to="/how-it-works" 
              className="text-[#374151] hover:text-primary font-medium transition-all duration-300 text-base leading-6 relative group py-2 px-1"
            >
              How it works
              <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/how-it-works' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link 
              to="/properties" 
              className="text-[#374151] hover:text-primary font-medium transition-all duration-300 text-base leading-6 relative group py-2 px-1"
            >
              Properties
              <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/properties' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link 
              to="/global-trading" 
              className="text-[#374151] hover:text-primary font-medium transition-all duration-300 text-base leading-6 relative group py-2 px-1"
            >
              Trading
              <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/global-trading' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link 
              to="/analytics" 
              className="text-[#374151] hover:text-primary font-medium transition-all duration-300 text-base leading-6 relative group py-2 px-1"
            >
              Analytics
              <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/analytics' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
          </div>

          {/* Center Logo */}
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <div className="relative md:w-12 md:h-12 w-8 h-8 flex items-center justify-center">
                {/* Two-tone donut - blue half */}
                <div className="absolute inset-0 rounded-full bg-blue-600 shadow-lg" style={{
                  clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'
                }}></div>
                {/* Two-tone donut - orange half */}
                <div className="absolute inset-0 rounded-full bg-orange-500 shadow-lg" style={{
                  clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
                }}></div>
                {/* Center hole */}
                <div className="absolute inset-[30%] rounded-full bg-white"></div>
              </div>
              <div className="md:text-2xl text-xl font-black tracking-wide">
                <span className="text-blue-600">NEXUS</span>
                <span className="text-orange-500 ml-1">MINT</span>
              </div>
            </Link>
          </div>

          {/* Right Side Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-4 justify-end flex-1">
            <Link 
              to="/early-access" 
              className="text-[#374151] hover:text-primary font-medium transition-all duration-300 text-base leading-6 flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-50"
            >
              <span>Early Access</span>
            </Link>
            <Link 
              to="/investor-resources" 
              className="text-[#374151] hover:text-primary font-medium transition-all duration-300 text-base leading-6 flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-50"
            >
              <span>Investor Resources</span>
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="text-[#374151] hover:text-gray-900 font-medium transition-all duration-300 text-base leading-6"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/portfolio" 
                  className="text-[#374151] hover:text-gray-900 font-medium transition-all duration-300 text-base leading-6"
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
                    className="bg-transparent border-gray-300 text-[#374151] hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 px-6 py-2.5 rounded-full font-medium text-base leading-6"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup" className="relative">
                  <Button 
                    variant="cta"
                    className="nexus-get-started-button bg-orange-accent hover:bg-orange-accent/90 text-white px-8 py-3 rounded-full font-semibold shadow-glow transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 min-h-[44px] min-w-[120px] relative z-[101] pointer-events-auto"
                    style={{ 
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent'
                    }}
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
              className="text-[#374151] hover:text-primary p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden py-4 space-y-2 border-t border-[#E5E7EB] bg-white absolute left-0 right-0 z-[99] transition-all duration-300 ${isOpen ? 'top-full opacity-100' : '-top-full opacity-0'}`}>
            <div className="space-y-1 px-4">
              <Link 
                to="/how-it-works" 
                className="flex items-center space-x-3 px-4 py-3 text-[#374151] hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium text-base"
                onClick={() => setIsOpen(false)}
              >
                <Building2 className="h-5 w-5" />
                <span>How it works</span>
              </Link>
              <Link 
                to="/properties" 
                className="flex items-center space-x-3 px-4 py-3 text-[#374151] hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium text-base"
                onClick={() => setIsOpen(false)}
              >
                <Building2 className="h-5 w-5" />
                <span>Properties</span>
              </Link>
              <Link 
                to="/global-trading" 
                className="block px-4 py-3 text-[#374151] hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium text-base"
                onClick={() => setIsOpen(false)}
              >
                Trading
              </Link>
              <Link 
                to="/analytics" 
                className="block px-4 py-3 text-[#374151] hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium text-base"
                onClick={() => setIsOpen(false)}
              >
                Analytics
              </Link>
              <Link 
                to="/early-access" 
                className="block px-4 py-3 text-[#374151] hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium text-base"
                onClick={() => setIsOpen(false)}
              >
                Early Access
              </Link>
              <Link 
                to="/investor-resources" 
                className="block px-4 py-3 text-[#374151] hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium text-base"
                onClick={() => setIsOpen(false)}
              >
                Investor Resources
              </Link>
            </div>
            
            {user ? (
              <div className="pt-4 border-t border-[#E5E7EB] space-y-1 px-4">
                <Link 
                  to="/dashboard" 
                  className="block px-4 py-3 text-[#374151] hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium text-base"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/portfolio" 
                  className="block px-4 py-3 text-[#374151] hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium text-base"
                  onClick={() => setIsOpen(false)}
                >
                  Portfolio
                </Link>
                {userRole === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="block px-4 py-3 text-[#374151] hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut} 
                    className="w-full bg-transparent border-gray-300 text-[#374151] hover:bg-gray-50"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-8 pt-4 border-t border-[#E5E7EB] space-y-3">
                <Link to="/auth/signin" onClick={() => setIsOpen(false)} className="block">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center h-12 bg-transparent border-gray-300 text-[#374151] hover:bg-gray-50 rounded-full"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup" onClick={() => setIsOpen(false)} className="block relative">
                  <Button 
                    variant="cta"
                    className="nexus-get-started-button w-full justify-center h-12 bg-[#FF7A45] hover:bg-[#FF7A45]/90 text-white rounded-full font-semibold relative z-[101] pointer-events-auto"
                    style={{ 
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
        </div>
      </div>
    </nav>
  );
}