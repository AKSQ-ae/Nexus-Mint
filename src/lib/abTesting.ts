import { createComponentLogger } from './logger';

const logger = createComponentLogger('ABTesting');

// A/B Testing Configuration Types
interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  trafficSplit: number; // 0-100 percentage
  startDate: Date;
  endDate?: Date;
  variants: ExperimentVariant[];
  targetAudience?: AudienceConfig;
  metrics: MetricConfig[];
}

interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage allocation
  config: Record<string, any>;
}

interface AudienceConfig {
  include?: AudienceRule[];
  exclude?: AudienceRule[];
}

interface AudienceRule {
  type: 'location' | 'device' | 'browser' | 'userSegment' | 'custom';
  operator: 'equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

interface MetricConfig {
  id: string;
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'retention';
  goal: 'increase' | 'decrease';
  primary?: boolean;
}

interface UserAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  sessionId: string;
}

interface ExperimentResult {
  experimentId: string;
  variantId: string;
  metric: string;
  value: number;
  timestamp: Date;
  userId: string;
  sessionId: string;
}

// A/B Testing Manager
class ABTestingManager {
  private experiments = new Map<string, ExperimentConfig>();
  private userAssignments = new Map<string, Map<string, UserAssignment>>();
  private results: ExperimentResult[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadExperiments();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize with experiment configurations
  initializeExperiments(experiments: ExperimentConfig[]): void {
    experiments.forEach(experiment => {
      this.experiments.set(experiment.id, experiment);
    });
    logger.info('Experiments initialized', { count: experiments.length });
  }

  // Get variant for user in an experiment
  getVariant(experimentId: string, userId: string): string | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      logger.warn('Experiment not found', { experimentId });
      return null;
    }

    // Check if experiment is running
    if (experiment.status !== 'running') {
      return null;
    }

    // Check if user is in target audience
    if (!this.isUserInAudience(userId, experiment.targetAudience)) {
      return null;
    }

    // Check existing assignment
    const userExperiments = this.userAssignments.get(userId);
    if (userExperiments?.has(experimentId)) {
      return userExperiments.get(experimentId)!.variantId;
    }

    // Check traffic split
    if (!this.shouldIncludeUser(experiment.trafficSplit)) {
      return null;
    }

    // Assign user to variant
    const variantId = this.assignUserToVariant(experiment, userId);
    this.recordAssignment(userId, experimentId, variantId);

