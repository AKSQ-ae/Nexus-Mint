import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  MessageCircle, 
  Wallet, 
  Search,
  Bell,
  Settings,
  HelpCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  disabled?: boolean;
  hidden?: boolean;
}

interface QuickActionsProps {
  position?: 'bottom-right' | 'bottom-center' | 'top-right' | 'static';
  variant?: 'floating' | 'inline' | 'sidebar';
  customActions?: QuickAction[];
  className?: string;
  collapsible?: boolean;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/'
  },
  {
    id: 'invest',
    label: 'Invest Now',
    icon: PlusCircle,
    href: '/properties',
    variant: 'primary'
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: BarChart3,
    href: '/portfolio'
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    href: '/payments'
  },
  {
    id: 'support',
    label: 'Help',
    icon: HelpCircle,
    onClick: () => {
      // Trigger help assistant
      const helpButton = document.querySelector('[data-help-trigger]') as HTMLButtonElement;
      helpButton?.click();
    }
  }
];

export function QuickActions({ 
  position = 'bottom-right',
  variant = 'floating',
  customActions,
  className,
  collapsible = true
}: QuickActionsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const actions = customActions || DEFAULT_ACTIONS;
  const visibleActions = actions.filter(action => !action.hidden);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      case 'bottom-center':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50';
      case 'top-right':
        return 'fixed top-4 right-4 z-50';
      case 'static':
      default:
        return '';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'floating':
        return 'shadow-lg border-border/50 backdrop-blur-sm bg-background/95';
      case 'inline':
        return 'border-border bg-background';
      case 'sidebar':
        return 'border-r border-border bg-background h-full';
      default:
        return '';
    }
  };

  const getActionVariantClasses = (actionVariant?: string) => {
    switch (actionVariant) {
      case 'primary':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'warning':
        return 'bg-yellow-600 text-white hover:bg-yellow-700';
      default:
        return 'bg-muted hover:bg-muted/80';
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.disabled) return;
    
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      navigate(action.href);
    }
  };

  const isCurrentPage = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  if (variant === 'sidebar') {
    return (
      <div className={cn(
        "nexus-quick-actions-sidebar w-16 flex flex-col items-center py-4 space-y-3",
        getVariantClasses(),
        className
      )}>
        {visibleActions.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            className={cn(
              "w-12 h-12 p-0 relative",
              isCurrentPage(action.href) && "bg-primary text-primary-foreground",
              action.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            title={action.label}
          >
            <action.icon className="h-5 w-5" />
            {action.badge && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
                variant="secondary"
              >
                {action.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <Card className={cn(
        "nexus-quick-actions-inline",
        getVariantClasses(),
        className
      )}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {visibleActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className={cn(
                  "flex items-center gap-2",
                  getActionVariantClasses(action.variant),
                  isCurrentPage(action.href) && "ring-2 ring-primary",
                  action.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
                {action.badge && (
                  <Badge variant="secondary" className="ml-1">
                    {action.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Floating variant
  return (
    <div className={cn(
      "nexus-quick-actions-floating",
      getPositionClasses(),
      className
    )}>
      <Card className={cn(
        "transition-all duration-300",
        getVariantClasses(),
        isCollapsed && "transform scale-95"
      )}>
        <CardContent className="p-3">
          {collapsible && (
            <div className="flex justify-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
          
          {!isCollapsed && (
            <div className="flex flex-col space-y-2">
              {visibleActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start gap-2 h-10 relative",
                    getActionVariantClasses(action.variant),
                    isCurrentPage(action.href) && "ring-2 ring-primary",
                    action.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                  {action.badge && (
                    <Badge 
                      variant="secondary" 
                      className="ml-auto text-xs"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Context-aware quick actions that change based on current page
export function ContextualQuickActions(props: QuickActionsProps) {
  const location = useLocation();
  
  const getContextualActions = (): QuickAction[] => {
    const basePath = location.pathname;
    
    // Homepage context
    if (basePath === '/') {
      return [
        {
          id: 'browse-properties',
          label: 'Browse Properties',
          icon: Search,
          href: '/properties',
          variant: 'primary'
        },
        {
          id: 'portfolio',
          label: 'My Portfolio',
          icon: BarChart3,
          href: '/portfolio'
        },
        {
          id: 'support',
          label: 'Get Help',
          icon: MessageCircle,
          onClick: () => {
            const helpButton = document.querySelector('[data-help-trigger]') as HTMLButtonElement;
            helpButton?.click();
          }
        }
      ];
    }
    
    // Properties page context
    if (basePath.startsWith('/properties')) {
      return [
        {
          id: 'home',
          label: 'Dashboard',
          icon: Home,
          href: '/'
        },
        {
          id: 'portfolio',
          label: 'My Portfolio',
          icon: BarChart3,
          href: '/portfolio'
        },
        {
          id: 'wallet',
          label: 'Wallet',
          icon: Wallet,
          href: '/payments'
        }
      ];
    }
    
    // Portfolio page context
    if (basePath.startsWith('/portfolio')) {
      return [
        {
          id: 'home',
          label: 'Dashboard',
          icon: Home,
          href: '/'
        },
        {
          id: 'invest-more',
          label: 'Invest More',
          icon: PlusCircle,
          href: '/properties',
          variant: 'primary'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          href: '/profile'
        }
      ];
    }
    
    // Default actions
    return DEFAULT_ACTIONS;
  };

  return <QuickActions {...props} customActions={getContextualActions()} />;
}

// Smart quick actions that adapt to user state
interface SmartQuickActionsProps extends QuickActionsProps {
  userKycStatus?: 'pending' | 'approved' | 'rejected' | 'not_started';
  hasInvestments?: boolean;
  walletConnected?: boolean;
  notifications?: number;
}

export function SmartQuickActions({
  userKycStatus = 'not_started',
  hasInvestments = false,
  walletConnected = false,
  notifications = 0,
  ...props
}: SmartQuickActionsProps) {
  const getSmartActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];
    
    // Always show dashboard
    actions.push({
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/'
    });
    
    // Show appropriate investment action based on KYC status
    if (userKycStatus === 'approved') {
      actions.push({
        id: 'invest',
        label: hasInvestments ? 'Invest More' : 'Start Investing',
        icon: PlusCircle,
        href: '/properties',
        variant: 'primary'
      });
    } else if (userKycStatus === 'not_started') {
      actions.push({
        id: 'kyc',
        label: 'Complete Verification',
        icon: Settings,
        href: '/profile',
        variant: 'warning'
      });
    }
    
    // Show portfolio if user has investments
    if (hasInvestments) {
      actions.push({
        id: 'portfolio',
        label: 'Portfolio',
        icon: BarChart3,
        href: '/portfolio'
      });
    }
    
    // Show wallet with connection status
    actions.push({
      id: 'wallet',
      label: walletConnected ? 'Wallet' : 'Connect Wallet',
      icon: Wallet,
      href: '/payments',
      variant: walletConnected ? 'default' : 'warning'
    });
    
    // Show notifications if any
    if (notifications > 0) {
      actions.push({
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        href: '/notifications',
        badge: notifications > 9 ? '9+' : notifications
      });
    }
    
    // Always show help
    actions.push({
      id: 'support',
      label: 'Help',
      icon: HelpCircle,
      onClick: () => {
        const helpButton = document.querySelector('[data-help-trigger]') as HTMLButtonElement;
        helpButton?.click();
      }
    });
    
    return actions;
  };

  return <QuickActions {...props} customActions={getSmartActions()} />;
}