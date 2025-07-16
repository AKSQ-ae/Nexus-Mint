import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TOKOButtonProps {
  className?: string;
  onOpenChat?: () => void;
}

export function TOKOButton({ className, onOpenChat }: TOKOButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Open AI chat widget instead of navigation
    if (onOpenChat) {
      onOpenChat();
    } else {
      // Fallback: navigate to AI buddy page
      window.location.href = '/ai-buddy';
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "fixed bottom-4 right-20 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
        "border-primary/20 bg-gradient-to-br from-white/95 to-primary/5 backdrop-blur-sm hover:scale-105 group",
        "pointer-events-auto", // Ensure button is clickable
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Ask TOKO - AI Investment Assistant"
    >
      <div className="relative">
        <MessageCircle className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
        <div className={cn(
          "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center",
          "toko-spin",
          isHovered ? "opacity-100" : "opacity-70"
        )}>
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>
      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 bg-accent text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        AI
      </Badge>
    </Button>
  );
}