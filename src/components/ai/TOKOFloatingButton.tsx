import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { TOKOChatWidget } from './TOKOChatWidget';
import { useMediaQuery } from '@/hooks/use-media-query';

export function TOKOFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed z-50 ${
          isMobile ? 'bottom-6 right-6' : 'bottom-8 right-8'
        } h-14 w-14 rounded-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
        aria-label="Open TOKO AI Assistant"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Chat Widget */}
      <TOKOChatWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}