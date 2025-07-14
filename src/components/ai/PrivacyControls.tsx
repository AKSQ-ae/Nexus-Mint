import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Download, Trash2, Database, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettings {
  analytics: boolean;
  personalization: boolean;
  voice_data: boolean;
}

export const PrivacyControls: React.FC = () => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    analytics: true,
    personalization: true,
    voice_data: false,
  });
  const [retentionDays, setRetentionDays] = useState(90);
  const [loading, setLoading] = useState(false);
  const [dataRequests, setDataRequests] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPrivacySettings();
    loadDataRequests();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('privacy_settings, data_retention_days')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.privacy_settings && typeof data.privacy_settings === 'object') {
        const settings = data.privacy_settings as Record<string, boolean>;
        setPrivacySettings({
          analytics: settings.analytics ?? true,
          personalization: settings.personalization ?? true,
          voice_data: settings.voice_data ?? false,
        });
      }
      if (data?.data_retention_days) {
        setRetentionDays(data.data_retention_days);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const loadDataRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_data_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDataRequests(data || []);
    } catch (error) {
      console.error('Error loading data requests:', error);
    }
  };

  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updatedSettings = { ...privacySettings, ...newSettings };

      const { error } = await supabase
        .from('user_profiles')
        .update({
          privacy_settings: updatedSettings,
          data_retention_days: retentionDays,
        })
        .eq('id', user.id);

      if (error) throw error;

      setPrivacySettings(updatedSettings);
      toast({
        title: "Settings updated",
        description: "Your privacy preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRetentionPeriod = async (days: number) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .update({ data_retention_days: days })
        .eq('id', user.id);

      if (error) throw error;

      setRetentionDays(days);
      toast({
        title: "Retention period updated",
        description: `Data will be retained for ${days} days.`,
      });
    } catch (error) {
      console.error('Error updating retention period:', error);
      toast({
        title: "Error",
        description: "Failed to update retention period.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestDataExport = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_data_requests')
        .insert({
          user_id: user.id,
          request_type: 'export',
        });

      if (error) throw error;

      toast({
        title: "Export requested",
        description: "We'll email you when your data export is ready (usually within 24 hours).",
      });

      loadDataRequests();
    } catch (error) {
      console.error('Error requesting data export:', error);
      toast({
        title: "Error",
        description: "Failed to request data export.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestDataDeletion = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_data_requests')
        .insert({
          user_id: user.id,
          request_type: 'delete',
        });

      if (error) throw error;

      toast({
        title: "Deletion requested",
        description: "Your data deletion request has been submitted. This cannot be undone.",
        variant: "destructive",
      });

      loadDataRequests();
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      toast({
        title: "Error",
        description: "Failed to request data deletion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const forgetConversations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('ai_interactions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Conversations cleared",
        description: "All AI conversation history has been deleted.",
      });
    } catch (error) {
      console.error('Error clearing conversations:', error);
      toast({
        title: "Error",
        description: "Failed to clear conversation history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Collection Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Data Collection</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="analytics">Analytics & Usage Data</Label>
                <p className="text-xs text-muted-foreground">
                  Help improve the AI by sharing anonymized usage patterns
                </p>
              </div>
              <Switch
                id="analytics"
                checked={privacySettings.analytics}
                onCheckedChange={(checked) => updatePrivacySettings({ analytics: checked })}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="personalization">Personalization</Label>
                <p className="text-xs text-muted-foreground">
                  Store preferences and conversation history for better recommendations
                </p>
              </div>
              <Switch
                id="personalization"
                checked={privacySettings.personalization}
                onCheckedChange={(checked) => updatePrivacySettings({ personalization: checked })}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="voice-data">Voice Data</Label>
                <p className="text-xs text-muted-foreground">
                  Process and store voice interactions for speech recognition
                </p>
              </div>
              <Switch
                id="voice-data"
                checked={privacySettings.voice_data}
                onCheckedChange={(checked) => updatePrivacySettings({ voice_data: checked })}
                disabled={loading}
              />
            </div>
          </div>

          {/* Data Retention */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Data Retention</h3>
            <div className="flex items-center gap-4">
              <Label htmlFor="retention" className="text-sm">
                Keep my data for:
              </Label>
              <Select
                value={retentionDays.toString()}
                onValueChange={(value) => updateRetentionPeriod(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={requestDataExport}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export My Data
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Clear Conversations
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all conversations?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your AI conversation history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={forgetConversations} disabled={loading}>
                    Clear Conversations
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all your data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your data including profile, investments, and conversation history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={requestDataDeletion} disabled={loading}>
                    Delete All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Recent Requests */}
          {dataRequests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Requests</h4>
              <div className="space-y-2">
                {dataRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{request.request_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};