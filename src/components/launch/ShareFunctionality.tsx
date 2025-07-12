import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  MessageCircle,
  QrCode,
  Download,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareFunctionalityProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  customMessage?: string;
  showSocialStats?: boolean;
}

interface SocialStats {
  platform: string;
  shares: number;
  icon: React.ReactNode;
}

export function ShareFunctionality({ 
  title, 
  description, 
  url, 
  image, 
  customMessage,
  showSocialStats = false 
}: ShareFunctionalityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState(customMessage || `Check out ${title} on Nexus Mint!`);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const socialStats: SocialStats[] = [
    { platform: 'Twitter', shares: 1247, icon: <Twitter className="w-4 h-4" /> },
    { platform: 'Facebook', shares: 892, icon: <Facebook className="w-4 h-4" /> },
    { platform: 'LinkedIn', shares: 634, icon: <Linkedin className="w-4 h-4" /> },
    { platform: 'Email', shares: 421, icon: <Mail className="w-4 h-4" /> },
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const text = customText;
    const shareUrl = url;
    
    let socialUrl = '';
    switch (platform) {
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        socialUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`;
        break;
      case 'whatsapp':
        socialUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
        break;
    }
    
    window.open(socialUrl, '_blank', 'width=600,height=400');
  };

  const generateQRCode = () => {
    // In a real app, you'd use a QR code library
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    window.open(qrUrl, '_blank');
  };

  const downloadShareAssets = () => {
    // In a real app, you'd generate and download share assets
    toast({
      title: "Download started",
      description: "Share assets are being prepared for download",
    });
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: customText,
          url: url,
        });
      } catch (error) {
        console.log('Native share cancelled');
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={nativeShare}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share {title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {image && (
              <div className="aspect-video w-full rounded-lg overflow-hidden border">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="custom-message">Custom Message</Label>
              <Textarea
                id="custom-message"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Add your personal message..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-url">Share URL</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={url}
                  readOnly
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(url)}
                >
                  {copied ? "Copied!" : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Share on Social Media</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('facebook')}
                  className="flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('linkedin')}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial('email')}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateQRCode}
                  className="flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </Button>
              </div>
            </div>

            {showSocialStats && (
              <div className="space-y-3">
                <Label>Social Media Performance</Label>
                <div className="space-y-2">
                  {socialStats.map((stat) => (
                    <div key={stat.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {stat.icon}
                        <span className="text-sm">{stat.platform}</span>
                      </div>
                      <Badge variant="secondary">
                        {stat.shares.toLocaleString()} shares
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadShareAssets}
                className="flex items-center gap-2 flex-1"
              >
                <Download className="w-4 h-4" />
                Download Assets
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="flex items-center gap-2 flex-1"
              >
                <ExternalLink className="w-4 h-4" />
                Open Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}