import { supabase } from '@/integrations/supabase/client';

export interface PropertySummary {
  id: string;
  title: string;
  tokenizationStatus: string;
  currentStep: number;
  totalSteps: number;
  estimatedCompletion?: string;
  lastUpdated: string;
}

export class TokenizationDataService {
  // Fetch property tokenization summary
  static async getPropertySummary(propertyId: string): Promise<PropertySummary | null> {
    try {
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id, title, tokenization_status, updated_at')
        .eq('id', propertyId)
        .maybeSingle();

      if (propertyError) throw propertyError;
      if (!property) return null;

      // Get tokenization process data
      const { data: process, error: processError } = await supabase
        .from('tokenization_processes')
        .select(`
          *,
          tokenization_steps(*)
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (processError) throw processError;

      const totalSteps = 5; // Default number of tokenization steps
      let currentStep = 1;
      let estimatedCompletion: string | undefined;

      if (process) {
        // Calculate current step based on completed steps
        const completedSteps = process.tokenization_steps?.filter(
          (step: any) => step.status === 'completed'
        ).length || 0;
        
        currentStep = Math.min(completedSteps + 1, totalSteps);
        estimatedCompletion = process.estimated_completion;
      }

      return {
        id: property.id,
        title: property.title,
        tokenizationStatus: property.tokenization_status || 'not_started',
        currentStep,
        totalSteps,
        estimatedCompletion,
        lastUpdated: property.updated_at
      };
    } catch (error) {
      console.error('Error fetching property summary:', error);
      return null;
    }
  }

  // Subscribe to real-time updates
  static subscribeToPropertyUpdates(
    propertyId: string, 
    callback: (summary: PropertySummary | null) => void
  ) {
    const channel = supabase
      .channel(`property-${propertyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tokenization_processes',
          filter: `property_id=eq.${propertyId}`
        },
        async () => {
          const summary = await this.getPropertySummary(propertyId);
          callback(summary);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tokenization_steps'
        },
        async () => {
          const summary = await this.getPropertySummary(propertyId);
          callback(summary);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Batch fetch multiple properties
  static async getMultiplePropertySummaries(propertyIds: string[]): Promise<PropertySummary[]> {
    const summaries = await Promise.all(
      propertyIds.map(id => this.getPropertySummary(id))
    );
    
    return summaries.filter(Boolean) as PropertySummary[];
  }
}