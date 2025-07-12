import { useState } from 'react';
import { Plus, Building2, TrendingUp, User, Search, Command } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './button';
import { Card } from './card';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  action?: () => void;
  description?: string;
  shortcut?: string;
}

const defaultActions: QuickAction[] = [
  {
    id: 'browse-properties',
    label: 'Browse Properties',
    icon: Building2,
    href: '/properties',
    description: 'Explore available investment opportunities',
    shortcut: 'P'
  },
  {
    id: 'view-portfolio',
    label: 'My Portfolio',
    icon: TrendingUp,
    href: '/portfolio',
    description: 'Check your investments and returns',
    shortcut: 'O'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile',
    description: 'Manage your account settings',
    shortcut: 'U'
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    action: () => {
      const searchInput = document.querySelector('#global-search') as HTMLInputElement;
      searchInput?.focus();
    },
    description: 'Quick search across platform',
    shortcut: '/'
  }
];

interface QuickActionsProps {
  actions?: QuickAction[];
  isOpen: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
}

export function QuickActions({ 
  actions = defaultActions, 
  isOpen, 
  onClose,
  trigger 
}: QuickActionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleActionClick = (action: QuickAction) => {
    if (action.action) {
      action.action();
    }
    onClose();
  };

  if (!isOpen) return trigger || null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
        onClick={onClose}
      />
      
      {/* Quick Actions Panel */}
      <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-0 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-lg">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Command className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Quick Actions</h3>
          </div>
          <Input
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {filteredActions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No actions found
            </div>
          ) : (
            <div className="p-2">
              {filteredActions.map((action, index) => (
                <div key={action.id}>
                  {action.href ? (
                    <Link 
                      to={action.href} 
                      onClick={onClose}
                      className="block"
                    >
                      <ActionItem action={action} index={index} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleActionClick(action)}
                      className="w-full"
                    >
                      <ActionItem action={action} index={index} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-border bg-muted/30 text-xs text-muted-foreground text-center">
          Press <kbd className="px-2 py-1 bg-background rounded text-foreground">Esc</kbd> to close
        </div>
      </Card>
    </>
  );
}

function ActionItem({ action, index }: { action: QuickAction; index: number }) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors",
      "group cursor-pointer"
    )}>
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <action.icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      
      <div className="flex-1 text-left">
        <div className="font-medium text-sm">{action.label}</div>
        {action.description && (
          <div className="text-xs text-muted-foreground">{action.description}</div>
        )}
      </div>
      
      {action.shortcut && (
        <div className="flex-shrink-0">
          <kbd className="px-2 py-1 text-xs bg-background/50 rounded border">
            {action.shortcut}
          </kbd>
        </div>
      )}
    </div>
  );
}

// Floating Action Button for Quick Actions
export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut handler
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 z-30 group"
        onClick={() => setIsOpen(true)}
        aria-label="Quick actions"
      >
        <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
      </Button>
      
      <QuickActions 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}