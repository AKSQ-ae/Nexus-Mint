import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Database, Mic, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  onConsent,
}) => {
  const [consents, setConsents] = useState({
    analytics: false,
    personalization: false,
    voiceData: false,
    dataRetention: false,
  });
  const [retentionDays, setRetentionDays] = useState(90);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConsentChange = (key: keyof typeof consents, checked: boolean) => {
    setConsents(prev => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = async () => {
    if (!consents.dataRetention) {
      toast({
        title: "Data retention consent required",
        description: "You must consent to data retention to use the AI assistant.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .update({
          consent_given: true,
          consent_date: new Date().toISOString(),
          data_retention_days: retentionDays,
          privacy_settings: {
            analytics: consents.analytics,
            personalization: consents.personalization,
            voice_data: consents.voiceData,
          },
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Consent recorded",
        description: "Your privacy preferences have been saved.",
      });
      
      onConsent();
      onClose();
    } catch (error) {
      console.error('Error saving consent:', error);
      toast({
        title: "Error",
        description: "Failed to save consent preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Data Consent
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Before using your AI Investment Buddy, please review and consent to how we handle your data:
          </p>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={consents.analytics}
                onCheckedChange={(checked) => handleConsentChange('analytics', checked as boolean)}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm font-medium">Analytics & Performance</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Track usage patterns to improve AI responses and user experience.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                checked={consents.personalization}
                onCheckedChange={(checked) => handleConsentChange('personalization', checked as boolean)}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Personalization</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Store conversation history and preferences to provide personalized advice.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                checked={consents.voiceData}
                onCheckedChange={(checked) => handleConsentChange('voiceData', checked as boolean)}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  <span className="text-sm font-medium">Voice Interactions</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Process voice commands and maintain voice conversation history.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                checked={consents.dataRetention}
                onCheckedChange={(checked) => handleConsentChange('dataRetention', checked as boolean)}
                className="border-destructive"
              />
              <div className="space-y-2">
                <span className="text-sm font-medium text-destructive">
                  Data Retention (Required)
                </span>
                <p className="text-xs text-muted-foreground">
                  Store your data for the selected period to provide AI assistance.
                </p>
                <div className="flex items-center gap-2">
                  <select
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>6 months</option>
                    <option value={365}>1 year</option>
                  </select>
                  <span className="text-xs text-muted-foreground">retention period</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p className="font-medium mb-1">Your Rights:</p>
            <p>• Request data export at any time</p>
            <p>• Request data deletion</p>
            <p>• Modify consent preferences</p>
            <p>• Data is encrypted and secure</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !consents.dataRetention}
              className="flex-1"
            >
              {loading ? "Saving..." : "Accept & Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};