import { useEffect } from 'react';
import { InvestorResourcesContent } from '@/components/ui/investor-resources-content';

export default function InvestorResources() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Investor Resources
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Find answers to your questions and get the support you need for your real estate investment journey
          </p>
        </div>
        
        <InvestorResourcesContent />
      </div>
    </div>
  );
}