import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { Stats } from '@/components/home/Stats';
import { GlobalMarkets } from '@/components/home/GlobalMarkets';
import { CTA } from '@/components/home/CTA';
import { TrustSignals } from '@/components/home/TrustSignals';
import { EnhancedFAQ } from '@/components/home/EnhancedFAQ';
import { FeeTransparency } from '@/components/home/FeeTransparency';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';


export default function Index() {
  return (
    <>
      <div data-section="hero">
        <Hero />
      </div>
      <div data-section="stats">
        <Stats />
      </div>
      <div data-section="trust-signals">
        <TrustSignals />
      </div>
      <div data-section="features">
        <Features />
      </div>
      <div data-section="properties">
        <FeaturedProperties />
      </div>
      <div data-section="markets">
        <GlobalMarkets />
      </div>
      <div data-section="how-it-works">
        <HowItWorks />
      </div>
      <div data-section="fees">
        <FeeTransparency />
      </div>
      <div data-section="faq">
        <EnhancedFAQ />
      </div>
      <div data-section="cta">
        <CTA />
      </div>
      <PWAInstallPrompt />
    </>
  );
}