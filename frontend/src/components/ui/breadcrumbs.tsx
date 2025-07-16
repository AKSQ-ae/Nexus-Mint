import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ items = [], className, showHome = true }: BreadcrumbsProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (showHome) {
      breadcrumbs.push({ label: 'Home', path: '/', icon: <Home className="h-4 w-4" /> });
    }
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      if (index === pathSegments.length - 1) {
        // Last item - current page, no link
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, path: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1 text-sm', className)}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          
          {item.path ? (
            <Link
              to={item.path}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-foreground font-medium">
              {item.icon}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Investment flow specific breadcrumbs
export function InvestmentBreadcrumbs({ currentStep }: { currentStep: string }) {
  const steps = [
    { label: 'Properties', path: '/properties' },
    { label: 'Investment', path: undefined },
    { label: currentStep.charAt(0).toUpperCase() + currentStep.slice(1) }
  ];

  return <Breadcrumbs items={steps} />;
}

// Tokenization flow specific breadcrumbs
export function TokenizationBreadcrumbs({ currentStep, propertyTitle }: { currentStep: string; propertyTitle: string }) {
  const steps = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: propertyTitle, path: undefined },
    { label: `${currentStep.charAt(0).toUpperCase() + currentStep.slice(1)} Step` }
  ];

  return <Breadcrumbs items={steps} />;
}