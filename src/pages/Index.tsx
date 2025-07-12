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
      <Hero />
      <Stats />
      <TrustSignals />
      <Features />
      <FeaturedProperties />
      <GlobalMarkets />
      <HowItWorks />
      <FeeTransparency />
      <EnhancedFAQ />
      <CTA />
      <PWAInstallPrompt />
    </>
  );
}