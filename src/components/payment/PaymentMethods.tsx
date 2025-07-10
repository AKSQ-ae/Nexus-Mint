import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getPaymentMethods, addPaymentMethod, deletePaymentMethod } from '@/lib/services/payment-service';
import { CreditCard, Plus, Trash2, DollarSign, Bitcoin } from 'lucide-react';

export function PaymentMethods() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMethod, setNewMethod] = useState({
    method_type: 'bank_transfer',
    account_number: '',
    routing_number: '',
    bank_name: '',
    wallet_address: '',
    wallet_type: '',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const data = await getPaymentMethods(user!.id);
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    if (!user) return;

    setAdding(true);
    try {
      const details: any = {};
      
      if (newMethod.method_type === 'bank_transfer') {
        details.account_number = newMethod.account_number;
        details.routing_number = newMethod.routing_number;
        details.bank_name = newMethod.bank_name;
      } else if (newMethod.method_type === 'crypto') {
        details.wallet_address = newMethod.wallet_address;
        details.wallet_type = newMethod.wallet_type;
      }

      await addPaymentMethod({
        user_id: user.id,
        method_type: newMethod.method_type as any,
        details,
        is_verified: false,
        is_default: newMethod.is_default
      });

      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully.",
      });

      setShowAddDialog(false);
      setNewMethod({
        method_type: 'bank_transfer',
        account_number: '',
        routing_number: '',
        bank_name: '',
        wallet_address: '',
        wallet_type: '',
        is_default: false
      });
      
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      await deletePaymentMethod(id);
      toast({
        title: "Payment method removed",
        description: "Your payment method has been removed.",
      });
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Failed to remove payment method.",
        variant: "destructive",
      });
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return <DollarSign className="h-4 w-4" />;
      case 'crypto':
        return <Bitcoin className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getMethodDisplay = (method: any) => {
    switch (method.method_type) {
      case 'bank_transfer':
        return `${method.details.bank_name} •••• ${method.details.account_number?.slice(-4)}`;
      case 'crypto':
        return `${method.details.wallet_type} ${method.details.wallet_address?.slice(0, 6)}...${method.details.wallet_address?.slice(-4)}`;
      default:
        return method.method_type;
    }
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading payment methods...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your payment methods for making investments
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Add a new payment method for making investments
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="methodType">Payment Type</Label>
                  <Select
                    value={newMethod.method_type}
                    onValueChange={(value) => setNewMethod(prev => ({ ...prev, method_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newMethod.method_type === 'bank_transfer' && (
                  <>
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={newMethod.bank_name}
                        onChange={(e) => setNewMethod(prev => ({ ...prev, bank_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={newMethod.account_number}
                        onChange={(e) => setNewMethod(prev => ({ ...prev, account_number: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={newMethod.routing_number}
                        onChange={(e) => setNewMethod(prev => ({ ...prev, routing_number: e.target.value }))}
                        required
                      />
                    </div>
                  </>
                )}

                {newMethod.method_type === 'crypto' && (
                  <>
                    <div>
                      <Label htmlFor="walletType">Wallet Type</Label>
                      <Select
                        value={newMethod.wallet_type}
                        onValueChange={(value) => setNewMethod(prev => ({ ...prev, wallet_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select wallet type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="ETH">Ethereum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="walletAddress">Wallet Address</Label>
                      <Input
                        id="walletAddress"
                        value={newMethod.wallet_address}
                        onChange={(e) => setNewMethod(prev => ({ ...prev, wallet_address: e.target.value }))}
                        placeholder="0x..."
                        required
                      />
                    </div>
                  </>
                )}

                <Button
                  onClick={handleAddMethod}
                  disabled={adding}
                  className="w-full"
                >
                  {adding ? 'Adding...' : 'Add Payment Method'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No payment methods added yet</p>
            <p className="text-sm text-muted-foreground">
              Add a payment method to start making investments
            </p>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getMethodIcon(method.method_type)}
                <div>
                  <p className="font-medium">{getMethodDisplay(method)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={method.is_verified ? 'default' : 'secondary'}
                    >
                      {method.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                    {method.is_default && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteMethod(method.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}