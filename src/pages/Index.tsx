import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { TrustSignals } from '@/components/home/TrustSignals';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
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
      
      <div data-section="features">
        <Features />
      </div>
      
      <PWAInstallPrompt />
    </>
  );
}