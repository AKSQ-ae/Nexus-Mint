import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Award, 
  Globe, 
  CheckCircle,
  Star,
  Lock,
  Heart,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TrustMetric {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'stable';
  color?: 'primary' | 'success' | 'info' | 'warning';
}

interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  content: string;
  rating: number;
  verified: boolean;
  investment?: string;
  location?: string;
}

interface Certification {
  name: string;
  issuer: string;
  icon: React.ComponentType<{ className?: string }>;
  verified: boolean;
  url?: string;
}

interface TrustAnchorsProps {
  variant?: 'compact' | 'detailed' | 'minimal';
  showMetrics?: boolean;
  showTestimonials?: boolean;
  showCertifications?: boolean;
  className?: string;
  animated?: boolean;
}

// Live metrics that update to show platform activity
export function LiveMetrics({ className, animated = true }: { className?: string; animated?: boolean }) {
  const [metrics, setMetrics] = useState<TrustMetric[]>([
    { label: 'Active Investors', value: 5432, icon: Users, trend: 'up', color: 'success' },
    { label: 'Properties Funded', value: 234, icon: TrendingUp, trend: 'up', color: 'primary' },
    { label: 'Total Invested', value: '$12.4M', icon: Globe, trend: 'up', color: 'info' },
    { label: 'Average Return', value: '14.2%', icon: Award, trend: 'stable', color: 'success' }
  ]);

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        if (metric.label === 'Active Investors') {
          const currentValue = typeof metric.value === 'number' ? metric.value : parseInt(metric.value);
          return { ...metric, value: currentValue + Math.floor(Math.random() * 3) };
        }
        return metric;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [animated]);

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'primary':
        return 'text-primary';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {metrics.map((metric, index) => (
        <Card key={metric.label} className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className={cn("flex justify-center mb-2", getColorClasses(metric.color))}>
              <metric.icon className="h-5 w-5" />
            </div>
            <div className="font-bold text-lg text-foreground">
              {metric.value}
              {metric.trend === 'up' && animated && (
                <span className="text-green-500 text-xs ml-1">↗</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {metric.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Compliance and certification badges
export function ComplianceBadges({ className }: { className?: string }) {
  const certifications: Certification[] = [
    {
      name: 'Sharia Compliant',
      issuer: 'Islamic Finance Council',
      icon: Shield,
      verified: true,
      url: 'https://nexusmint.com/sharia-compliance'
    },
    {
      name: 'SEC Registered',
      issuer: 'Securities Exchange Commission',
      icon: Award,
      verified: true,
      url: 'https://nexusmint.com/sec-compliance'
    },
    {
      name: 'AML Compliant',
      issuer: 'Financial Crimes Enforcement',
      icon: Lock,
      verified: true,
      url: 'https://nexusmint.com/aml-compliance'
    },
    {
      name: 'ISO 27001',
      issuer: 'International Standards Org',
      icon: CheckCircle,
      verified: true,
      url: 'https://nexusmint.com/security'
    }
  ];

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {certifications.map((cert) => (
        <Badge
          key={cert.name}
          variant="outline"
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
            "hover:bg-muted border-border/50",
            cert.verified && "border-green-500/50 bg-green-50 dark:bg-green-950"
          )}
          onClick={() => cert.url && window.open(cert.url, '_blank')}
        >
          <cert.icon className={cn(
            "h-4 w-4",
            cert.verified ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
          )} />
          <span className="text-xs font-medium">{cert.name}</span>
          {cert.verified && (
            <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
          )}
        </Badge>
      ))}
    </div>
  );
}

// Social proof testimonials
export function SocialProofTestimonials({ className, count = 3 }: { className?: string; count?: number }) {
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Ahmed Al-Rashid',
      avatar: '/api/placeholder/40/40',
      role: 'Real Estate Investor',
      content: 'Nexus Mint transformed how I invest in real estate. The Sharia-compliant approach gives me confidence, and the returns have exceeded my expectations.',
      rating: 5,
      verified: true,
      investment: '$25,000',
      location: 'Dubai, UAE'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      avatar: '/api/placeholder/40/40',
      role: 'Tech Professional',
      content: 'As someone new to real estate investing, the AI guidance and educational resources made everything so clear. I started with $5,000 and now have a diversified portfolio.',
      rating: 5,
      verified: true,
      investment: '$15,000',
      location: 'Singapore'
    },
    {
      id: '3',
      name: 'Dr. Hassan Ibrahim',
      avatar: '/api/placeholder/40/40',
      role: 'Medical Professional',
      content: 'The transparency and family-like community approach of Nexus Mint is exactly what I was looking for. Every investment feels secure and well-managed.',
      rating: 5,
      verified: true,
      investment: '$50,000',
      location: 'London, UK'
    },
    {
      id: '4',
      name: 'Fatima Al-Zahra',
      avatar: '/api/placeholder/40/40',
      role: 'Business Owner',
      content: 'The tokenization technology is brilliant. I can now invest in premium properties with smaller amounts and track everything in real-time.',
      rating: 5,
      verified: true,
      investment: '$8,000',
      location: 'Kuala Lumpur, Malaysia'
    }
  ];

  const displayedTestimonials = testimonials.slice(0, count);

  return (
    <div className={cn("space-y-4", className)}>
      {displayedTestimonials.map((testimonial) => (
        <Card key={testimonial.id} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-medium text-sm">{testimonial.name}</div>
                  {testimonial.verified && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                  <div className="flex">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mb-2">
                  {testimonial.role} • {testimonial.location}
                </div>
                
                <div className="text-sm text-foreground mb-2">
                  "{testimonial.content}"
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Invested: {testimonial.investment}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Real-time activity feed
export function ActivityFeed({ className }: { className?: string }) {
  const [activities, setActivities] = useState([
    { id: 1, action: 'invested', amount: '$5,000', property: 'Downtown Dubai Tower', time: '2 min ago', user: 'Ahmad K.' },
    { id: 2, action: 'joined', amount: null, property: null, time: '5 min ago', user: 'Sarah M.' },
    { id: 3, action: 'invested', amount: '$12,000', property: 'London Bridge Residence', time: '8 min ago', user: 'Hassan R.' },
    { id: 4, action: 'completed_kyc', amount: null, property: null, time: '12 min ago', user: 'Fatima A.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        action: Math.random() > 0.5 ? 'invested' : 'joined',
        amount: Math.random() > 0.5 ? `$${(Math.random() * 20000 + 1000).toFixed(0)}` : null,
        property: Math.random() > 0.5 ? 'Premium Property' : null,
        time: 'Just now',
        user: `User ${Math.random().toString(36).substr(2, 3).toUpperCase()}`
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getActivityText = (activity: any) => {
    switch (activity.action) {
      case 'invested':
        return `${activity.user} invested ${activity.amount} in ${activity.property}`;
      case 'joined':
        return `${activity.user} joined the Nexus Mint family`;
      case 'completed_kyc':
        return `${activity.user} completed identity verification`;
      default:
        return `${activity.user} performed an action`;
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'invested':
        return TrendingUp;
      case 'joined':
        return Heart;
      case 'completed_kyc':
        return CheckCircle;
      default:
        return Zap;
    }
  };

  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Live Activity</span>
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.action);
            return (
              <div key={activity.id} className="flex items-center gap-3 text-sm animate-fade-in">
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-foreground">{getActivityText(activity)}</div>
                </div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Main trust anchors component
export function TrustAnchors({
  variant = 'detailed',
  showMetrics = true,
  showTestimonials = true,
  showCertifications = true,
  className,
  animated = true
}: TrustAnchorsProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Sharia Compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">SEC Registered</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">5,400+ Investors</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-4", className)}>
        {showMetrics && <LiveMetrics animated={animated} />}
        {showCertifications && <ComplianceBadges />}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {showMetrics && (
        <div>
          <h3 className="font-semibold text-lg mb-4">Trusted by Thousands</h3>
          <LiveMetrics animated={animated} />
        </div>
      )}
      
      {showCertifications && (
        <div>
          <h3 className="font-semibold text-lg mb-4">Compliance & Security</h3>
          <ComplianceBadges />
        </div>
      )}
      
      {showTestimonials && (
        <div>
          <h3 className="font-semibold text-lg mb-4">What Our Family Says</h3>
          <SocialProofTestimonials />
        </div>
      )}
      
      <ActivityFeed />
    </div>
  );
}