import { EnhancedPaymentMethods } from "@/components/payment/EnhancedPaymentMethods";

export default function Payments() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedPaymentMethods />
      </div>
    </div>
  );
}