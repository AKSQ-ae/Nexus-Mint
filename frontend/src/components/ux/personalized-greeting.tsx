import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Star,
  Trophy,
  Gift,
  Clock,
  Target,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProgress {
  kycProgress: number;
  profileCompletion: number;
  investmentGoal?: {
    target: number;
    current: number;
    deadline?: string;
  };
  pendingTasks: PendingTask[];
  achievements: Achievement[];
  streak?: number;
}

interface PendingTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  href?: string;
  onClick?: () => void;
  estimatedTime?: string;
  reward?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlockedAt: string;
  isNew?: boolean;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface PersonalizedGreetingProps {
  user?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    joinedAt?: string;
    totalInvested?: number;
    currentReturns?: number;
    preferredName?: string;
  };
  progress?: UserProgress;
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export function PersonalizedGreeting({
  user,
  progress,
  className,
  variant = 'full',
  timeOfDay
}: PersonalizedGreetingProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeOfDay = () => {
    if (timeOfDay) return timeOfDay;
    
    const hour = currentTime.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  };

  const getGreeting = () => {
    const period = getTimeOfDay();
    const name = user?.preferredName || user?.firstName || 'Friend';
    
    const greetings = {
      morning: [`Good morning, ${name}! ☀️`, `Rise and shine, ${name}! 🌅`, `Morning, ${name}! Ready to grow your wealth? 💰`],
      afternoon: [`Good afternoon, ${name}! 🌤️`, `Hope your day is going well, ${name}! ✨`, `Afternoon, ${name}! Time to check your investments? 📈`],
      evening: [`Good evening, ${name}! 🌙`, `Evening, ${name}! Perfect time to review your portfolio 📊`, `Welcome back, ${name}! 🌆`],
      night: [`Good evening, ${name}! 🌃`, `Working late, ${name}? Your investments are working too! 💼`, `Night owl, ${name}? Your portfolio never sleeps! 🦉`]
    };

    const options = greetings[period];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getMotivationalMessage = () => {
    if (!user) return "Welcome to the Nexus Mint family! Let's start building your property portfolio.";
    
    if (user.totalInvested && user.totalInvested > 0) {
      if (user.currentReturns && user.currentReturns > 0) {
        return `Your investments are generating returns! You've earned $${user.currentReturns.toLocaleString()} so far. 📈`;
      }
      return `You're building something amazing with $${user.totalInvested.toLocaleString()} invested across premium properties. 🏡`;
    }
    
    if (progress?.kycProgress === 100) {
      return "You're all verified and ready to invest! Explore our curated property marketplace. 🚀";
    }
    
    if (progress?.kycProgress && progress.kycProgress > 0) {
      return `You're ${progress.kycProgress}% through verification. Almost ready to start investing! 🎯`;
    }
    
    return "Take the first step towards building generational wealth through smart property investing. 💎";
  };

  const getHighestPriorityTask = () => {
    if (!progress?.pendingTasks?.length) return null;
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return progress.pendingTasks.sort((a, b) => 
      priorityOrder[b.priority] - priorityOrder[a.priority]
    )[0];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'bronze': return 'text-orange-600';
      case 'silver': return 'text-gray-600';
      case 'gold': return 'text-yellow-600';
      case 'platinum': return 'text-purple-600';
      default: return 'text-primary';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {user?.avatar && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.firstName} />
            <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
          </Avatar>
        )}
        <div>
          <div className="font-medium text-sm">{getGreeting()}</div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    const topTask = getHighestPriorityTask();
    
    return (
      <Card className={cn("border-border/50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            {user?.avatar && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.firstName} />
                <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1">
              <div className="font-semibold">{getGreeting()}</div>
              <div className="text-sm text-muted-foreground">{getMotivationalMessage()}</div>
            </div>
          </div>
          
          {topTask && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className={cn("h-4 w-4", getPriorityColor(topTask.priority))} />
                  <span className="font-medium text-sm">{topTask.title}</span>
                </div>
                <div className="text-xs text-muted-foreground">{topTask.description}</div>
              </div>
              <Button size="sm" variant="outline" className="ml-3">
                {topTask.action}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Greeting Card */}
      <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {user?.avatar && (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.firstName} />
                  <AvatarFallback className="text-lg">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                </Avatar>
              )}
              
              <div>
                <h1 className="text-2xl font-bold mb-2">{getGreeting()}</h1>
                <p className="text-muted-foreground mb-3">{getMotivationalMessage()}</p>
                
                {progress?.streak && progress.streak > 1 && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">
                      {progress.streak} day streak! Keep it up! 🔥
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {user?.joinedAt && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Member since</div>
                <div className="font-medium">
                  {new Date(user.joinedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* KYC Progress */}
          {progress.kycProgress < 100 && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Identity Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{progress.kycProgress}%</span>
                  </div>
                  <Progress value={progress.kycProgress} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    {progress.kycProgress === 100 ? 
                      "✅ Verification complete!" : 
                      "Complete verification to start investing"
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Investment Goal */}
          {progress.investmentGoal && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Investment Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      ${progress.investmentGoal.current.toLocaleString()} / ${progress.investmentGoal.target.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={(progress.investmentGoal.current / progress.investmentGoal.target) * 100} 
                    className="h-2" 
                  />
                  {progress.investmentGoal.deadline && (
                    <div className="text-sm text-muted-foreground">
                      Target date: {new Date(progress.investmentGoal.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pending Tasks */}
      {progress?.pendingTasks && progress.pendingTasks.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Next Steps ({progress.pendingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress.pendingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className={cn("h-4 w-4", getPriorityColor(task.priority))} />
                      <span className="font-medium text-sm">{task.title}</span>
                      {task.estimatedTime && (
                        <Badge variant="outline" className="text-xs">
                          {task.estimatedTime}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{task.description}</div>
                    {task.reward && (
                      <div className="text-xs text-primary">
                        <Gift className="h-3 w-3 inline mr-1" />
                        {task.reward}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="ml-3">
                    {task.action}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      {progress?.achievements && progress.achievements.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {progress.achievements.slice(0, 4).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className={cn("p-2 rounded-lg", getTierColor(achievement.tier))}>
                    <achievement.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{achievement.title}</span>
                      {achievement.isNew && (
                        <Badge variant="secondary" className="text-xs">New!</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Mock data for development/testing
export const MOCK_USER_PROGRESS: UserProgress = {
  kycProgress: 75,
  profileCompletion: 90,
  investmentGoal: {
    target: 50000,
    current: 15000,
    deadline: '2024-12-31'
  },
  pendingTasks: [
    {
      id: '1',
      title: 'Complete Address Verification',
      description: 'Upload a utility bill to complete your KYC process',
      priority: 'high',
      action: 'Upload Document',
      href: '/profile/kyc',
      estimatedTime: '2 min',
      reward: 'Unlock premium properties'
    },
    {
      id: '2',
      title: 'Set Investment Preferences',
      description: 'Help us recommend properties that match your goals',
      priority: 'medium',
      action: 'Set Preferences',
      href: '/profile/preferences',
      estimatedTime: '5 min'
    },
    {
      id: '3',
      title: 'Connect Your Wallet',
      description: 'Link a crypto wallet for seamless blockchain transactions',
      priority: 'low',
      action: 'Connect Wallet',
      estimatedTime: '1 min',
      reward: 'Lower transaction fees'
    }
  ],
  achievements: [
    {
      id: '1',
      title: 'Family Member',
      description: 'Welcome to Nexus Mint!',
      icon: Heart,
      unlockedAt: '2024-01-15',
      tier: 'bronze',
      isNew: true
    },
    {
      id: '2',
      title: 'Identity Verified',
      description: 'KYC process completed',
      icon: CheckCircle,
      unlockedAt: '2024-01-20',
      tier: 'silver'
    }
  ],
  streak: 7
};