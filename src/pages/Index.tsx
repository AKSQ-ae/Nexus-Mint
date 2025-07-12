import { Hero } from '@/components/home/Hero';
import { SimpleValueProps } from '@/components/home/SimpleValueProps';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { TrustSignals } from '@/components/home/TrustSignals';
import { EnhancedFAQ } from '@/components/home/EnhancedFAQ';
import { FeeTransparency } from '@/components/home/FeeTransparency';
import { CTA } from '@/components/home/CTA';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

export default function Index() {
  return (
    <>
      <Hero />
      <SimpleValueProps />
      <FeaturedProperties />
      <HowItWorks />
      <TrustSignals />
      <FeeTransparency />
      <EnhancedFAQ />
      <CTA />
      <PWAInstallPrompt />
    </>
  );
}