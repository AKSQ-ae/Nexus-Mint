import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, 
  Share2, 
  Users, 
  Trophy, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail,
  TrendingUp,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  currentTier: string;
  nextTierThreshold: number;
  referralCode: string;
}

interface ReferralTier {
  name: string;
  threshold: number;
  reward: number;
  bonus: string;
  color: string;
}

export function ReferralProgram() {
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 8,
    successfulReferrals: 5,
    totalEarnings: 250,
    currentTier: 'Bronze',
    nextTierThreshold: 10,
    referralCode: 'NEXUS-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { toast } = useToast();

  const tiers: ReferralTier[] = [
    { name: 'Bronze', threshold: 0, reward: 50, bonus: '$25 signup bonus', color: 'text-amber-600' },
    { name: 'Silver', threshold: 10, reward: 75, bonus: '1.5x rewards', color: 'text-gray-500' },
    { name: 'Gold', threshold: 25, reward: 100, bonus: '2x rewards + VIP support', color: 'text-yellow-500' },
    { name: 'Platinum', threshold: 50, reward: 150, bonus: '3x rewards + exclusive events', color: 'text-purple-500' },
  ];

  const referralLink = `https://nexusmint.com/signup?ref=${stats.referralCode}`;

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      toast({
        title: "Copied!",
        description: `Referral ${type} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const text = "Join me on Nexus Mint - the future of real estate investing through tokenization!";
    const url = referralLink;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Join Nexus Mint!')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
  };

  const getCurrentTier = () => {
    return tiers.find(tier => 
      stats.successfulReferrals >= tier.threshold && 
      stats.successfulReferrals < (tiers.find(t => t.threshold > tier.threshold)?.threshold || Infinity)
    ) || tiers[0];
  };

  const getNextTier = () => {
    return tiers.find(tier => tier.threshold > stats.successfulReferrals);
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressToNext = nextTier ? (stats.successfulReferrals / nextTier.threshold) * 100 : 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Referral Program</h2>
        <p className="text-muted-foreground">
          Earn rewards by inviting friends to Nexus Mint
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulReferrals} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentTier.color}`}>
              {currentTier.name}
            </div>
            <p className="text-xs text-muted-foreground">
              ${currentTier.reward} per referral
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Tier Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextTier && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {nextTier.name}</span>
                <span>{stats.successfulReferrals}/{nextTier.threshold} referrals</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {nextTier.threshold - stats.successfulReferrals} more referrals to unlock {nextTier.bonus}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-3 rounded-lg border ${
                  tier.name === currentTier.name 
                    ? 'border-primary bg-primary/5' 
                    : stats.successfulReferrals >= tier.threshold
                    ? 'border-green-300 bg-green-50'
                    : 'border-muted'
                }`}
              >
                <div className={`font-semibold ${tier.color}`}>{tier.name}</div>
                <div className="text-sm text-muted-foreground">${tier.reward}/referral</div>
                <div className="text-xs">{tier.bonus}</div>
                {tier.name === currentTier.name && (
                  <Badge variant="default" className="mt-1 text-xs">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="share" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="share">Share & Earn</TabsTrigger>
          <TabsTrigger value="history">Referral History</TabsTrigger>
        </TabsList>

        <TabsContent value="share" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Your Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={stats.referralCode}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(stats.referralCode, 'code')}
                >
                  {copiedCode ? <span className="text-xs">Copied!</span> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(referralLink, 'link')}
                >
                  {copiedLink ? <span className="text-xs">Copied!</span> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('facebook')}
                  className="flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('linkedin')}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('email')}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <div className="font-medium">user{i}@example.com</div>
                      <div className="text-sm text-muted-foreground">
                        Joined {i} days ago
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={i <= stats.successfulReferrals ? "default" : "secondary"}>
                        {i <= stats.successfulReferrals ? "Completed" : "Pending"}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        ${i <= stats.successfulReferrals ? currentTier.reward : '0'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}