    logger.debug('User assigned to variant', { userId, experimentId, variantId });
    return variantId;
  }

  private isUserInAudience(userId: string, audience?: AudienceConfig): boolean {
    if (!audience) return true;

    // Check include rules
    if (audience.include && !this.matchesAnyRule(userId, audience.include)) {
      return false;
    }

    // Check exclude rules
    if (audience.exclude && this.matchesAnyRule(userId, audience.exclude)) {
      return false;
    }

    return true;
  }

  private matchesAnyRule(userId: string, rules: AudienceRule[]): boolean {
    return rules.some(rule => this.matchesRule(userId, rule));
  }

  private matchesRule(userId: string, rule: AudienceRule): boolean {
    // Simplified rule matching - would be expanded based on needs
    switch (rule.type) {
      case 'location':
        // Would check user's location
        return true;
      case 'device':
        // Would check user's device
        return true;
      case 'userSegment':
        // Would check user's segment
        return true;
      default:
        return true;
    }
  }

  private shouldIncludeUser(trafficSplit: number): boolean {
    return Math.random() * 100 < trafficSplit;
  }

  private assignUserToVariant(experiment: ExperimentConfig, userId: string): string {
    const hash = this.hashUserId(userId + experiment.id);
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    const randomValue = hash % totalWeight;

    let currentWeight = 0;
    for (const variant of experiment.variants) {
      currentWeight += variant.weight;
      if (randomValue < currentWeight) {
        return variant.id;
      }
    }

    // Fallback to first variant
    return experiment.variants[0].id;
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private recordAssignment(userId: string, experimentId: string, variantId: string): void {
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }

    const assignment: UserAssignment = {
      userId,
      experimentId,
      variantId,
      assignedAt: new Date(),
      sessionId: this.sessionId
    };

    this.userAssignments.get(userId)!.set(experimentId, assignment);

    // Store in localStorage for persistence
    this.persistAssignment(assignment);
  }

  private persistAssignment(assignment: UserAssignment): void {
    try {
      const stored = localStorage.getItem('nexus_ab_assignments') || '{}';
      const assignments = JSON.parse(stored);
      
      if (!assignments[assignment.userId]) {
        assignments[assignment.userId] = {};
      }
      
      assignments[assignment.userId][assignment.experimentId] = assignment;
      localStorage.setItem('nexus_ab_assignments', JSON.stringify(assignments));
    } catch (error) {
      logger.error('Failed to persist assignment', error);
    }
  }

  private loadExperiments(): void {
    try {
      const stored = localStorage.getItem('nexus_ab_assignments');
      if (stored) {
        const assignments = JSON.parse(stored);
        Object.entries(assignments).forEach(([userId, userExperiments]: [string, any]) => {
          const userMap = new Map<string, UserAssignment>();
          Object.entries(userExperiments).forEach(([experimentId, assignment]: [string, any]) => {
            userMap.set(experimentId, assignment);
          });
          this.userAssignments.set(userId, userMap);
        });
      }
    } catch (error) {
      logger.error('Failed to load experiments', error);
    }
  }

  // Track experiment result/conversion
  trackResult(experimentId: string, userId: string, metric: string, value: number = 1): void {
    const userExperiments = this.userAssignments.get(userId);
    const assignment = userExperiments?.get(experimentId);

    if (!assignment) {
      logger.warn('No assignment found for result tracking', { experimentId, userId });
      return;
    }

    const result: ExperimentResult = {
      experimentId,
      variantId: assignment.variantId,
      metric,
      value,
      timestamp: new Date(),
      userId,
      sessionId: this.sessionId
    };

    this.results.push(result);
    logger.debug('Experiment result tracked', result);

    // Send to analytics service
    this.sendResultToAnalytics(result);
  }

  private sendResultToAnalytics(result: ExperimentResult): void {
    // Send to external analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'experiment_result', {
        experiment_id: result.experimentId,
        variant_id: result.variantId,
        metric: result.metric,
        value: result.value
      });
    }
  }

  // Get experiment statistics
  getExperimentStats(experimentId: string): ExperimentStats | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const stats: ExperimentStats = {
      experimentId,
      totalUsers: 0,
      variants: {},
      confidence: 0,
      significance: false
    };

    // Calculate stats for each variant
    experiment.variants.forEach(variant => {
      const variantResults = this.results.filter(r => 
        r.experimentId === experimentId && r.variantId === variant.id
      );

      const uniqueUsers = new Set(variantResults.map(r => r.userId)).size;
      const totalConversions = variantResults.length;
      const conversionRate = uniqueUsers > 0 ? (totalConversions / uniqueUsers) * 100 : 0;

      stats.variants[variant.id] = {
        name: variant.name,
        users: uniqueUsers,
        conversions: totalConversions,
        conversionRate,
        revenue: variantResults.reduce((sum, r) => sum + r.value, 0)
      };

      stats.totalUsers += uniqueUsers;
    });

    // Calculate statistical significance (simplified)
    stats.confidence = this.calculateConfidence(stats.variants);
    stats.significance = stats.confidence > 95;

    return stats;
  }

  private calculateConfidence(variants: Record<string, VariantStats>): number {
    // Simplified confidence calculation
    // In production, would use proper statistical tests
    const variantIds = Object.keys(variants);
    if (variantIds.length < 2) return 0;

    const sampleSizes = variantIds.map(id => variants[id].users);
    const minSampleSize = Math.min(...sampleSizes);
    
    // Simple heuristic based on sample size
    if (minSampleSize < 100) return 0;
    if (minSampleSize < 500) return 85;
    if (minSampleSize < 1000) return 92;
    return 95;
  }

  // Feature flag functionality
  isFeatureEnabled(featureId: string, userId: string): boolean {
    // Check if there's an experiment for this feature
    const variant = this.getVariant(featureId, userId);
    return variant === 'enabled' || variant === 'treatment';
  }

  // Get feature configuration
  getFeatureConfig(featureId: string, userId: string): Record<string, any> {
    const experiment = this.experiments.get(featureId);
    if (!experiment) return {};

    const variantId = this.getVariant(featureId, userId);
    if (!variantId) return {};

    const variant = experiment.variants.find(v => v.id === variantId);
    return variant?.config || {};
  }
}

interface ExperimentStats {
  experimentId: string;
  totalUsers: number;
  variants: Record<string, VariantStats>;
  confidence: number;
  significance: boolean;
}

