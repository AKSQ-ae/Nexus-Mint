import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Stats } from '@/components/home/Stats';
import { TrustSignals } from '@/components/home/TrustSignals';
import { CTA } from '@/components/home/CTA';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { TrustAnchors } from '@/components/ux/trust-anchors';
import { EnhancedFeedback, useFeedback } from '@/components/ux/enhanced-feedback';

export default function Index() {
  const { feedback, showSuccess } = useFeedback();

  return (
    <>
      {/* Enhanced Feedback System */}
      {feedback && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <EnhancedFeedback {...feedback} />
        </div>
      )}

      <div data-section="hero">
        <Hero />
      </div>
      
      {/* Trust Anchors - Building Family Culture */}
      <div className="container mx-auto px-4 py-12">
        <TrustAnchors 
          variant="detailed"
          showMetrics={true}
          showTestimonials={true}
          showCertifications={true}
          animated={true}
        />
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
      <div data-section="cta">
        <CTA />
      </div>
      
      {/* Quick Access to Investor Resources */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Need Help Getting Started?</h3>
          <p className="text-white/90 mb-4">Access our comprehensive investor resources and support center</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/investor-resources" 
               className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors">
              📚 Investor Resources
            </a>
            <a href="/early-access" 
               className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors">
              🚀 Join Early Access
            </a>
          </div>
        </div>
      </div>
      
      
      <PWAInstallPrompt />
    </>
  );
}