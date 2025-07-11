import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Zap
} from 'lucide-react';
import { currencyService } from '@/lib/services/currency-service';

export default function Demo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(1000);

  const demoSteps = [
    {
      title: "Select Premium Property",
      description: "Browse curated Dubai real estate opportunities",
      icon: Building,
      duration: 500
    },
    {
      title: "Investment Calculation",
      description: `Invest AED ${investmentAmount.toLocaleString()} (≈ $${Math.round(investmentAmount / 3.67).toLocaleString()})`,
      icon: DollarSign,
      duration: 500
    },
    {
      title: "Tokenization Process",
      description: "Property ownership converted to digital tokens",
      icon: Zap,
      duration: 500
    },
    {
      title: "Portfolio Growth",
      description: "Track your returns and property performance",
      icon: TrendingUp,
      duration: 500
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          
          // Check if current step is complete
      const stepDuration = demoSteps[currentStep]?.duration || 1000;
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
      }, 10);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, demoSteps]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentStep(0);
  };

  const getCurrentStepProgress = () => {
    const stepDuration = demoSteps[currentStep]?.duration || 1000;
    return Math.min(100, (progress * 100) / stepDuration);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Interactive Investment Demo
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience how easy it is to invest in Dubai real estate with tokenization. 
          Watch the complete process from property selection to portfolio growth.
        </p>
      </div>

      {/* Demo Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <Button 
          onClick={handlePlayPause}
          size="lg"
          className="bg-secondary hover:bg-secondary/90"
        >
          {isPlaying ? (
            <>
              <Pause className="h-5 w-5 mr-2" />
              Pause Demo
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              {progress > 0 ? 'Resume Demo' : 'Start Demo'}
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleReset}
          variant="outline"
          size="lg"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Reset
        </Button>
      </div>

      {/* Demo Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Demo Progress</span>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {demoSteps.length}
          </span>
        </div>
        <Progress 
          value={(currentStep * 100 + getCurrentStepProgress()) / demoSteps.length} 
          className="h-3"
        />
      </div>

      {/* Demo Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {demoSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <Card 
              key={index}
              className={`transition-all duration-500 ${
                isActive 
                  ? 'ring-2 ring-primary bg-primary/5 scale-105' 
                  : isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : 'opacity-60'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    isCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <Badge variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}>
                    {index + 1}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {step.description}
                </p>
                {isActive && (
                  <div className="space-y-2">
                    <Progress value={getCurrentStepProgress()} className="h-2" />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {Math.ceil((step.duration - progress) / 1000)}s remaining
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interactive Investment Calculator */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Live Investment Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Investment Amount (AED)
              </label>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>AED 500</span>
                <span className="font-medium">AED {investmentAmount.toLocaleString()}</span>
                <span>AED 50,000</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">USD Equivalent</p>
                <p className="text-xl font-bold">
                  ${Math.round(investmentAmount / 3.67).toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Tokens (≈AED 184/token)</p>
                <p className="text-xl font-bold">
                  {Math.floor(investmentAmount / 184).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-600">Expected Annual Return (12%)</p>
                <p className="text-xl font-bold text-green-700">
                  AED {Math.round(investmentAmount * 0.12).toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600">Property Share</p>
                <p className="text-xl font-bold text-blue-700">
                  {((investmentAmount / 184) / 25000 * 100).toFixed(3)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Market Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Dubai Real Estate Market Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-700">Average Price/sq ft</p>
              <p className="text-2xl font-bold text-blue-900">AED 1,234</p>
              <p className="text-xs text-blue-600">+5.2% YoY</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-700">Rental Yield</p>
              <p className="text-2xl font-bold text-green-900">8.5%</p>
              <p className="text-xs text-green-600">Premium locations</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-700">Properties Tokenized</p>
              <p className="text-2xl font-bold text-purple-900">118</p>
              <p className="text-xs text-purple-600">Active listings</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-orange-700">Total Investment</p>
              <p className="text-2xl font-bold text-orange-900">AED 1.8B</p>
              <p className="text-xs text-orange-600">Platform volume</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}