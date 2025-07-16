import React from 'react';
import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className={cn(
      "container mx-auto px-4 py-4 sm:py-8 max-w-screen-2xl",
      className
    )}>
      {children}
    </div>
  );
}

interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function MobileGrid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: MobileGridProps) {
  const gridCols = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;
  
  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      gridCols,
      className
    )}>
      {children}
    </div>
  );
}

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function MobileCard({ 
  children, 
  className,
  padding = 'md'
}: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div className={cn(
      "bg-card text-card-foreground rounded-lg border shadow-sm",
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

interface MobileTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}

export function MobileText({ 
  children, 
  size = 'base',
  className 
}: MobileTextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
    '2xl': 'text-xl sm:text-2xl',
    '3xl': 'text-2xl sm:text-3xl lg:text-4xl',
    '4xl': 'text-3xl sm:text-4xl lg:text-5xl'
  };

  return (
    <span className={cn(sizeClasses[size], className)}>
      {children}
    </span>
  );
}

interface MobileButtonProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function MobileButton({ 
  children, 
  className,
  size = 'md',
  fullWidth = false
}: MobileButtonProps) {
  const sizeClasses = {
    sm: 'h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3',
    md: 'h-9 sm:h-10 text-sm sm:text-base px-3 sm:px-4',
    lg: 'h-10 sm:h-11 text-base sm:text-lg px-4 sm:px-6'
  };

  return (
    <button className={cn(
      "inline-flex items-center justify-center rounded-md font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    )}>
      {children}
    </button>
  );
}