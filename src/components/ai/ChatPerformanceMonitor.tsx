import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMetrics {
  responseTime: number;
  intentAccuracy: number;
  successfulFlows: number;
  errorRate: number;
  userSatisfaction: number;
}

export class ChatPerformanceMonitor {
  private static metrics: ChatMetrics = {
    responseTime: 0,
    intentAccuracy: 0,
    successfulFlows: 0,
    errorRate: 0,
    userSatisfaction: 0
  };

  static startTimer(): number {
    return performance.now();
  }

  static endTimer(startTime: number): number {
    return performance.now() - startTime;
  }

  static async logInteraction(data: {
    userMessage: string;
    aiResponse: string;
    intentDetected: string;
    responseTime: number;
    success: boolean;
    userId?: string;
  }) {
    try {
      const { error } = await supabase
        .from('ai_interactions')
        .insert({
          user_message: data.userMessage,
          ai_response: data.aiResponse,
          intent_detected: data.intentDetected,
          response_time_ms: data.responseTime,
          confidence_score: data.success ? 0.95 : 0.3,
          user_id: data.userId,
          session_id: this.generateSessionId(),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging interaction:', error);
      }
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  }

  static async trackFlowCompletion(flowType: string, success: boolean, userId?: string) {
    try {
      const { error } = await supabase
        .from('ai_interactions')
        .insert({
          user_message: `Flow: ${flowType}`,
          ai_response: success ? 'Flow completed successfully' : 'Flow failed',
          intent_detected: flowType,
          outcome_tracked: true,
          outcome_result: success ? 'success' : 'failure',
          outcome_date: new Date().toISOString(),
          user_id: userId,
          session_id: this.generateSessionId()
        });

      if (error) {
        console.error('Error tracking flow:', error);
      }
    } catch (error) {
      console.error('Failed to track flow:', error);
    }
  }

  static async getUserSatisfactionScore(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('ai_interactions')
        .select('user_feedback')
        .eq('user_id', userId)
        .not('user_feedback', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        return 0;
      }

      const avgFeedback = data.reduce((sum, item) => sum + (item.user_feedback || 0), 0) / data.length;
      return avgFeedback;
    } catch (error) {
      console.error('Error getting satisfaction score:', error);
      return 0;
    }
  }

  static async getPerformanceMetrics(): Promise<ChatMetrics> {
    try {
      const { data, error } = await supabase
        .from('ai_interactions')
        .select('response_time_ms, intent_detected, confidence_score, user_feedback, outcome_result')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error || !data) {
        return this.metrics;
      }

      const total = data.length;
      if (total === 0) return this.metrics;

      const avgResponseTime = data.reduce((sum, item) => sum + (item.response_time_ms || 0), 0) / total;
      const highConfidenceCount = data.filter(item => (item.confidence_score || 0) > 0.8).length;
      const successfulFlows = data.filter(item => item.outcome_result === 'success').length;
      const errorCount = data.filter(item => item.outcome_result === 'failure').length;
      const avgSatisfaction = data
        .filter(item => item.user_feedback !== null)
        .reduce((sum, item) => sum + (item.user_feedback || 0), 0) / 
        data.filter(item => item.user_feedback !== null).length || 0;

      this.metrics = {
        responseTime: avgResponseTime,
        intentAccuracy: (highConfidenceCount / total) * 100,
        successfulFlows,
        errorRate: (errorCount / total) * 100,
        userSatisfaction: avgSatisfaction
      };

      return this.metrics;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return this.metrics;
    }
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static isPerformanceOptimal(): boolean {
    const { responseTime, intentAccuracy, errorRate, userSatisfaction } = this.metrics;
    return (
      responseTime < 2000 && // Less than 2 seconds
      intentAccuracy > 85 && // Above 85% accuracy
      errorRate < 5 && // Less than 5% errors
      userSatisfaction > 4 // Above 4/5 satisfaction
    );
  }
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<ChatMetrics | null>(null);
  const [isOptimal, setIsOptimal] = useState(true);

  useEffect(() => {
    const updateMetrics = async () => {
      const newMetrics = await ChatPerformanceMonitor.getPerformanceMetrics();
      setMetrics(newMetrics);
      setIsOptimal(ChatPerformanceMonitor.isPerformanceOptimal());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return { metrics, isOptimal };
}