import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  Shield
} from 'lucide-react';

interface AccountSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const supportCategories = [
  { value: 'account-verification', label: 'Account Verification', icon: Shield },
  { value: 'payment-issues', label: 'Payment Issues', icon: CreditCard },
  { value: 'kyc-documents', label: 'KYC Documents', icon: FileText },
  { value: 'technical-support', label: 'Technical Support', icon: AlertCircle },
  { value: 'investment-questions', label: 'Investment Questions', icon: MessageSquare },
  { value: 'other', label: 'Other', icon: User }
];

const urgencyLevels = [
  { value: 'low', label: 'Low - General inquiry', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium - Account issue', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High - Payment problem', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent - Security concern', color: 'bg-red-100 text-red-800' }
];

export function AccountSupportModal({ isOpen, onClose }: AccountSupportModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    urgency: '',
    subject: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Support Request Submitted",
        description: "Thank you! We've received your request and will respond within 24 hours.",
      });
      setIsSubmitting(false);
      onClose();
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        urgency: '',
        subject: '',
        description: ''
      });
    }, 2000);
  };

  const isFormValid = formData.name && formData.email && formData.category && 
                     formData.urgency && formData.subject && formData.description;

  const selectedCategory = supportCategories.find(cat => cat.value === formData.category);
  const selectedUrgency = urgencyLevels.find(level => level.value === formData.urgency);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            Account Support Request
          </DialogTitle>
          <p className="text-muted-foreground">
            Get help with your account, verification, payments, and more. Our support team typically responds within 24 hours.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Phone Number (Optional)</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Support Category */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Support Category
            </h3>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category *</label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {supportCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Urgency Level *</label>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${level.color.split(' ')[0].replace('bg-', 'bg-')}`} />
                        {level.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Issue Details */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Issue Details
            </h3>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Subject *</label>
              <Input
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please provide detailed information about your issue, including any error messages or steps you've already tried..."
                rows={5}
                required
              />
            </div>
          </div>

          {/* Summary */}
          {(selectedCategory || selectedUrgency) && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Request Summary</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <selectedCategory.icon className="h-3 w-3" />
                    {selectedCategory.label}
                  </Badge>
                )}
                {selectedUrgency && (
                  <Badge className={selectedUrgency.color}>
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedUrgency.label.split(' - ')[0]}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Response Time Info */}
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Expected Response Times</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Urgent issues: Within 2-4 hours</li>
                  <li>• High priority: Within 12 hours</li>
                  <li>• Medium priority: Within 24 hours</li>
                  <li>• Low priority: Within 48 hours</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}