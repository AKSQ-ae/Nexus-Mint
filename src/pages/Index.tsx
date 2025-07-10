import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { Stats } from '@/components/home/Stats';
import { CTA } from '@/components/home/CTA';

export default function Index() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <FeaturedProperties />
      <HowItWorks />
      <CTA />
    </>
  );
}