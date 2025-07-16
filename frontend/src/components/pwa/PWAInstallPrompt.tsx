import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm border-primary shadow-elegant bg-gradient-to-r from-primary/5 to-orange-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground">Install Nexus Mint</h3>
            <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleInstall}
              className="bg-gradient-hero text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Download className="w-3 h-3 mr-1" />
              Install
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsDismissed(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}