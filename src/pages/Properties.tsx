import { PropertyDiscovery } from '@/components/properties/PropertyDiscovery';

export default function Properties() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Investment Properties
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover premium real estate opportunities with fractional ownership. 
          Start building your portfolio with tokens from verified properties worldwide.
        </p>
      </div>
      
      {/* Enhanced Property Discovery */}
      <PropertyDiscovery />
    </div>
  );
}