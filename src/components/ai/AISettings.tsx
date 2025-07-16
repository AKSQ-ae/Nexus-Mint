import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Brain, Shield, Mic, Bell, Filter, Trash2 } from 'lucide-react';

interface AIPreferences {
  communication_style: string;
  learning_rate: string;
  risk_warnings_enabled: boolean;
  voice_enabled: boolean;
  notification_frequency: string;
  blacklisted_keywords: string[];
  preferred_markets: string[];
  data_retention_days: number;
}

const AISettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<AIPreferences>({
    communication_style: 'balanced',
    learning_rate: 'normal',
    risk_warnings_enabled: true,
    voice_enabled: true,
    notification_frequency: 'daily',
    blacklisted_keywords: [],
    preferred_markets: [],
    data_retention_days: 90
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newMarket, setNewMarket] = useState('');

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load AI preferences",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI preferences saved successfully"
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save AI preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !preferences.blacklisted_keywords.includes(newKeyword.trim())) {
      setPreferences(prev => ({
        ...prev,
        blacklisted_keywords: [...prev.blacklisted_keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setPreferences(prev => ({
      ...prev,
      blacklisted_keywords: prev.blacklisted_keywords.filter(k => k !== keyword)
    }));
  };

  const addMarket = () => {
    if (newMarket.trim() && !preferences.preferred_markets.includes(newMarket.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferred_markets: [...prev.preferred_markets, newMarket.trim()]
      }));
      setNewMarket('');
    }
  };

  const removeMarket = (market: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_markets: prev.preferred_markets.filter(m => m !== market)
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Communication Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Communication Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Advisor Personality</Label>
            <Select
              value={preferences.communication_style}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, communication_style: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cautious">Cautious Advisor - Conservative, risk-focused</SelectItem>
                <SelectItem value="balanced">Balanced Advisor - Moderate, well-rounded</SelectItem>
                <SelectItem value="aggressive">Growth Hacker - Aggressive, opportunity-focused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Learning Rate</Label>
            <Select
              value={preferences.learning_rate}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, learning_rate: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow - Gradual adaptation to your preferences</SelectItem>
                <SelectItem value="normal">Normal - Standard learning pace</SelectItem>
                <SelectItem value="fast">Fast - Quick adaptation and suggestions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Safety & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Safety & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Risk Warnings</Label>
              <p className="text-sm text-muted-foreground">Show warnings for high-risk investment strategies</p>
            </div>
            <Switch
              checked={preferences.risk_warnings_enabled}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, risk_warnings_enabled: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Data Retention</Label>
            <Select
              value={preferences.data_retention_days.toString()}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, data_retention_days: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">How long to keep your conversation history</p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Voice Chat</Label>
              <p className="text-sm text-muted-foreground">Enable voice conversations with your AI buddy</p>
            </div>
            <Switch
              checked={preferences.voice_enabled}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, voice_enabled: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Notification Frequency</Label>
            <Select
              value={preferences.notification_frequency}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, notification_frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily insights</SelectItem>
                <SelectItem value="weekly">Weekly summaries</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Content Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Blacklisted Keywords</Label>
            <p className="text-sm text-muted-foreground">AI will avoid mentioning these topics</p>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword to avoid..."
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.blacklisted_keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="gap-1">
                  {keyword}
                  <Trash2 
                    className="w-3 h-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeKeyword(keyword)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Markets</Label>
            <p className="text-sm text-muted-foreground">Focus AI suggestions on these markets</p>
            <div className="flex gap-2">
              <Input
                value={newMarket}
                onChange={(e) => setNewMarket(e.target.value)}
                placeholder="e.g., Dubai Marina, Downtown Dubai..."
                onKeyPress={(e) => e.key === 'Enter' && addMarket()}
              />
              <Button onClick={addMarket} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.preferred_markets.map((market) => (
                <Badge key={market} variant="outline" className="gap-1">
                  {market}
                  <Trash2 
                    className="w-3 h-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeMarket(market)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={savePreferences} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save AI Preferences'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISettings;