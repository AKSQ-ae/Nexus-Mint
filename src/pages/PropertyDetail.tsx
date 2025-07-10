import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MapPin, TrendingUp, DollarSign, Building, Calendar, Users } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  property_type: string;
  price: number;
  price_per_token: number;
  total_tokens: number;
  tokenization_status: string;
  images: any[];
  created_at: string;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState(0);
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    if (investmentAmount && property && property.price_per_token) {
      const amount = parseFloat(investmentAmount) || 0;
      const tokens = Math.floor(amount / property.price_per_token);
      setTokenAmount(tokens);
    } else {
      setTokenAmount(0);
    }
  }, [investmentAmount, property]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestment = async () => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }

    if (!property || !investmentAmount) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid investment amount.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(investmentAmount);
    const minInvestment = property.price_per_token || 100;
    
    if (amount < minInvestment) {
      toast({
        title: "Minimum investment",
        description: `Minimum investment is $${minInvestment} (1 token).`,
        variant: "destructive",
      });
      return;
    }

    setInvesting(true);

    try {
      const { error } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          property_id: property.id,
          total_amount: amount,
          token_amount: tokenAmount,
          price_per_token: property.price_per_token || 100,
          status: 'PENDING',
          payment_method: 'BANK_TRANSFER',
        });

      if (error) throw error;

      toast({
        title: "Investment submitted",
        description: "Your investment has been submitted for processing.",
      });

      navigate('/portfolio');
    } catch (error) {
      console.error('Error creating investment:', error);
      toast({
        title: "Investment failed",
        description: "There was an error processing your investment.",
        variant: "destructive",
      });
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Property not found.</div>
      </div>
    );
  }

  // Mock data for demo - this would come from property token sales
  const fundedPercentage = 25;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {property.images && property.images.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Basic Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <div className="flex items-center text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address}, {property.city}, {property.country}
                </div>
              </div>
              <Badge variant="secondary">{property.property_type}</Badge>
            </div>
            <p className="text-muted-foreground">{property.description}</p>
          </div>

          {/* Property Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-2xl font-bold">${property.price?.toLocaleString() || 'TBD'}</div>
                  <div className="text-sm text-muted-foreground">Property Value</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold">8-12%</div>
                  <div className="text-sm text-muted-foreground">Expected Yield</div>
                </div>
                <div className="text-center">
                  <Building className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-bold">{property.total_tokens?.toLocaleString() || 'TBD'}</div>
                  <div className="text-sm text-muted-foreground">Total Tokens</div>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl font-bold">25%</div>
                  <div className="text-sm text-muted-foreground">Funded</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Investment Details</CardTitle>
              <CardDescription>
                Invest in this property by purchasing tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Funding Progress</span>
                  <span>{fundedPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${fundedPercentage}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {Math.floor((property.total_tokens || 1000) * 0.75).toLocaleString()} tokens remaining
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Token Price</span>
                  <span className="font-bold">${property.price_per_token?.toLocaleString() || '100'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Min. Investment</span>
                  <span>${property.price_per_token?.toLocaleString() || '100'}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Investment Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    min={property.price_per_token || 100}
                    step={property.price_per_token || 100}
                  />
                </div>

                {tokenAmount > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Tokens to receive:</span>
                        <span className="font-bold">{tokenAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated annual return:</span>
                        <span className="font-bold text-green-600">
                          ${((parseFloat(investmentAmount) * 0.10)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleInvestment}
                  disabled={!investmentAmount || investing || tokenAmount === 0}
                  className="w-full"
                >
                  {investing ? 'Processing...' : 'Invest Now'}
                </Button>

                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    <Button
                      variant="link"
                      onClick={() => navigate('/auth/signin')}
                      className="p-0 h-auto"
                    >
                      Sign in
                    </Button>
                    {' '}to invest in this property
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}