import { PropertyDiscovery } from '@/components/properties/PropertyDiscovery';

export default function Properties() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Investment Properties
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-light">
          Explore curated, tokenized real‑estate opportunities starting at AED 500.
        </p>
      </div>
      
      {/* Enhanced Property Discovery */}
      <PropertyDiscovery />
    </div>
  );
}