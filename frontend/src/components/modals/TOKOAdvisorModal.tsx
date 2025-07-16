import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bot, MessageCircle, HeadphonesIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TOKOAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TOKOAdvisorModal({ isOpen, onClose }: TOKOAdvisorModalProps) {
  const navigate = useNavigate();

  const handleLiveChat = () => {
    onClose();
    // Navigate to support or open live chat
    navigate('/investor-resources');
  };

  const handleAccountSupport = () => {
    onClose();
    // Navigate to account support
    navigate('/investor-resources');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">
            TOKO AI Advisor
          </DialogTitle>
          <DialogDescription className="text-base">
            Live Beta Now Available: TOKO AI Advisor. Personalized portfolio guidance powered by regulated AI tools.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          <Button 
            onClick={handleLiveChat}
            className="w-full flex items-center gap-3"
            variant="default"
          >
            <MessageCircle className="w-4 h-4" />
            TOKO AI Live Chat
          </Button>
          
          <Button 
            onClick={handleAccountSupport}
            className="w-full flex items-center gap-3"
            variant="outline"
          >
            <HeadphonesIcon className="w-4 h-4" />
            Account Support
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}