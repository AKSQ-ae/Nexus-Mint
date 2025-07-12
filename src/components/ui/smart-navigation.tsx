import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Building, 
  TrendingUp, 
  Users, 
  HelpCircle, 
  ArrowRight,
  Menu,
  X,
  Search,
  Filter,
  Star,
  DollarSign,
  MapPin,
  Eye,
  Zap
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  bgColor: string;
  featured?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'properties',
    title: 'Browse Properties',
    description: 'Explore premium UAE real estate investments starting from AED 500',
    icon: Building,
    href: '/properties',
    color: 'text-blue-primary',
    bgColor: 'bg-blue-primary/10',
    featured: true
  },
  {
    id: 'portfolio',
    title: 'My Portfolio',
    description: 'Track your investments, returns, and property performance',
    icon: TrendingUp,
    href: '/portfolio',
    color: 'text-orange-accent',
    bgColor: 'bg-orange-accent/10'
  },
  {
    id: 'trading',
    title: 'Trading Hub',
    description: 'Buy, sell, and trade property tokens on our marketplace',
    icon: Zap,
    href: '/trading',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10'
  },
  {
    id: 'analytics',
    title: 'Market Analytics',
    description: 'In-depth market insights and property performance data',
    icon: TrendingUp,
    href: '/analytics',
    color: 'text-starbucks-green',
    bgColor: 'bg-starbucks-green/10'
  }
];

const quickActions = [
  { id: 'search', label: 'Search Properties', icon: Search, href: '/properties?search=true' },
  { id: 'filter', label: 'Filter & Sort', icon: Filter, href: '/properties?filter=true' },
  { id: 'favorites', label: 'My Favorites', icon: Star, href: '/portfolio?tab=favorites' },
  { id: 'calculator', label: 'ROI Calculator', icon: DollarSign, href: '/calculator' }
];

export function SmartNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isFloating = scrollY > 100;

  return (
    <>
      {/* Floating Quick Access Button */}
      <div className={cn(
        "fixed bottom-6 right-6 z-[9996] transition-all duration-500",
        isFloating ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      )}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="bg-gradient-nexus hover:shadow-glow text-white rounded-full w-16 h-16 shadow-elegant transition-all duration-300 hover:scale-110"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Navigation Panel */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in z-[9999] border border-grey-mid/20">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-grey-mid/30 p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-playfair font-bold text-grey-dark">
                    Where would you like to go?
                  </h2>
                  <p className="text-muted-foreground font-inter">
                    Navigate to any section quickly and efficiently
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-grey-dark hover:bg-grey-light rounded-full w-10 h-10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 border-b border-grey-mid/20 bg-white">
              <h3 className="text-lg font-playfair font-semibold text-grey-dark mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.id}
                    to={action.href}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center p-4 rounded-xl bg-white border border-grey-mid/30 hover:bg-blue-light/30 transition-all duration-200 hover:scale-105 group shadow-sm"
                  >
                    <action.icon className="w-6 h-6 text-blue-primary mb-2 group-hover:text-blue-secondary transition-colors" />
                    <span className="text-sm font-inter font-medium text-grey-dark text-center">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Main Navigation */}
            <div className="p-6 bg-white">
              <h3 className="text-lg font-playfair font-semibold text-grey-dark mb-4">
                Main Sections
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl bg-white border-2 border-grey-mid/30 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-elegant",
                      item.featured && "ring-2 ring-blue-primary/20"
                    )}
                  >
                    {/* Background Gradient */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      item.bgColor
                    )} />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                          item.bgColor,
                          "group-hover:scale-110"
                        )}>
                          <item.icon className={cn("w-6 h-6", item.color)} />
                        </div>
                        {item.featured && (
                          <div className="bg-orange-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                            Popular
                          </div>
                        )}
                      </div>
                      
                      <h4 className="text-xl font-playfair font-bold text-grey-dark mb-2 group-hover:text-blue-primary transition-colors">
                        {item.title}
                      </h4>
                      
                      <p className="text-muted-foreground font-inter text-sm leading-relaxed mb-4">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center text-blue-primary font-inter font-semibold text-sm group-hover:translate-x-1 transition-transform">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-grey-light/50 p-6 rounded-b-3xl border-t border-grey-mid/20">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <Link to="/help" className="hover:text-blue-primary transition-colors font-inter">
                  Need Help?
                </Link>
                <span>•</span>
                <Link to="/support" className="hover:text-blue-primary transition-colors font-inter">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}