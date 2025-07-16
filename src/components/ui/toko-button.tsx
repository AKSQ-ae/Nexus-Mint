import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import AIBuddy from '@/components/ai/AIBuddy';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function TOKOButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-4 right-20 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-orange-accent/20 bg-gradient-to-br from-white/95 to-orange-accent/5 backdrop-blur-sm hover:scale-105 group"
        onClick={() => setIsOpen(true)}
      >
        <div className="toko-icon">
          <MessageCircle className="h-6 w-6 text-orange-accent group-hover:rotate-12 transition-transform" />
        </div>
        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 bg-orange-accent text-white text-xs flex items-center justify-center">
          AI
        </Badge>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden p-0">
          <DialogHeader className="p-4 border-b bg-gradient-to-br from-orange-accent/10 to-orange-accent/5">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-orange-accent/10 rounded-full">
                <MessageCircle className="h-6 w-6 text-orange-accent" />
              </div>
              Ask TOKO - Your AI Investment Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <AIBuddy className="w-full" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}