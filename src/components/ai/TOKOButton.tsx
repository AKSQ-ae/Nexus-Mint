import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TOKO from './TOKO';

interface TOKOButtonProps {
  userId?: string;
}

const TOKOButton: React.FC<TOKOButtonProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Fixed TOKO Button */}
      <Button
        onClick={handleOpen}
        className="toko-btn fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white border-0"
        aria-label="Ask TOKO"
      >
        <span className="toko-icon mr-2" />
        <span className="hidden sm:inline">Ask TOKO</span>
      </Button>

      {/* TOKO Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <span className="toko-icon" />
              TOKO - Your AI Investment Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <TOKO userId={userId} className="h-full border-0" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TOKOButton;