interface VariantStats {
  name: string;
  users: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

// Global A/B testing manager
export const abTestingManager = new ABTestingManager();

// React hooks for A/B testing
export function useExperiment(experimentId: string, userId?: string): {
  variant: string | null;
  trackResult: (metric: string, value?: number) => void;
  isLoading: boolean;
} {
  const [variant, setVariant] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const effectiveUserId = userId || 'anonymous';

  React.useEffect(() => {
    const assignedVariant = abTestingManager.getVariant(experimentId, effectiveUserId);
    setVariant(assignedVariant);
    setIsLoading(false);
  }, [experimentId, effectiveUserId]);

  const trackResult = React.useCallback((metric: string, value: number = 1) => {
    abTestingManager.trackResult(experimentId, effectiveUserId, metric, value);
  }, [experimentId, effectiveUserId]);

  return { variant, trackResult, isLoading };
}

export function useFeatureFlag(featureId: string, userId?: string): boolean {
  const [isEnabled, setIsEnabled] = React.useState(false);

  const effectiveUserId = userId || 'anonymous';

  React.useEffect(() => {
    const enabled = abTestingManager.isFeatureEnabled(featureId, effectiveUserId);
    setIsEnabled(enabled);
  }, [featureId, effectiveUserId]);

  return isEnabled;
}

export function useFeatureConfig<T = Record<string, any>>(
  featureId: string, 
  userId?: string
): T {
  const [config, setConfig] = React.useState<T>({} as T);

  const effectiveUserId = userId || 'anonymous';

  React.useEffect(() => {
    const featureConfig = abTestingManager.getFeatureConfig(featureId, effectiveUserId);
    setConfig(featureConfig as T);
  }, [featureId, effectiveUserId]);

  return config;
}

// Predefined experiments
const defaultExperiments: ExperimentConfig[] = [
  {
    id: 'investment_flow_v2',
    name: 'Investment Flow V2',
    description: 'Test new streamlined investment flow',
    status: 'running',
    trafficSplit: 50,
    startDate: new Date('2024-12-01'),
    variants: [
      {
        id: 'control',
        name: 'Original Flow',
        description: 'Current investment flow',
        weight: 50,
        config: { version: 'original' }
      },
      {
        id: 'streamlined',
        name: 'Streamlined Flow',
        description: 'New simplified investment flow',
        weight: 50,
        config: { version: 'streamlined', steps: 3 }
      }
    ],
    metrics: [
      {
        id: 'investment_completion',
        name: 'Investment Completion Rate',
        type: 'conversion',
        goal: 'increase',
        primary: true
      }
    ]
  },
  {
    id: 'property_card_design',
    name: 'Property Card Design',
    description: 'Test different property card layouts',
    status: 'running',
    trafficSplit: 100,
    startDate: new Date('2024-12-01'),
    variants: [
      {
        id: 'grid',
        name: 'Grid Layout',
        description: 'Traditional grid layout',
        weight: 33,
        config: { layout: 'grid', showROI: true }
      },
      {
        id: 'list',
        name: 'List Layout',
        description: 'Detailed list layout',
        weight: 33,
        config: { layout: 'list', showDetails: true }
      },
      {
        id: 'card',
        name: 'Card Layout',
        description: 'Enhanced card layout',
        weight: 34,
        config: { layout: 'card', showProgress: true }
      }
    ],
    metrics: [
      {
        id: 'property_click_through',
        name: 'Property Click-through Rate',
        type: 'engagement',
        goal: 'increase',
        primary: true
      }
    ]
  },
  {
    id: 'ai_assistant_placement',
    name: 'AI Assistant Placement',
    description: 'Test different AI assistant positions',
    status: 'running',
    trafficSplit: 75,
    startDate: new Date('2024-12-01'),
    variants: [
      {
        id: 'bottom_right',
        name: 'Bottom Right',
        description: 'Traditional bottom right placement',
        weight: 50,
        config: { position: 'bottom-right' }
      },
      {
        id: 'sidebar',
        name: 'Sidebar',
        description: 'Integrated sidebar placement',
        weight: 50,
        config: { position: 'sidebar', integrated: true }
      }
    ],
    metrics: [
      {
        id: 'ai_engagement',
        name: 'AI Assistant Engagement',
        type: 'engagement',
        goal: 'increase',
        primary: true
      }
    ]
  }
];

// Initialize experiments
abTestingManager.initializeExperiments(defaultExperiments);

// Component wrapper for A/B testing
export function ExperimentWrapper({ 
  experimentId, 
  userId, 
  children 
}: { 
  experimentId: string; 
  userId?: string; 
  children: (variant: string | null, trackResult: (metric: string, value?: number) => void) => React.ReactNode;
}) {
  const { variant, trackResult, isLoading } = useExperiment(experimentId, userId);

  if (isLoading) {
    return <div>Loading experiment...</div>;
  }

  return <>{children(variant, trackResult)}</>;
}

// Analytics dashboard data
export function getExperimentDashboardData(): {
  experiments: ExperimentStats[];
  totalUsers: number;
  activeExperiments: number;
} {
  const experiments: ExperimentStats[] = [];
  let totalUsers = 0;
  let activeExperiments = 0;

  abTestingManager['experiments'].forEach((experiment, id) => {
    if (experiment.status === 'running') {
      activeExperiments++;
      const stats = abTestingManager.getExperimentStats(id);
      if (stats) {
        experiments.push(stats);
        totalUsers += stats.totalUsers;
      }
    }
  });

  return {
    experiments,
    totalUsers,
    activeExperiments
  };
}

// Export for external use
export { abTestingManager };

logger.info('A/B Testing framework initialized');