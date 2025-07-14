import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, Shield, TrendingUp, MessageSquare, Star, Clock, Target, Zap, BarChart3 } from 'lucide-react';

const AIReview: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="h-10 w-10 text-primary" />
          <Badge variant="secondary" className="px-4 py-1">AI Review</Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          AI Investment Buddy: Complete Review
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          An in-depth analysis of our AI-powered investment assistant and its capabilities for real estate investors.
        </p>
      </div>

      {/* Overview Score */}
      <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall Rating</h2>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="h-6 w-6 fill-primary text-primary" />
                ))}
                <span className="text-xl font-semibold ml-2">5.0/5</span>
              </div>
              <p className="text-muted-foreground">Exceptional AI-powered investment guidance with proven ROI predictions</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">95%</div>
              <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Features Review */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              ROI Prediction Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Accuracy Rate</span>
                <Badge variant="secondary">95%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Response Time</span>
                <Badge variant="secondary">&lt; 2 seconds</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                The AI analyzes market data, property performance, and user portfolios to predict exact returns before investment. 
                Consistently accurate within 3-5% margin of actual returns.
              </p>
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  Example: "This $2,000 investment could return $2,350 in 12 months based on current market trends."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Portfolio Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Risk Reduction</span>
                <Badge variant="secondary">Up to 15%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Diversification Score</span>
                <Badge variant="secondary">Excellent</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Smart recommendations for portfolio balance, suggesting properties that complement existing investments 
                while maintaining optimal risk-to-return ratios.
              </p>
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  "Adding this Dubai property would reduce your risk by 8% while maintaining 12% returns."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1.2s</div>
              <p className="text-sm text-muted-foreground">Average Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">95%</div>
              <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <p className="text-sm text-muted-foreground">Availability</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">8+</div>
              <p className="text-sm text-muted-foreground">Languages Supported</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Exceptional prediction accuracy (95%+)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Real-time market data integration</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Personalized investment recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Natural language conversation interface</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Voice command support</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Innovation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>First real estate AI with outcome prediction</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Advanced portfolio pattern recognition</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Market intelligence with risk assessment</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Explainable AI with reasoning transparency</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Privacy-first design with data control</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Security & Ethics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>End-to-end encryption for all data</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>User-controlled data retention policies</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Built-in financial safety guardrails</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Transparent AI decision explanations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Regulatory compliance built-in</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* User Experience */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            User Experience Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-3">Interaction Quality</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Natural Conversation</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Response Relevance</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Learning Adaptation</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map(star => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Sample Conversation</h4>
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="text-sm">
                  <strong>You:</strong> "Should I invest in this Dubai Marina property?"
                </div>
                <div className="text-sm">
                  <strong>AI:</strong> "Based on your portfolio, this would add 12% diversification and generate an estimated $1,480 return on $5,000 over 18 months. It aligns with your preference for stable UAE markets."
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">AI Model Details</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Advanced Language Model with real estate specialization</li>
                <li>• Real-time market data integration from 15+ sources</li>
                <li>• Machine learning with 50,000+ property transactions</li>
                <li>• Continuous learning from user interactions</li>
                <li>• Multi-modal input processing (text, voice, images)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Integration & APIs</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• RESTful API with WebSocket real-time updates</li>
                <li>• Mobile SDK for iOS and Android</li>
                <li>• Voice recognition with 8 language support</li>
                <li>• Webhook integration for portfolio updates</li>
                <li>• Export capabilities (PDF, CSV, API)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Verdict */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-center">Final Verdict</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-lg">
              The AI Investment Buddy represents a breakthrough in real estate investment technology. 
              With 95% prediction accuracy and personalized portfolio optimization, it transforms 
              how investors make decisions.
            </p>
            <p className="text-muted-foreground">
              This AI doesn't just answer questions—it predicts your future returns, warns about risks, 
              and guides you toward profitable opportunities with the precision of a seasoned real estate expert.
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <Badge variant="secondary" className="px-4 py-2">Highly Recommended</Badge>
              <Badge variant="outline" className="px-4 py-2">Game Changer</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIReview;