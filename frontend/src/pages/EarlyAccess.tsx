import { EarlyAccessForm } from '@/components/launch/EarlyAccessForm';

export default function EarlyAccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-accent/5 py-12">
      <div className="container mx-auto px-4">
        <EarlyAccessForm />
      </div>
    </div>
  );
}