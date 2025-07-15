import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';
// Removed HelpCenter import - now using direct Link to investor-resources page
import { NexusLogo } from '@/components/ui/nexus-logo';

import { Menu, X, Building2, Coins, ChevronDown, Globe, BarChart3, Home, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navItems = [
    { href: '/how-it-works', label: 'How it works', icon: Building2 },
    { href: '/properties', label: 'Properties', icon: Home },
    { href: '/global-trading', label: 'Trading', icon: Coins },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-blue-primary/10 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 lg:h-20 touch-target">
          
          {/* Left Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  to={item.href} 
                  className={`group relative px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                    isActive 
                      ? 'text-blue-primary bg-blue-primary/10' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-primary to-orange-accent rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Center Logo */}
          <div className="flex items-center justify-center flex-1 lg:flex-none">
            <Link to="/" className="group flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                {/* Enhanced two-tone donut with glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg group-hover:shadow-xl transition-all duration-300" style={{
                  clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'
                }}></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 shadow-lg group-hover:shadow-xl transition-all duration-300" style={{
                  clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
                }}></div>
                {/* Center hole with glow */}
                <div className="absolute inset-[12px] lg:inset-[14px] rounded-full bg-white shadow-inner"></div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/20 to-orange-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="text-xl lg:text-2xl font-black tracking-wide">
                <span className="text-blue-600 group-hover:text-blue-700 transition-colors">NEXUS</span>
                <span className="text-orange-500 ml-1 group-hover:text-orange-600 transition-colors">MINT</span>
              </div>
            </Link>
          </div>

          {/* Right Side Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-3 justify-end flex-1">
            <Link 
              to="/early-access" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <span>Early Access</span>
            </Link>
            <Link 
              to="/investor-resources" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <span>Investor Resources</span>
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/portfolio" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg hover:bg-gray-100"
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
                    className="bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 px-6 py-2.5 rounded-full font-medium hover:scale-105"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button 
                    variant="cta"
                    className="bg-gradient-to-r from-orange-accent to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform"
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
              className="text-gray-700 hover:text-orange-accent p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 touch-target"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-500 ease-in-out ${
          isOpen 
            ? 'max-h-screen opacity-100 visible' 
            : 'max-h-0 opacity-0 invisible'
        }`}>
          <div className="py-6 space-y-2 border-t border-gray-200 bg-white/95 backdrop-blur-xl">
            {/* Mobile Nav Items */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link 
                    key={item.href}
                    to={item.href} 
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                      isActive 
                        ? 'text-blue-primary bg-blue-primary/10' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-primary rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {user ? (
                <div className="space-y-3">
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/portfolio" 
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <Coins className="h-5 w-5" />
                    <span>Portfolio</span>
                  </Link>
                  <div className="px-4">
                    <UserMenu user={user} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 px-4">
                  <Link to="/auth/signin" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 py-3 rounded-lg font-medium"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth/signup" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="cta"
                      className="w-full bg-gradient-to-r from-orange-accent to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Quick Links */}
            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-1">
                <Link 
                  to="/early-access" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="h-5 w-5" />
                  <span>Early Access</span>
                </Link>
                <Link 
                  to="/investor-resources" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="h-5 w-5" />
                  <span>Investor Resources</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}