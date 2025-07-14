import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Stats } from '@/components/home/Stats';
import { TrustSignals } from '@/components/home/TrustSignals';
import { CTA } from '@/components/home/CTA';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { PersonalizedGreeting, MOCK_USER_PROGRESS } from '@/components/ux/personalized-greeting';
import { TrustAnchors } from '@/components/ux/trust-anchors';
import { ContextualQuickActions } from '@/components/ux/quick-actions';
import { EnhancedFeedback, useFeedback } from '@/components/ux/enhanced-feedback';

export default function Index() {
  const { feedback, showSuccess } = useFeedback();

  // Mock user for demonstration - matching the Nexus Mint dashboard
  const mockUser = {
    firstName: 'Ahmed',
    lastName: 'Al-Rashid', 
    preferredName: 'Ahmed',
    joinedAt: '2024-01-15',
    totalInvested: 25000,
    currentReturns: 3200,
    avatar: '/api/placeholder/64/64',
    memberSince: 'Jan 2024',
    streak: 7,
    verificationProgress: 75,
    investmentGoal: { current: 15000, target: 50000, targetDate: '12/30/2024' }
  };

  return (
    <>
      {/* Enhanced Feedback System */}
      {feedback && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <EnhancedFeedback {...feedback} />
        </div>
      )}

      {/* Personalized Dashboard Greeting - Main Feature */}
      <div className="container mx-auto px-4 pt-8">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Working late, {mockUser.preferredName}? Your investments are working too! 💼
              </h1>
              <p className="text-muted-foreground mb-2">
                Your investments are generating returns! You've earned ${mockUser.currentReturns.toLocaleString()} so far. 📈
              </p>
              <p className="text-sm text-accent font-medium">
                🔥 {mockUser.streak} day streak! Keep it up! 🔥
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-semibold">{mockUser.memberSince}</p>
            </div>
          </div>
        </div>

        <PersonalizedGreeting 
          user={mockUser}
          progress={MOCK_USER_PROGRESS}
          variant="full"
        />
      </div>

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
      
      {/* Context-Aware Quick Actions */}
      <ContextualQuickActions 
        position="bottom-right"
        variant="floating"
        collapsible={true}
      />
      
      <PWAInstallPrompt />
    </>
  );
}