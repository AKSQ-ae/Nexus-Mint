import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { TrustSignals } from '@/components/home/TrustSignals';
import { CTA } from '@/components/home/CTA';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { EnhancedFeedback, useFeedback } from '@/components/ux/enhanced-feedback';
import { Meta } from '@/components/seo/Meta';

export default function Index() {
  const { feedback, showSuccess } = useFeedback();

  return (
    <>
      <Meta title="Nexus Mint | Regulated UAE Real Estate Tokenization Platform" description="Invest in fractional real estate through blockchain tokens. Regulated, secure, and accessible globally from AED 500." />
      {/* Enhanced Feedback System */}
      {feedback && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <EnhancedFeedback {...feedback} />
        </div>
      )}

      <div data-section="hero">
        <Hero />
      </div>
      
      <div data-section="trust-signals">
        <TrustSignals />
      </div>
      <div data-section="features">
        <Features />
      </div>
      <div data-section="cta">
        <CTA />
      </div>
      
      <PWAInstallPrompt />
    </>
  );
}