import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building,
  CheckCircle,
  Clock,
  Zap,
  Calculator,
  Coins,
  PieChart,
  Target,
  Sparkles,
  MapPin
} from 'lucide-react';
import { currencyService } from '@/lib/services/currency-service';

export default function Demo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState([1000]);
  const [selectedProperty, setSelectedProperty] = useState(0);
  const [showCalculations, setShowCalculations] = useState(false);

  const properties = [
    {
      id: 1,
      name: "Marina Bay Luxury Apartments",
      location: "Dubai Marina",
      tokenPrice: 184,
      totalTokens: 25000,
      expectedYield: 12,
      image: "/lovable-uploads/592390c7-1f38-4705-94e7-3ebf85c091c2.png",
      type: "Apartment"
    },
    {
      id: 2,
      name: "Downtown Luxury Penthouse",
      location: "Downtown Dubai",
      tokenPrice: 290,
      totalTokens: 18000,
      expectedYield: 14,
      image: "/lovable-uploads/4c987739-d8fc-4bb8-bedb-e287c825a3f2.png",
      type: "Penthouse"
    },
    {
      id: 3,
      name: "Emirates Hills Estate",
      location: "Emirates Hills",
      tokenPrice: 450,
      totalTokens: 12000,
      expectedYield: 10,
      image: "/lovable-uploads/3d8c3e2f-d52c-46f4-9a7b-aadf54ab83fb.png",
      type: "Villa"
    }
  ];

  const property = properties[selectedProperty];
  const tokensCount = Math.floor(investmentAmount[0] / property.tokenPrice);
  const usdAmount = Math.round(investmentAmount[0] / 3.67);
  const expectedReturn = Math.round(investmentAmount[0] * (property.expectedYield / 100));
  const propertyShare = ((tokensCount / property.totalTokens) * 100).toFixed(4);

  const demoSteps = [
    {
      title: "Select Premium Property",
      description: `Choose ${property.name} in ${property.location}`,
      icon: Building,
      duration: 3000,
      content: "PropertySelection"
    },
    {
      title: "Investment Calculation",
      description: `Invest AED ${investmentAmount[0].toLocaleString()} for ${tokensCount} tokens`,
      icon: Calculator,
      duration: 3000,
      content: "InvestmentCalc"
    },
    {
      title: "Tokenization Process",
      description: "Property ownership converted to digital tokens",
      icon: Zap,
      duration: 4000,
      content: "TokenizationProcess"
    },
    {
      title: "Portfolio Growth",
      description: `Track ${property.expectedYield}% expected annual return`,
      icon: TrendingUp,
      duration: 3000,
      content: "PortfolioGrowth"
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 25;
          const stepDuration = demoSteps[currentStep]?.duration || 3000;
          const stepProgress = (newProgress * 100) / stepDuration;
          
          if (stepProgress >= 100) {
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return stepDuration;
            }
          }
          
          return newProgress;
        });
      }, 25);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, demoSteps]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowCalculations(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentStep(0);
    setShowCalculations(false);
  };

  const getCurrentStepProgress = () => {
    const stepDuration = demoSteps[currentStep]?.duration || 3000;
    return Math.min(100, (progress * 100) / stepDuration);
  };

  const StepContent = ({ step }: { step: string }) => {
    switch (step) {
      case "PropertySelection":
        return (
          <Card className="animate-fade-in border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {properties.map((prop, index) => (
                  <div
                    key={prop.id}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 hover-scale ${
                      selectedProperty === index
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedProperty(index)}
                  >
                    <img
                      src={prop.image}
                      alt={prop.name}
                      className="w-full h-24 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-semibold text-sm mb-1">{prop.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      {prop.location}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>AED {prop.tokenPrice}/token</span>
                      <span className="text-green-600">{prop.expectedYield}% yield</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "InvestmentCalc":
        return (
          <Card className="animate-fade-in border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Investment Amount: AED {investmentAmount[0].toLocaleString()}
                  </label>
                  <Slider
                    value={investmentAmount}
                    onValueChange={setInvestmentAmount}
                    max={50000}
                    min={500}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>AED 500</span>
                    <span>AED 50,000</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg animate-scale-in">
                    <Coins className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-xs text-blue-600 mb-1">Tokens</p>
                    <p className="text-lg font-bold text-blue-900">{tokensCount}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg animate-scale-in">
                    <DollarSign className="h-5 w-5 text-green-600 mb-2" />
                    <p className="text-xs text-green-600 mb-1">USD Value</p>
                    <p className="text-lg font-bold text-green-900">${usdAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg animate-scale-in">
                    <PieChart className="h-5 w-5 text-purple-600 mb-2" />
                    <p className="text-xs text-purple-600 mb-1">Property Share</p>
                    <p className="text-lg font-bold text-purple-900">{propertyShare}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg animate-scale-in">
                    <Target className="h-5 w-5 text-orange-600 mb-2" />
                    <p className="text-xs text-orange-600 mb-1">Annual Return</p>
                    <p className="text-lg font-bold text-orange-900">AED {expectedReturn.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "TokenizationProcess":
        return (
          <Card className="animate-fade-in border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-primary/20 rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Minting Your Property Tokens</h3>
                  <p className="text-muted-foreground text-sm">
                    Converting your AED {investmentAmount[0].toLocaleString()} investment into {tokensCount} digital property tokens
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Tokenization Progress</span>
                    <span className="text-sm font-medium">{Math.round(getCurrentStepProgress())}%</span>
                  </div>
                  <Progress value={getCurrentStepProgress()} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "PortfolioGrowth":
        return (
          <Card className="animate-fade-in border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Investment Complete!</h3>
                  <p className="text-muted-foreground">You now own {tokensCount} tokens in {property.name}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Current Value</h4>
                    <p className="text-2xl font-bold text-green-700">AED {investmentAmount[0].toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Monthly Returns</h4>
                    <p className="text-2xl font-bold text-blue-700">AED {Math.round(expectedReturn / 12).toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">12-Month Projection</h4>
                    <p className="text-2xl font-bold text-purple-700">AED {(investmentAmount[0] + expectedReturn).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Enhanced Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Interactive Investment Demo
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Experience the future of real estate investment. Watch your money transform into digital property tokens 
          and start earning returns from premium Dubai properties.
        </p>
      </div>

      {/* Enhanced Demo Controls */}
      <div className="flex justify-center gap-4 mb-12">
        <Button 
          onClick={handlePlayPause}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover-scale"
        >
          {isPlaying ? (
            <>
              <Pause className="h-5 w-5 mr-2" />
              Pause Demo
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              {progress > 0 ? 'Resume Demo' : 'Start Interactive Demo'}
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleReset}
          variant="outline"
          size="lg"
          className="hover-scale"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Reset Demo
        </Button>
      </div>

      {/* Enhanced Progress Indicator */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Demo Progress</span>
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Step {currentStep + 1} of {demoSteps.length}
          </span>
        </div>
        <Progress 
          value={(currentStep * 100 + getCurrentStepProgress()) / demoSteps.length} 
          className="h-4 bg-muted"
        />
      </div>

      {/* Enhanced Demo Steps with Timeline */}
      <div className="mb-12">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-6 left-0 w-full h-0.5 bg-border"></div>
          {demoSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-green-500 text-white shadow-lg scale-110' 
                    : isActive 
                      ? 'bg-primary text-white shadow-lg scale-110 animate-pulse' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <div className="mt-3 text-center max-w-32">
                  <p className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                  {isActive && (
                    <div className="mt-2">
                      <Progress value={getCurrentStepProgress()} className="h-1 w-24 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Step Content */}
      {(isPlaying || showCalculations) && (
        <div className="mb-12">
          <StepContent step={demoSteps[currentStep]?.content || ""} />
        </div>
      )}

      {/* Enhanced Market Data */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-6 w-6" />
            Live Dubai Real Estate Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover-scale">
              <DollarSign className="h-8 w-8 text-blue-600 mb-3" />
              <p className="text-sm font-medium text-blue-700 mb-1">Average Price/sq ft</p>
              <p className="text-3xl font-bold text-blue-900 mb-1">AED 1,234</p>
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +5.2% YoY Growth
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover-scale">
              <Target className="h-8 w-8 text-green-600 mb-3" />
              <p className="text-sm font-medium text-green-700 mb-1">Average Rental Yield</p>
              <p className="text-3xl font-bold text-green-900 mb-1">8.5%</p>
              <p className="text-xs text-green-600">Premium locations</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover-scale">
              <Building className="h-8 w-8 text-purple-600 mb-3" />
              <p className="text-sm font-medium text-purple-700 mb-1">Properties Tokenized</p>
              <p className="text-3xl font-bold text-purple-900 mb-1">118</p>
              <p className="text-xs text-purple-600">Active investments</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 hover-scale">
              <Users className="h-8 w-8 text-orange-600 mb-3" />
              <p className="text-sm font-medium text-orange-700 mb-1">Total Investment Volume</p>
              <p className="text-3xl font-bold text-orange-900 mb-1">AED 1.8B</p>
              <p className="text-xs text-orange-600">Platform wide</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 p-8 rounded-2xl border border-primary/20">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Investing?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of investors who are already building their real estate portfolio through tokenization.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Browse Properties
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}