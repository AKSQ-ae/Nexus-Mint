import { HelpCenter } from '@/components/ui/help-center';

export default function InvestorResources() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Investor Resources
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Find answers to your questions and get the support you need for your real estate investment journey
          </p>
        </div>
        
        <HelpCenter />
      </div>
    </div>
  );
}