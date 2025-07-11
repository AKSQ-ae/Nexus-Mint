import { PropertyDiscovery } from '@/components/properties/PropertyDiscovery';

export default function Properties() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center px-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
          Investment Properties
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover premium real estate opportunities with fractional ownership. 
          Start building your portfolio with tokens from verified properties worldwide.
        </p>
      </div>
      
      {/* Enhanced Property Discovery */}
      <PropertyDiscovery />
    </div>
  );
}