import { GlobalMarkets } from '@/components/home/GlobalMarkets';
import { GlobalPropertyExchange } from '@/components/trading/GlobalPropertyExchange';

export default function GlobalTrading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Global Property Trading
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-light">
            Trade tokenized real‑estate across 24/7 global markets with live data.
          </p>
        </div>
        
        {/* Global Markets Overview */}
        <GlobalMarkets />
        
        {/* Trading Exchange */}
        <GlobalPropertyExchange />
      </div>
    </div>
  );
}