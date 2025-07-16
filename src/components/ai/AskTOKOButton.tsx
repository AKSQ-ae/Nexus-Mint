import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TOKO from './TOKO';

interface AskTOKOButtonProps {
  userId?: string;
}

const AskTOKOButton: React.FC<AskTOKOButtonProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
    
    // Emit analytics event
    if (window.analytics) {
      window.analytics.track('toko.opened', { userId });
    }
  };

  return (
    <>
      <button
        className="toko-btn fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 z-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={handleClick}
        aria-label="Ask TOKO"
      >
        <span className="toko-icon" />
        <span className="font-semibold">Ask TOKO</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Chat with TOKO</DialogTitle>
          </DialogHeader>
          <TOKO userId={userId} className="h-full border-0" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AskTOKOButton;