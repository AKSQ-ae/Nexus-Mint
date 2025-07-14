import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Stats } from '@/components/home/Stats';
import { TrustSignals } from '@/components/home/TrustSignals';
import { CTA } from '@/components/home/CTA';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FAQ } from '@/components/home/FAQ';
import { GlobalMarkets } from '@/components/home/GlobalMarkets';
import { FeeTransparency } from '@/components/home/FeeTransparency';

export default function Index() {
  return (
    <>
      <div data-section="hero">
        <Hero />
      </div>
      
      <div data-section="featured-properties">
        <FeaturedProperties />
      </div>
      
      <div data-section="stats">
        <Stats />
      </div>
      
      <div data-section="how-it-works">
        <HowItWorks />
      </div>
      
      <div data-section="global-markets">
        <GlobalMarkets />
      </div>
      
      <div data-section="trust-signals">
        <TrustSignals />
      </div>
      
      <div data-section="features">
        <Features />
      </div>
      
      <div data-section="fee-transparency">
        <FeeTransparency />
      </div>
      
      <div data-section="faq">
        <FAQ />
      </div>
      
      <div data-section="cta">
        <CTA />
      </div>
    </>
  );
}