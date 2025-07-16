import { GlobalMarkets } from '@/components/home/GlobalMarkets';
import { GlobalPropertyExchange } from '@/components/trading/GlobalPropertyExchange';

export default function GlobalTrading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Global Property Trading
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trade property tokens across global markets with advanced trading features and real-time market data.
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