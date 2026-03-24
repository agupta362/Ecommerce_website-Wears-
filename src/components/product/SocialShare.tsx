import { Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { siteConfig } from '@/config/site.config';

interface SocialShareProps {
  productSlug?: string;
}

const SocialShare = ({ productSlug }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = productSlug 
    ? `${siteConfig.domain}/product/${productSlug}`
    : siteConfig.domain;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="lg" 
      className="gap-2" 
      onClick={copyToClipboard}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <LinkIcon className="h-4 w-4" />
      )}
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  );
};

export default SocialShare;
