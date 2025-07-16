import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headset, LifeBuoy } from 'lucide-react';

const TokoAIAdvisorPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="p-8 w-full text-center">
        <h1 className="text-3xl font-bold mb-4">TOKO AI Advisor</h1>
        <p className="text-lg text-muted-foreground mb-6">
          TOKO AI Advisor is launching soon.<br />
          Personalized portfolio guidance powered by regulated AI tools.
        </p>
        <div className="flex flex-col gap-4 items-center">
          <Button variant="default" size="lg" className="w-full flex items-center gap-2 justify-center" disabled>
            <Headset className="w-5 h-5" />
            Live Chat (Coming Soon)
          </Button>
          <Button variant="outline" size="lg" className="w-full flex items-center gap-2 justify-center" asChild>
            <a href="/support" target="_blank" rel="noopener noreferrer">
              <LifeBuoy className="w-5 h-5" />
              Account Support
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TokoAIAdvisorPage;