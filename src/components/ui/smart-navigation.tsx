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
        "fixed bottom-6 right-6 z-[9994] transition-all duration-500",
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
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in z-[9999] border border-slate-700/50 backdrop-blur-xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-playfair font-bold text-white">
                Where would you like to go?
              </h2>
              <p className="text-slate-300 font-inter">
                Navigate to any section quickly and efficiently
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-full w-10 h-10 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
          <h3 className="text-lg font-playfair font-semibold text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                to={action.href}
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center p-4 rounded-xl bg-slate-800/50 border border-slate-600/50 hover:bg-blue-primary/20 hover:border-blue-primary/50 transition-all duration-200 hover:scale-105 group backdrop-blur-sm"
              >
                <action.icon className="w-6 h-6 text-blue-primary mb-2 group-hover:text-blue-light transition-colors" />
                <span className="text-sm font-inter font-medium text-slate-200 text-center group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="p-6 bg-gradient-to-br from-slate-900/30 to-slate-800/30">
          <h3 className="text-lg font-playfair font-semibold text-white mb-4">
            Main Sections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow backdrop-blur-sm",
                  item.featured && "ring-2 ring-orange-accent/50"
                )}
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-primary/10 to-orange-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-slate-700/50 group-hover:bg-slate-600/50",
                      "group-hover:scale-110"
                    )}>
                      <item.icon className="w-6 h-6 text-blue-primary group-hover:text-orange-accent transition-colors" />
                    </div>
                    {item.featured && (
                      <div className="bg-gradient-to-r from-orange-accent to-orange-accent/80 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Popular
                      </div>
                    )}
                  </div>
                  
                  <h4 className="text-xl font-playfair font-bold text-white mb-2 group-hover:text-orange-accent transition-colors">
                    {item.title}
                  </h4>
                  
                  <p className="text-slate-300 font-inter text-sm leading-relaxed mb-4 group-hover:text-slate-200 transition-colors">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center text-blue-primary font-inter font-semibold text-sm group-hover:translate-x-1 group-hover:text-orange-accent transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-6 rounded-b-3xl border-t border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center justify-center gap-4 text-sm text-slate-300">
            <Link to="/help" className="hover:text-orange-accent transition-colors font-inter">
              Need Help?
            </Link>
            <span>•</span>
            <Link to="/support" className="hover:text-orange-accent transition-colors font-inter">
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