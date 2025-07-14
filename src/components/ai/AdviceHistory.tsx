import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ThumbsUp,
  ThumbsDown,
  Target,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AdviceItem {
  interaction_id: string;
  user_message: string;
  ai_response: string;
  recommendation_type: string;
  reasoning_factors: string[];
  data_sources_used: string[];
  confidence_score: number;
  user_feedback: number | null;
  outcome_tracked: boolean;
  outcome_result: string | null;
  outcome_date: string | null;
  created_at: string;
  session_id: string;
}

export const AdviceHistory: React.FC = () => {
  const [adviceHistory, setAdviceHistory] = useState<AdviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadAdviceHistory();
  }, []);

  const loadAdviceHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_user_advice_history', {
        target_user_id: user.id
      });

      if (error) throw error;
      setAdviceHistory(data || []);
    } catch (error) {
      console.error('Error loading advice history:', error);
      toast({
        title: "Error",
        description: "Failed to load advice history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOutcome = async (interactionId: string, outcome: string) => {
    try {
      const { error } = await supabase
        .from('ai_interactions')
        .update({
          outcome_tracked: true,
          outcome_result: outcome,
          outcome_date: new Date().toISOString(),
        })
        .eq('id', interactionId);

      if (error) throw error;

      toast({
        title: "Outcome recorded",
        description: "Thank you for the feedback!",
      });

      // Refresh the data
      loadAdviceHistory();
    } catch (error) {
      console.error('Error updating outcome:', error);
      toast({
        title: "Error",
        description: "Failed to record outcome.",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOutcomeIcon = (outcome: string | null) => {
    if (!outcome) return <Clock className="h-4 w-4 text-muted-foreground" />;
    if (outcome === 'positive') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (outcome === 'negative') return <XCircle className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading advice history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            My Advice History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adviceHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No advice history yet. Start chatting with your AI buddy to see recommendations here!
            </p>
          ) : (
            <div className="space-y-4">
              {adviceHistory.map((item) => (
                <Card key={item.interaction_id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.recommendation_type}</Badge>
                          <span className={`text-sm font-medium ${getConfidenceColor(item.confidence_score)}`}>
                            {Math.round(item.confidence_score * 100)}% confidence
                          </span>
                          <div className="flex items-center gap-1">
                            {getOutcomeIcon(item.outcome_result)}
                            {item.outcome_result && (
                              <span className="text-xs text-muted-foreground">
                                {item.outcome_result}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.user_feedback === 1 && <ThumbsUp className="h-4 w-4 text-green-600" />}
                          {item.user_feedback === -1 && <ThumbsDown className="h-4 w-4 text-red-600" />}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>

                      {/* Question & Response */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Your Question:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            {item.user_message}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">AI Response:</p>
                          <p className="text-sm bg-primary/5 p-2 rounded">
                            {item.ai_response}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      <Collapsible>
                        <CollapsibleTrigger
                          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                          onClick={() => toggleExpanded(item.interaction_id)}
                        >
                          <Brain className="h-4 w-4" />
                          Why this recommendation?
                          {expandedItems.has(item.interaction_id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2">
                          {item.reasoning_factors && item.reasoning_factors.length > 0 && (
                            <div>
                              <p className="text-xs font-medium">Key Factors:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.reasoning_factors.map((factor, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.data_sources_used && item.data_sources_used.length > 0 && (
                            <div>
                              <p className="text-xs font-medium">Data Sources:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.data_sources_used.map((source, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Outcome Tracking */}
                      {!item.outcome_tracked && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <span className="text-xs text-muted-foreground">How did this work out?</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOutcome(item.interaction_id, 'positive')}
                            className="h-6 px-2 text-xs"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Helpful
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOutcome(item.interaction_id, 'negative')}
                            className="h-6 px-2 text-xs"
                          >
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Not helpful
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOutcome(item.interaction_id, 'neutral')}
                            className="h-6 px-2 text-xs"
                          >
                            Mixed
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};