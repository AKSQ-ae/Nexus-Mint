import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, Search, HelpCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const quickActions = [
  {
    icon: <DollarSign className="h-5 w-5" />,
    label: 'Invest Now',
    href: '/properties',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    icon: <Search className="h-5 w-5" />,
    label: 'Browse',
    href: '/properties',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    label: 'Help',
    href: '#faq',
    color: 'bg-purple-500 hover:bg-purple-600'
  }
];

export function QuickActionFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {/* Quick action buttons */}
      {isOpen && (
        <div className="flex flex-col space-y-2 animate-fade-in">
          {quickActions.map((action, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="bg-background text-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg border">
                {action.label}
              </span>
              <Link to={action.href}>
                <Button
                  size="sm"
                  className={`h-12 w-12 rounded-full shadow-lg ${action.color} text-white hover:scale-110 transition-all duration-200`}
                  onClick={() => setIsOpen(false)}
                >
                  {action.icon}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-primary hover:bg-primary/90 hover:scale-110'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}