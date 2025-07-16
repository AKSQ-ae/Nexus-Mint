import { HowItWorks as HowItWorksComponent } from '@/components/home/HowItWorks';
import { EnhancedFAQ } from '@/components/home/EnhancedFAQ';
import { FeeTransparency } from '@/components/home/FeeTransparency';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              How Nexus Works
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
              <span>SCA Compliant</span>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Discover tokenized real‑estate investing in three simple steps.
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