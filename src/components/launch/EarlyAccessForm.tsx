import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Star, 
  Users, 
  Clock, 
  Gift, 
  Mail, 
  User, 
  Building2, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

interface FormErrors {
  [key: string]: string;
}

export function EarlyAccessForm() {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const investmentAmounts = [
    { value: 'AED 500 - AED 2,500', label: 'AED 500 - AED 2,500', helper: 'Perfect for beginners' },
    { value: 'AED 2,500 - AED 10,000', label: 'AED 2,500 - AED 10,000', helper: 'Build your portfolio' },
    { value: 'AED 10,000 - AED 50,000', label: 'AED 10,000 - AED 50,000', helper: 'Serious investor' },
    { value: 'AED 50,000 - AED 250,000', label: 'AED 50,000 - AED 250,000', helper: 'High net worth' },
    { value: 'AED 250,000+', label: 'AED 250,000+', helper: 'Institutional level' },
  ];

  const experienceLevels = [
    { value: 'New to investing', label: 'New to investing', helper: 'Perfect for beginners' },
    { value: 'Some experience', label: 'Some experience', helper: '1-5 years investing' },
    { value: 'Experienced investor', label: 'Experienced investor', helper: '5+ years experience' },
    { value: 'Professional/Institutional', label: 'Professional/Institutional', helper: 'Industry professional' },
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

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (step === 2) {
      if (!formData.investmentExperience) newErrors.investmentExperience = 'Please select your experience level';
      if (!formData.investmentAmount) newErrors.investmentAmount = 'Please select your investment amount';
    }
    
    if (step === 3) {
      if (!formData.referralSource) newErrors.referralSource = 'Please tell us how you heard about us';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

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
    
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      <Card className="max-w-2xl mx-auto rounded-xl shadow-elegant">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
          <p className="text-muted-foreground mb-6">
            Thank you for your interest in Nexus Mint. We'll send you exclusive updates and notify you as soon as early access becomes available.
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
    <Card className="max-w-2xl mx-auto rounded-xl shadow-elegant">
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-gradient-hero text-primary-foreground">
            <Star className="w-3 h-3 mr-1" />
            Early Access
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold">Join the Nexus Mint Waitlist</CardTitle>
        <p className="text-muted-foreground">
          Be among the first to experience tokenized real estate investing
        </p>
        
        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Essential Contact */}
          {currentStep === 1 && (
            <div className="space-y-6" role="group" aria-labelledby="step1-heading">
              <div className="text-center mb-6">
                <h3 id="step1-heading" className="text-lg font-semibold mb-2">Contact Information</h3>
                <p className="text-sm text-muted-foreground">Let's start with your basic details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4" />
                    Full Name
                    <span aria-label="required" className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className={cn(
                      "rounded-xl border-1.5 px-4 py-3 transition-all duration-200",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      errors.fullName && "border-destructive ring-2 ring-destructive/20"
                    )}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && (
                    <div id="fullName-error" role="alert" className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4" />
                    Email Address
                    <span aria-label="required" className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={cn(
                      "rounded-xl border-1.5 px-4 py-3 transition-all duration-200",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      errors.email && "border-destructive ring-2 ring-destructive/20"
                    )}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <div id="email-error" role="alert" className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Company Field - Progressive Disclosure */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  {showOptionalFields ? 'Hide' : 'Add'} company details (optional)
                </button>
                
                {showOptionalFields && (
                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="w-4 h-4" />
                      Company Name
                    </Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Your company name"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="rounded-xl border-1.5 px-4 py-3 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Investment Profile */}
          {currentStep === 2 && (
            <div className="space-y-6" role="group" aria-labelledby="step2-heading">
              <div className="text-center mb-6">
                <h3 id="step2-heading" className="text-lg font-semibold mb-2">Investment Profile</h3>
                <p className="text-sm text-muted-foreground">Help us tailor opportunities to your experience and budget</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    Investment Experience
                    <span aria-label="required" className="text-destructive">*</span>
                    <InfoTooltip content="Choose the level that best describes your familiarity with property investing" />
                  </Label>
                  <Select
                    value={formData.investmentExperience}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, investmentExperience: value }))}
                  >
                    <SelectTrigger className={cn(
                      "rounded-xl border-1.5 px-4 py-3 min-h-[44px] transition-all duration-200",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      errors.investmentExperience && "border-destructive ring-2 ring-destructive/20"
                    )}>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value} className="rounded-lg">
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-muted-foreground">{level.helper}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.investmentExperience && (
                    <div role="alert" className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.investmentExperience}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    Expected Investment Amount
                    <span aria-label="required" className="text-destructive">*</span>
                    <InfoTooltip content="This helps us tailor opportunities to your budget range" />
                  </Label>
                  <Select
                    value={formData.investmentAmount}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, investmentAmount: value }))}
                  >
                    <SelectTrigger className={cn(
                      "rounded-xl border-1.5 px-4 py-3 min-h-[44px] transition-all duration-200",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      errors.investmentAmount && "border-destructive ring-2 ring-destructive/20"
                    )}>
                      <SelectValue placeholder="Select amount range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {investmentAmounts.map((amount) => (
                        <SelectItem key={amount.value} value={amount.value} className="rounded-lg">
                          <div>
                            <div className="font-medium">{amount.label}</div>
                            <div className="text-xs text-muted-foreground">{amount.helper}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.investmentAmount && (
                    <div role="alert" className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.investmentAmount}
                    </div>
                  )}
                </div>
              </div>

              <fieldset className="space-y-4">
                <legend className="flex items-center gap-2 text-sm font-medium">
                  Property Interests
                  <InfoTooltip content="Select multiple types to see diverse opportunities that match your interests" />
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="group" aria-labelledby="interests-legend">
                  {interestOptions.map((interest) => (
                    <div key={interest} className="flex items-center space-x-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={interest}
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                        className="w-5 h-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor={interest} className="text-sm font-medium cursor-pointer flex-1">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </fieldset>

              {/* Show guidance for new investors */}
              {formData.investmentExperience === 'New to investing' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">New Investor Resources</p>
                      <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                        As a new investor, we recommend starting with our Educational Resources to learn the fundamentals of real estate investing.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Context & Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6" role="group" aria-labelledby="step3-heading">
              <div className="text-center mb-6">
                <h3 id="step3-heading" className="text-lg font-semibold mb-2">Final Details</h3>
                <p className="text-sm text-muted-foreground">Just a few more details to complete your application</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  How did you hear about us?
                  <span aria-label="required" className="text-destructive">*</span>
                  <InfoTooltip content="Help us understand where you discovered Nexus Mint" />
                </Label>
                <Select
                  value={formData.referralSource}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, referralSource: value }))}
                >
                  <SelectTrigger className={cn(
                    "rounded-xl border-1.5 px-4 py-3 min-h-[44px] transition-all duration-200",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                    errors.referralSource && "border-destructive ring-2 ring-destructive/20"
                  )}>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {referralSources.map((source) => (
                      <SelectItem key={source} value={source} className="rounded-lg">
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.referralSource && (
                  <div role="alert" className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    {errors.referralSource}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">Additional Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your investment goals or any questions you have..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="rounded-xl border-1.5 px-4 py-3 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-xl">
                <Checkbox
                  id="marketing"
                  checked={formData.marketingConsent}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, marketingConsent: checked as boolean }))
                  }
                  className="w-5 h-5 rounded-md mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer">
                  I agree to receive marketing communications and updates about Nexus Mint. You can unsubscribe at any time.
                </Label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 rounded-xl px-6 py-3 min-h-[44px] border-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-gradient-hero text-primary-foreground hover:opacity-90 rounded-xl px-6 py-3 min-h-[44px] font-semibold"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-hero text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-8 py-3 min-h-[52px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                    Joining waitlist...
                  </>
                ) : (
                  <>
                    Join Early Access Waitlist
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>

          {currentStep === totalSteps && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              By joining, you agree to our Terms of Service and Privacy Policy. 
              We'll only contact you with important updates about early access.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}