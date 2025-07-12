import { cn } from '@/lib/utils';

interface LogoAssetsProps {
  variant?: 'primary' | 'white' | 'dark' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LogoAssets({ variant = 'primary', size = 'md', className }: LogoAssetsProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variantStyles = {
    primary: {
      background: 'var(--gradient-hero)',
      border: '2px solid hsl(var(--background))',
      boxShadow: 'var(--shadow-elegant)'
    },
    white: {
      background: 'hsl(var(--background))',
      border: '2px solid hsl(var(--primary))',
      boxShadow: 'var(--shadow-elegant)'
    },
    dark: {
      background: 'hsl(var(--foreground))',
      border: '2px solid hsl(var(--background))',
      boxShadow: 'var(--shadow-elegant)'
    },
    minimal: {
      background: 'var(--gradient-primary)',
      border: 'none',
      boxShadow: 'none'
    }
  };

  return (
    <div 
      className={cn(
        sizeClasses[size],
        "rounded-full transition-all duration-300 hover:scale-110",
        className
      )}
      style={variantStyles[variant]}
    >
      {/* Logo content can be added here */}
    </div>
  );
}

// Favicon component for consistent favicon management
export function FaviconAssets() {
  return (
    <>
      {/* Primary favicon */}
      <link rel="icon" href="/favicon-dual-tone.png" type="image/png" />
      <link rel="apple-touch-icon" href="/favicon-dual-tone.png" />
      
      {/* PWA icons */}
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon-dual-tone.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-dual-tone.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-dual-tone.png" />
      
      {/* Branded manifest */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="hsl(var(--primary))" />
      <meta name="apple-mobile-web-app-title" content="Nexus Mint" />
    </>
  );
}