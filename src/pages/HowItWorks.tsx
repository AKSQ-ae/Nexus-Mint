import { HowItWorks as HowItWorksComponent } from '@/components/home/HowItWorks';
import { EnhancedFAQ } from '@/components/home/EnhancedFAQ';
import { FeeTransparency } from '@/components/home/FeeTransparency';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How NEXUS Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn everything about real estate tokenization, investment process, and our platform features.
          </p>
        </div>
        
        {/* How It Works Process */}
        <HowItWorksComponent />
        
        {/* Fee Transparency */}
        <FeeTransparency />
        
        {/* FAQ Section */}
        <EnhancedFAQ />
      </div>
    </div>
  );
}