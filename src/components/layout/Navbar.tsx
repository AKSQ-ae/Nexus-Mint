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
    <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-[100] transition-all duration-300"
      style={{ WebkitTransform: 'translateZ(0)' }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center h-[62px] md:h-11">
          
          {/* Left Navigation Links */}
           <div className="hidden lg:flex items-center space-x-8 flex-1">
            <Link 
              to="/how-it-works" 
              className={`text-[#374151] hover:text-primary font-medium text-base leading-6 transition-all duration-300 hover:scale-105 relative group py-2 px-1 ${location.pathname === '/how-it-works' ? 'text-primary' : ''}`}
            >
              How it works
              <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/how-it-works' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link 
              to="/properties" 
              className={`text-[#374151] hover:text-primary font-medium text-base leading-6 transition-all duration-300 hover:scale-105 relative group py-2 px-1 ${location.pathname === '/properties' ? 'text-primary' : ''}`}
            >
              Properties
              <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/properties' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link 
              to="/global-trading" 
              className={`text-[#374151] hover:text-primary font-medium text-base leading-6 transition-all duration-300 hover:scale-105 relative group py-2 px-1 ${location.pathname === '/global-trading' ? 'text-primary' : ''}`}
            >
              Trading
              <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/global-trading' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
            <Link 
              to="/analytics" 
              className={`text-[#374151] hover:text-primary font-medium text-base leading-6 transition-all duration-300 hover:scale-105 relative group py-2 px-1 ${location.pathname === '/analytics' ? 'text-primary' : ''}`}
            >
              Analytics
              <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/analytics' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
          </div>

          {/* Center Logo */}
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <div className="relative w-12 h-12 md:w-8 md:h-8">
                {/* Two-tone donut - blue half */}
                <div className="absolute inset-0 rounded-full bg-blue-600 shadow-lg" style={{
                  clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'
                }}></div>
                {/* Two-tone donut - orange half */}
                <div className="absolute inset-0 rounded-full bg-orange-500 shadow-lg" style={{
                  clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
                }}></div>
                {/* Center hole */}
                <div className="absolute inset-[12px] md:inset-[8px] rounded-full bg-white"></div>
              </div>
              <div className="text-2xl md:text-xl font-black tracking-wide">
                <span className="text-blue-600">NEXUS</span>
                <span className="text-orange-500 ml-1">MINT</span>
              </div>
            </Link>
          </div>

          {/* Right Side Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4 justify-end flex-1">
            <Link 
              to="/early-access" 
              className={`text-[#374151] hover:text-primary font-medium text-base leading-6 transition-all duration-300 hover:scale-105 flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-50 ${location.pathname === '/early-access' ? 'text-primary bg-gray-50' : ''}`}
            >
              <span>Early Access</span>
            </Link>
            <Link 
              to="/investor-resources" 
              className={`text-[#374151] hover:text-primary font-medium text-base leading-6 transition-all duration-300 hover:scale-105 flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-50 ${location.pathname === '/investor-resources' ? 'text-primary bg-gray-50' : ''}`}
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
              className="text-gray-700 hover:text-orange-accent p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden py-6 space-y-2 border-t border-white/10 bg-grey-dark/95 backdrop-blur-xl absolute left-0 right-0 z-[99] transition-all duration-300 ${isOpen ? 'top-full opacity-100' : '-top-full opacity-0'}`}>
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
                <Link to="/auth/signup" onClick={() => setIsOpen(false)} className="block relative">
                  <Button 
                    variant="cta"
                    className="nexus-get-started-button w-full justify-center h-14 bg-orange-accent hover:bg-orange-accent/90 text-white rounded-full font-semibold min-h-[48px] relative z-[101] pointer-events-auto"
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