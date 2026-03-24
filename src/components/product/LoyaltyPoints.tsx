import { Award, Gift, Star, Copy, Check, Shirt, Loader2, Package } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLoyaltyRewards } from '@/hooks/useLoyaltyRewards';
import { useLoyaltySettings, useBundlesSettings, DEFAULT_LOYALTY_SETTINGS, DEFAULT_BUNDLES_SETTINGS } from '@/hooks/useStoreSettings';
import { useState } from 'react';
import { toast } from 'sonner';

interface LoyaltyPointsProps {
  orderTotal?: number;
  showEarnPreview?: boolean;
  jerseyCount?: number;
}

const LoyaltyPoints = ({ orderTotal = 0, showEarnPreview = false, jerseyCount = 0 }: LoyaltyPointsProps) => {
  const { user } = useAuth();
  const { data: loyalty, isLoading: loyaltyLoading } = useLoyaltyRewards();
  const { data: loyaltySettings } = useLoyaltySettings();
  const { data: bundlesSettings } = useBundlesSettings();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Get settings from database or use defaults
  const settings = loyaltySettings || DEFAULT_LOYALTY_SETTINGS;
  const bundles = bundlesSettings || DEFAULT_BUNDLES_SETTINGS;
  const bundleDeals = bundles.deals;
  const itemLabel = settings.itemLabel || 'jersey';
  const freeItemThreshold = settings.freeItemThreshold || 9;
  const freeItemValue = settings.freeItemValue || 1600;

  // Calculate bonus points preview based on bundle deals from settings
  const getBonusPointsPreview = () => {
    // Sort deals by requiredCount descending to find the best match
    const sortedDeals = [...bundleDeals].sort((a, b) => b.requiredCount - a.requiredCount);
    for (const deal of sortedDeals) {
      if (jerseyCount >= deal.requiredCount) return deal.bonusPoints;
    }
    return 0;
  };
  
  const bonusPointsPreview = getBonusPointsPreview();

  const getBundleName = () => {
    const sortedDeals = [...bundleDeals].sort((a, b) => b.requiredCount - a.requiredCount);
    for (const deal of sortedDeals) {
      if (jerseyCount >= deal.requiredCount) return deal.name;
    }
    return null;
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  // If showing earn preview (for checkout/product page)
  if (showEarnPreview && jerseyCount > 0) {
    const bundleName = getBundleName();
    return (
      <div className="space-y-2">
        {bundleName && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <Package className="h-4 w-4 text-green-600 flex-shrink-0" />
            <p className="text-sm">
              <span className="font-medium text-green-600">{bundleName}</span>
              <span className="text-muted-foreground"> unlocked!</span>
            </p>
          </div>
        )}
        {bonusPointsPreview > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Star className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm">
              <span className="font-medium text-primary">+{bonusPointsPreview} bonus points</span>
          <span className="text-muted-foreground"> → {bundles.pointsToFreeItem} points = FREE kit!</span>
        </p>
      </div>
    )}
    {jerseyCount < 2 && bundleDeals.length > 0 && (
      <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
        <Shirt className="h-4 w-4 text-accent-readable flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Add {bundleDeals[0].requiredCount - jerseyCount} more to unlock <span className="font-medium text-accent-readable">{bundleDeals[0].name}</span>
        </p>
      </div>
    )}
  </div>
);
  }

  // Full loyalty display (for account page)
  if (!user) {
    return (
      <div className="border rounded-lg p-6 bg-card text-center">
        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg uppercase tracking-wider mb-2">
          Join Babal Wears Rewards
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in to start earning toward free {itemLabel}s!
        </p>
        <div className="flex flex-col items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Shirt className="h-4 w-4 text-accent-readable" />
            <span>Buy {freeItemThreshold} {itemLabel}s, get your {freeItemThreshold + 1}th FREE!</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-primary" />
            <span>Bonus points for bundled orders</span>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = loyaltyLoading;

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6 bg-card flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalJerseys = loyalty?.totalJerseys || 0;
  const progressToFreeKit = loyalty?.progressToFreeKit || 0;
  const jerseysToGo = loyalty?.jerseysToGo || 9;
  const bonusPoints = loyalty?.bonusPoints || 0;
  const availableCodes = loyalty?.availableCodes || [];
  const availableFreeKits = loyalty?.availableFreeKits || 0;

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg uppercase tracking-wider">Babal Wears Rewards</h3>
        </div>
        {availableFreeKits > 0 && (
          <Badge className="bg-accent text-accent-foreground animate-pulse">
            {availableFreeKits} Free Kit{availableFreeKits > 1 ? 's' : ''} Available!
          </Badge>
        )}
      </div>

      {/* Progress to Free Kit */}
      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shirt className="h-5 w-5 text-primary" />
            <span className="font-medium">Progress to Free Clothing product of your choice</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {progressToFreeKit}/{freeItemThreshold} {itemLabel}s
          </span>
        </div>
        <Progress value={(progressToFreeKit / freeItemThreshold) * 100} className="h-3 mb-2" />
        <p className="text-sm text-muted-foreground">
          {jerseysToGo === freeItemThreshold && totalJerseys === 0 
            ? `Buy ${freeItemThreshold} ${itemLabel}s to earn your first FREE kit!`
            : `${jerseysToGo} more ${itemLabel}${jerseysToGo !== 1 ? 's' : ''} to unlock your FREE kit!`
          }
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-display font-bold text-primary">{totalJerseys}</p>
          <p className="text-xs text-muted-foreground">Total {itemLabel}s</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-display font-bold text-accent-readable">{bonusPoints}</p>
          <p className="text-xs text-muted-foreground">Bonus Points</p>
        </div>
      </div>

      {/* Available Reward Codes */}
      {availableCodes.length > 0 && (
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-3 flex items-center gap-1">
            <Gift className="h-4 w-4 text-accent-readable" />
            Your Free Kit Codes
          </p>
          <div className="space-y-2">
            {availableCodes.map((rewardCode) => (
              <div 
                key={rewardCode.id} 
                className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-lg"
              >
                <div>
                  <p className="font-mono font-bold text-accent-readable">{rewardCode.code}</p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {new Date(rewardCode.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(rewardCode.code)}
                  className="h-8"
                >
                  {copiedCode === rewardCode.code ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Use at checkout for a FREE {itemLabel} (Rs. {freeItemValue.toLocaleString()} value)
          </p>
        </div>
      )}

      {/* How it works - dynamically generated from settings */}
      <div className="border-t pt-4 mt-4">
        <p className="text-sm font-medium mb-2">How Bundle Points Work</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          {bundleDeals.map(deal => (
            <li key={deal.id}>
              • <strong>{deal.name}</strong> ({deal.requiredCount}+ {itemLabel}s): 
              {deal.discountAmount > 0 ? ` Rs. ${deal.discountAmount} OFF +` : ''} 
              {deal.freeShipping ? ' Free Shipping +' : ''} {deal.bonusPoints} pts
            </li>
          ))}
          <li className="pt-1 text-primary font-medium">🎁 Collect {bundles.pointsToFreeItem} points → Get a FREE kit!</li>
        </ul>
      </div>
    </div>
  );
};

export default LoyaltyPoints;
