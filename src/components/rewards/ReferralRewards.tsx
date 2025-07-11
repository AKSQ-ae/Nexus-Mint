import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift,
  Users,
  Copy,
  Share,
  Trophy,
  Coins,
  TrendingUp,
  Check,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ReferralRewards() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const referralCode = "NX-REF-2024-USER";
  const referralLink = `https://nexus-mint.com/signup?ref=${referralCode}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Nexus - Real Estate Investment Platform',
          text: 'Start investing in tokenized real estate with just $100. Get bonus tokens when you join!',
          url: referralLink,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  const rewards = [
    {
      tier: "Bronze",
      referrals: 3,
      bonus: "50 NXT",
      progress: 66,
      benefits: ["5% bonus on first investment", "Priority support"]
    },
    {
      tier: "Silver", 
      referrals: 10,
      bonus: "200 NXT",
      progress: 30,
      benefits: ["10% bonus on investments", "Exclusive properties access"]
    },
    {
      tier: "Gold",
      referrals: 25,
      bonus: "500 NXT", 
      progress: 12,
      benefits: ["15% bonus", "VIP support", "Early property access"]
    },
    {
      tier: "Platinum",
      referrals: 50,
      bonus: "1,500 NXT",
      progress: 6,
      benefits: ["20% bonus", "Private advisor", "Premium analytics"]
    }
  ];

  const recentReferrals = [
    { name: "John D.", date: "2 days ago", status: "verified", reward: "25 NXT" },
    { name: "Sarah M.", date: "1 week ago", status: "invested", reward: "25 NXT" },
    { name: "Mike R.", date: "2 weeks ago", status: "pending", reward: "0 NXT" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Referral Rewards</h2>
          <p className="text-muted-foreground">Earn NXT tokens for every successful referral</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="share">Share & Earn</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens Earned</p>
                    <p className="text-2xl font-bold">350 NXT</p>
                  </div>
                  <Coins className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Tier</p>
                    <p className="text-2xl font-bold">Silver</p>
                  </div>
                  <Trophy className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">83%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tier Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Tier Progress
              </CardTitle>
              <CardDescription>Complete more referrals to unlock higher rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {rewards.map((reward, index) => (
                  <Card key={index} className={`border-2 ${index === 1 ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center">
                          <Badge variant={index === 1 ? "default" : "outline"}>
                            {reward.tier}
                          </Badge>
                          {index === 1 && <Badge className="ml-2 bg-green-500">Current</Badge>}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Reward</p>
                          <p className="text-lg font-bold text-primary">{reward.bonus}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Required</p>
                          <p className="font-medium">{reward.referrals} referrals</p>
                        </div>
                        <div className="space-y-1">
                          <Progress value={reward.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">{reward.progress}% complete</p>
                        </div>
                        <div className="text-xs space-y-1">
                          {reward.benefits.map((benefit, idx) => (
                            <p key={idx} className="text-muted-foreground">• {benefit}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Share Your Referral Link
              </CardTitle>
              <CardDescription>
                Both you and your friend get 25 NXT tokens when they complete their first investment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Referral Code</label>
                <div className="flex gap-2">
                  <Input value={referralCode} readOnly className="font-mono" />
                  <Button 
                    onClick={() => copyToClipboard(referralCode)}
                    variant="outline"
                    size="icon"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Referral Link</label>
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly className="text-xs" />
                  <Button 
                    onClick={() => copyToClipboard(referralLink)}
                    variant="outline"
                    size="icon"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={shareLink} className="flex-1">
                  <Share className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
                <Button variant="outline" className="flex-1">
                  <Gift className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li>1. Share your unique referral link</li>
                  <li>2. Friend signs up and completes KYC</li>
                  <li>3. Friend makes their first investment ($100+ minimum)</li>
                  <li>4. Both of you receive 25 NXT tokens instantly</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Referrals
              </CardTitle>
              <CardDescription>Track your referral activity and rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReferrals.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{referral.name}</p>
                        <p className="text-sm text-muted-foreground">{referral.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        referral.status === 'invested' ? 'default' : 
                        referral.status === 'verified' ? 'secondary' : 'outline'
                      }>
                        {referral.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">{referral.reward}</p>
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