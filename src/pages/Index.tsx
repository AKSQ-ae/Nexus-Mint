import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { TrustSignals } from '@/components/home/TrustSignals';
import { CTA } from '@/components/home/CTA';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { EnhancedFeedback, useFeedback } from '@/components/ux/enhanced-feedback';
import { Helmet } from 'react-helmet-async';

// TODO: Add canonical URLs and structured data for investment/property pages for improved SEO.
// TODO: Ensure all major pages set unique titles and meta descriptions for SEO (see react-helmet-async usage below).
export default function Index() {
  const { feedback, showSuccess } = useFeedback();

  return (
    <>
      <Helmet>
        <title>Nexus Mint | Regulated UAE Real Estate Tokenization Platform</title>
        <meta name="description" content="Invest in fractional real estate through blockchain tokens. Regulated, secure, and accessible globally from AED 500." />
        <meta property="og:title" content="Nexus Mint | Regulated UAE Real Estate Tokenization Platform" />
        <meta property="og:description" content="Invest in fractional real estate through blockchain tokens. Regulated, secure, and accessible globally from AED 500." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1560472354-b33ff0c44a43" />
      </Helmet>
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