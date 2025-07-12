import { useEffect } from 'react';
import { toast } from 'sonner';
import { Trophy, Star, TrendingUp, Crown } from 'lucide-react';

interface MilestoneToastProps {
  type: 'first_investment' | 'portfolio_milestone' | 'return_earned' | 'investment_goal';
  value?: number;
  currency?: string;
}

export function showMilestoneToast({ type, value, currency = 'USD' }: MilestoneToastProps) {
  const milestones = {
    first_investment: {
      icon: Star,
      title: "🎉 Welcome to Real Estate Investing!",
      message: "You've made your first property investment. Your journey begins now!",
      className: "bg-gradient-to-r from-success to-primary"
    },
    portfolio_milestone: {
      icon: TrendingUp,
      title: "🚀 Portfolio Milestone Reached!",
      message: `You've reached ${currency === 'USD' ? '$' : 'AED '}${value?.toLocaleString()} in total investments!`,
      className: "bg-gradient-to-r from-primary to-orange-accent"
    },
    return_earned: {
      icon: Trophy,
      title: "💰 Returns Earned!",
      message: `You've earned ${currency === 'USD' ? '$' : 'AED '}${value?.toLocaleString()} in returns!`,
      className: "bg-gradient-to-r from-warning to-orange-accent"
    },
    investment_goal: {
      icon: Crown,
      title: "👑 Investment Goal Achieved!",
      message: "Congratulations on reaching your investment target!",
      className: "bg-gradient-to-r from-primary via-primary to-orange-accent"
    }
  };

  const milestone = milestones[type];
  const Icon = milestone.icon;

  toast.custom((t) => (
    <div className={`
      ${milestone.className} 
      text-primary-foreground p-4 rounded-lg shadow-elegant min-w-[300px] max-w-[400px]
      border border-background/20 backdrop-blur-sm
    `}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">{milestone.title}</h3>
          <p className="text-xs opacity-90">{milestone.message}</p>
        </div>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-right'
  });
}

// Hook for milestone detection
export function useMilestoneTracking() {
  const checkMilestones = (
    totalInvested: number, 
    totalReturns: number, 
    investmentCount: number,
    previousTotalInvested: number = 0,
    previousTotalReturns: number = 0,
    previousInvestmentCount: number = 0
  ) => {
    // First investment milestone
    if (investmentCount === 1 && previousInvestmentCount === 0) {
      showMilestoneToast({ type: 'first_investment' });
    }

    // Portfolio milestones (every $1000 USD or 3500 AED)
    const usdMilestones = [1000, 5000, 10000, 25000, 50000, 100000];
    const aedMilestones = [3500, 18000, 35000, 90000, 180000, 350000];
    
    for (const milestone of usdMilestones) {
      if (totalInvested >= milestone && previousTotalInvested < milestone) {
        showMilestoneToast({ 
          type: 'portfolio_milestone', 
          value: milestone, 
          currency: 'USD' 
        });
        break;
      }
    }

    // Returns milestones
    const returnMilestones = [100, 500, 1000, 5000, 10000];
    for (const milestone of returnMilestones) {
      if (totalReturns >= milestone && previousTotalReturns < milestone) {
        showMilestoneToast({ 
          type: 'return_earned', 
          value: milestone, 
          currency: 'USD' 
        });
        break;
      }
    }
  };

  return { checkMilestones };
}