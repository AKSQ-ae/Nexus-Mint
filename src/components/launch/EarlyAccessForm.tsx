import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock, Gift, Mail, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import branding from '@/config/branding.config';

interface EarlyAccessData {
  email: string;
  fullName: string;
  company?: string;
  investmentExperience: string;
  investmentAmount: string;
  interests: string[];
  referralSource: string;
  message?: string;
  marketingConsent: boolean;
}

export function EarlyAccessForm() {
  const [formData, setFormData] = useState<EarlyAccessData>({
    email: '',
    fullName: '',
    company: '',
    investmentExperience: '',
    investmentAmount: '',
    interests: [],
    referralSource: '',
    message: '',
    marketingConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const investmentAmounts = [
    '$1,000 - $5,000',
    '$5,000 - $25,000',
    '$25,000 - $100,000',
    '$100,000 - $500,000',
    '$500,000+',
  ];

  const experienceLevels = [
    'New to investing',
    'Some experience',
    'Experienced investor',
    'Professional/Institutional',
  ];

  const interestOptions = [
    'Residential Properties',
    'Commercial Real Estate',
    'International Markets',
    'Sustainable Properties',
    'High-Growth Markets',
    'Income-Generating Assets',
  ];

  const referralSources = [
    'Social Media',
    'Search Engine',
    'Friend/Colleague',
    'Newsletter',
    'Website',
    'Other',
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // For now, we'll just show a success message
      // In a real implementation, you'd save to Supabase or send to your backend
      console.log('Early access form data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitted(true);
      toast({
        title: "Welcome to the waitlist!",
        description: "We'll notify you as soon as early access is available.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
          <p className="text-muted-foreground mb-6">
            {`Thank you for your interest in ${branding.shortName}. We'll send you exclusive updates and notify you as soon as early access becomes available.`}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Position #1,247</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Est. 2-3 weeks</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-gradient-hero text-primary-foreground">
            <Star className="w-3 h-3 mr-1" />
            Early Access
          </Badge>
        </div>
        <CardTitle className="text-2xl">{`Join the ${branding.shortName} Waitlist`}</CardTitle>
        <p className="text-muted-foreground">
          Be among the first to experience tokenized real estate investing
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company (Optional)
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="Your company name"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Investment Experience *</Label>
              <Select
                value={formData.investmentExperience}
                onValueChange={(value) => setFormData(prev => ({ ...prev, investmentExperience: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expected Investment Amount *</Label>
              <Select
                value={formData.investmentAmount}
                onValueChange={(value) => setFormData(prev => ({ ...prev, investmentAmount: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select amount range" />
                </SelectTrigger>
                <SelectContent>
                  {investmentAmounts.map((amount) => (
                    <SelectItem key={amount} value={amount}>
                      {amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Property Interests (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    checked={formData.interests.includes(interest)}
                    onCheckedChange={() => handleInterestToggle(interest)}
                  />
                  <Label htmlFor={interest} className="text-sm">
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>How did you hear about us? *</Label>
            <Select
              value={formData.referralSource}
              onValueChange={(value) => setFormData(prev => ({ ...prev, referralSource: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {referralSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell us about your investment goals or any questions you have..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketing"
              checked={formData.marketingConsent}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, marketingConsent: checked as boolean }))
              }
            />
            <Label htmlFor="marketing" className="text-sm">
              {`I agree to receive marketing communications and updates about ${branding.shortName}`}
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90"
            disabled={isSubmitting || !formData.email || !formData.fullName || !formData.investmentExperience || !formData.investmentAmount || !formData.referralSource}
          >
            {isSubmitting ? "Joining waitlist..." : "Join Early Access Waitlist"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By joining, you agree to our Terms of Service and Privacy Policy. 
            We'll only contact you with important updates about early access.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}