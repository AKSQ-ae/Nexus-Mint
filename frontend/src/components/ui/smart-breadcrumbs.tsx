import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
}

export function SmartBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/', icon: Home }
    ];
    
    const routeMap: Record<string, string> = {
      'properties': 'Properties',
      'portfolio': 'Portfolio',
      'dashboard': 'Dashboard',
      'analytics': 'Analytics',
      'trading': 'Trading',
      'global-trading': 'Global Trading',
      'auth': 'Authentication',
      'signin': 'Sign In',
      'signup': 'Sign Up',
      'admin': 'Admin Dashboard',
      'profile': 'Profile',
      'referrals': 'Referrals',
      'payments': 'Payments',
      'demo': 'Investment Sandbox'
    };
    
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({ label, href: currentPath });
    });
    
    return items;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  // Don't show breadcrumbs on home page
  if (location.pathname === '/') return null;
  
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm py-4 px-6 bg-muted/30 border-b">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="flex items-center text-foreground font-medium">
              {item.icon && <item.icon className="h-4 w-4 mr-1" />}
              {item.label}
            </span>
          ) : (
            <Link
              to={item.href}
              className={cn(
                "flex items-center text-muted-foreground hover:text-foreground transition-colors",
                "hover:underline"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4 mr-1" />}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}