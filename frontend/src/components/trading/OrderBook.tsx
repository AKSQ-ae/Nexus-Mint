import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  ArrowUpDown,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Order {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  total: number;
  user: string;
  timestamp: Date;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
}

interface OrderBookProps {
  propertyId: string;
  propertyTitle: string;
  currentPrice: number;
  volume24h: number;
  priceChange24h: number;
}

export function OrderBook({ 
  propertyId, 
  propertyTitle, 
  currentPrice, 
  volume24h, 
  priceChange24h 
}: OrderBookProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState(currentPrice.toString());
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateMockOrders();
    
    // Simulate real-time updates every 5 seconds
    const interval = setInterval(() => {
      updateOrderBook();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateMockOrders = () => {
    const mockOrders: Order[] = [];
    
    // Generate buy orders (below current price)
    for (let i = 0; i < 15; i++) {
      const orderPrice = currentPrice * (0.85 + (Math.random() * 0.14));
      mockOrders.push({
        id: `buy-${i}`,
        type: 'buy',
        price: orderPrice,
        quantity: Math.floor(Math.random() * 1000) + 10,
        total: 0,
        user: `User${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        status: 'pending'
      });
    }

    // Generate sell orders (above current price)
    for (let i = 0; i < 15; i++) {
      const orderPrice = currentPrice * (1.01 + (Math.random() * 0.14));
      mockOrders.push({
        id: `sell-${i}`,
        type: 'sell',
        price: orderPrice,
        quantity: Math.floor(Math.random() * 1000) + 10,
        total: 0,
        user: `User${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        status: 'pending'
      });
    }

    // Calculate totals and sort
    mockOrders.forEach(order => {
      order.total = order.price * order.quantity;
    });

    setOrders(mockOrders.sort((a, b) => b.price - a.price));
  };

  const updateOrderBook = () => {
    setOrders(prevOrders => {
      // Randomly fill some orders
      const updatedOrders = prevOrders.map(order => {
        if (Math.random() < 0.05 && order.status === 'pending') {
          return { ...order, status: 'filled' as const };
        }
        return order;
      });

      // Add new random orders
      if (Math.random() < 0.3) {
        const newOrderType = Math.random() < 0.5 ? 'buy' : 'sell';
        const basePrice = newOrderType === 'buy' 
          ? currentPrice * (0.85 + Math.random() * 0.14)
          : currentPrice * (1.01 + Math.random() * 0.14);
        
        const newOrder: Order = {
          id: `${newOrderType}-${Date.now()}`,
          type: newOrderType,
          price: basePrice,
          quantity: Math.floor(Math.random() * 500) + 10,
          total: 0,
          user: `User${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date(),
          status: 'pending'
        };
        newOrder.total = newOrder.price * newOrder.quantity;
        
        updatedOrders.push(newOrder);
      }

      return updatedOrders
        .filter(order => order.status !== 'filled')
        .sort((a, b) => b.price - a.price)
        .slice(0, 30);
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place orders');
      return;
    }

    const orderPrice = parseFloat(price);
    const orderQuantity = parseInt(quantity);

    if (!orderPrice || !orderQuantity || orderPrice <= 0 || orderQuantity <= 0) {
      toast.error('Please enter valid price and quantity');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate order placement
      const newOrder: Order = {
        id: `${orderType}-${Date.now()}`,
        type: orderType,
        price: orderPrice,
        quantity: orderQuantity,
        total: orderPrice * orderQuantity,
        user: user.email?.split('@')[0] || 'You',
        timestamp: new Date(),
        status: 'pending'
      };

      setOrders(prev => [...prev, newOrder].sort((a, b) => b.price - a.price));
      
      toast.success(`${orderType.toUpperCase()} order placed successfully!`);
      setQuantity('');
      
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const buyOrders = orders.filter(o => o.type === 'buy' && o.status === 'pending').slice(0, 10);
  const sellOrders = orders.filter(o => o.type === 'sell' && o.status === 'pending').slice(0, 10);
  
  const bestBuyPrice = buyOrders[0]?.price || 0;
  const bestSellPrice = sellOrders[sellOrders.length - 1]?.price || 0;
  const spread = bestSellPrice - bestBuyPrice;
  const spreadPercentage = (spread / currentPrice) * 100;

  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Price</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
            <div className="flex items-center text-sm">
              {priceChange24h >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">24h Volume</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{volume24h.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">tokens traded</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Spread</span>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">${spread.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              {spreadPercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Settlement</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">15m</div>
            <div className="text-sm text-muted-foreground">batch interval</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Book */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Book - {propertyTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Buy Orders */}
              <div>
                <h3 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Buy Orders
                </h3>
                <div className="space-y-1">
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
                    <span>Price</span>
                    <span>Quantity</span>
                    <span>Total</span>
                  </div>
                  {buyOrders.map(order => (
                    <div key={order.id} className="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-green-50 rounded">
                      <span className="text-green-600 font-medium">${order.price.toFixed(2)}</span>
                      <span>{order.quantity.toLocaleString()}</span>
                      <span className="text-xs">${order.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sell Orders */}
              <div>
                <h3 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Sell Orders
                </h3>
                <div className="space-y-1">
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
                    <span>Price</span>
                    <span>Quantity</span>
                    <span>Total</span>
                  </div>
                  {sellOrders.reverse().map(order => (
                    <div key={order.id} className="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-red-50 rounded">
                      <span className="text-red-600 font-medium">${order.price.toFixed(2)}</span>
                      <span>{order.quantity.toLocaleString()}</span>
                      <span className="text-xs">${order.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Place Order */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Place Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="text-green-600">Buy</TabsTrigger>
                <TabsTrigger value="sell" className="text-red-600">Sell</TabsTrigger>
              </TabsList>

              <TabsContent value={orderType} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (USD)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity (tokens)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    step="1"
                  />
                </div>

                {price && quantity && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-medium">
                        ${(parseFloat(price) * parseInt(quantity) || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fee (0.1%):</span>
                      <span className="text-muted-foreground">
                        ${((parseFloat(price) * parseInt(quantity) || 0) * 0.001).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading || !price || !quantity}
                  className={`w-full ${
                    orderType === 'buy' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Placing...' : `Place ${orderType.toUpperCase()} Order`}
                </Button>

                <div className="text-xs text-muted-foreground">
                  <p>• Orders settle every 15 minutes</p>
                  <p>• No fees for first 100 trades</p>
                  <p>• Best execution guaranteed</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground border-b pb-2">
              <span>Time</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>
            {orders.filter(o => o.status === 'filled').slice(0, 10).map(trade => (
              <div key={trade.id} className="grid grid-cols-4 gap-4 text-sm py-2 border-b">
                <span className="text-muted-foreground">
                  {trade.timestamp.toLocaleTimeString()}
                </span>
                <span className={trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
                  ${trade.price.toFixed(2)}
                </span>
                <span>{trade.quantity.toLocaleString()}</span>
                <span>${trade.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}