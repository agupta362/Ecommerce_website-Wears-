import { useState, useEffect } from 'react';
import { Award, Package, Plus, Trash2, Save, Loader2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  useLoyaltySettings,
  useBundlesSettings,
  usePriceFilterSettings,
  useUpdateLoyaltySettings,
  useUpdateBundlesSettings,
  useUpdatePriceFilterSettings,
  LoyaltySettings,
  BundlesSettings,
  PriceFilterSettings,
  BundleDeal,
  DEFAULT_LOYALTY_SETTINGS,
  DEFAULT_BUNDLES_SETTINGS,
  DEFAULT_PRICE_FILTER,
} from '@/hooks/useStoreSettings';

const AdminLoyaltySettings = () => {
  // Fetch current settings
  const { data: loyaltyData, isLoading: loyaltyLoading } = useLoyaltySettings();
  const { data: bundlesData, isLoading: bundlesLoading } = useBundlesSettings();
  const { data: priceFilterData, isLoading: priceFilterLoading } = usePriceFilterSettings();
  const updateLoyalty = useUpdateLoyaltySettings();
  const updateBundles = useUpdateBundlesSettings();
  const updatePriceFilter = useUpdatePriceFilterSettings();

  // Local state for editing
  const [loyalty, setLoyalty] = useState<LoyaltySettings>(DEFAULT_LOYALTY_SETTINGS);
  const [bundles, setBundles] = useState<BundlesSettings>(DEFAULT_BUNDLES_SETTINGS);
  const [priceFilter, setPriceFilter] = useState<PriceFilterSettings>(DEFAULT_PRICE_FILTER);

  // Sync fetched data to local state
  useEffect(() => {
    if (loyaltyData) setLoyalty(loyaltyData);
  }, [loyaltyData]);

  useEffect(() => {
    if (bundlesData) setBundles(bundlesData);
  }, [bundlesData]);

  useEffect(() => {
    if (priceFilterData) setPriceFilter(priceFilterData);
  }, [priceFilterData]);

  const handleSaveLoyalty = async () => {
    try {
      await updateLoyalty.mutateAsync(loyalty);
      toast.success('Loyalty settings saved!');
    } catch (error) {
      toast.error('Failed to save loyalty settings');
      console.error(error);
    }
  };

  const handleSaveBundles = async () => {
    try {
      await updateBundles.mutateAsync(bundles);
      toast.success('Bundle settings saved!');
    } catch (error) {
      toast.error('Failed to save bundle settings');
      console.error(error);
    }
  };

  const addBundle = () => {
    const newDeal: BundleDeal = {
      id: `bundle_${Date.now()}`,
      name: 'New Bundle',
      description: 'Buy items together',
      requiredCount: bundles.deals.length + 2,
      freeShipping: true,
      discountAmount: 0,
      bonusPoints: 1,
    };
    setBundles(prev => ({
      ...prev,
      deals: [...prev.deals, newDeal],
    }));
  };

  const removeBundle = (id: string) => {
    setBundles(prev => ({
      ...prev,
      deals: prev.deals.filter(d => d.id !== id),
    }));
  };

  const updateBundle = (id: string, field: keyof BundleDeal, value: string | number | boolean) => {
    setBundles(prev => ({
      ...prev,
      deals: prev.deals.map(d => 
        d.id === id ? { ...d, [field]: value } : d
      ),
    }));
  };

  if (loyaltyLoading || bundlesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display uppercase tracking-wider">Loyalty & Bundles</h2>
        <p className="text-muted-foreground">Configure reward programs and bundle deals</p>
      </div>

      {/* Loyalty Program Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>Loyalty Program</CardTitle>
            </div>
            <Switch
              checked={loyalty.enabled}
              onCheckedChange={(enabled) => setLoyalty(prev => ({ ...prev, enabled }))}
            />
          </div>
          <CardDescription>
            Reward customers with free items after purchasing a set number of products
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="freeItemThreshold">Free Item After (purchases)</Label>
              <Input
                id="freeItemThreshold"
                type="number"
                min={1}
                value={loyalty.freeItemThreshold}
                onChange={(e) => setLoyalty(prev => ({ 
                  ...prev, 
                  freeItemThreshold: parseInt(e.target.value) || 1 
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Customer gets a free item after this many purchases
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="freeItemValue">Free Item Value (Rs.)</Label>
              <Input
                id="freeItemValue"
                type="number"
                min={0}
                value={loyalty.freeItemValue}
                onChange={(e) => setLoyalty(prev => ({ 
                  ...prev, 
                  freeItemValue: parseInt(e.target.value) || 0 
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum value of the free item reward
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardCodeExpiryDays">Reward Code Expiry (days)</Label>
              <Input
                id="rewardCodeExpiryDays"
                type="number"
                min={1}
                value={loyalty.rewardCodeExpiryDays}
                onChange={(e) => setLoyalty(prev => ({ 
                  ...prev, 
                  rewardCodeExpiryDays: parseInt(e.target.value) || 30 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemLabel">Item Label</Label>
              <Input
                id="itemLabel"
                placeholder="e.g., jersey, item, product"
                value={loyalty.itemLabel}
                onChange={(e) => setLoyalty(prev => ({ 
                  ...prev, 
                  itemLabel: e.target.value 
                }))}
              />
              <p className="text-xs text-muted-foreground">
                How items are referred to (e.g., "Buy 9 jerseys...")
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="requiresSignup"
              checked={loyalty.requiresSignup}
              onCheckedChange={(requiresSignup) => setLoyalty(prev => ({ ...prev, requiresSignup }))}
            />
            <Label htmlFor="requiresSignup">Require Sign-up (recommended for tracking)</Label>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveLoyalty} disabled={updateLoyalty.isPending}>
              {updateLoyalty.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Loyalty Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Deals Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Bundle Deals</CardTitle>
            </div>
            <Switch
              checked={bundles.enabled}
              onCheckedChange={(enabled) => setBundles(prev => ({ ...prev, enabled }))}
            />
          </div>
          <CardDescription>
            Offer discounts and bonus points for multi-item purchases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pointsToFreeItem">Points to Free Item</Label>
            <Input
              id="pointsToFreeItem"
              type="number"
              min={1}
              className="w-32"
              value={bundles.pointsToFreeItem}
              onChange={(e) => setBundles(prev => ({ 
                ...prev, 
                pointsToFreeItem: parseInt(e.target.value) || 9 
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Bonus points needed to redeem a free item
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Bundle Tiers</Label>
              <Button variant="outline" size="sm" onClick={addBundle}>
                <Plus className="h-4 w-4 mr-1" />
                Add Bundle
              </Button>
            </div>

            {bundles.deals.map((deal, index) => (
              <div key={deal.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Bundle {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBundle(deal.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={deal.name}
                      onChange={(e) => updateBundle(deal.id, 'name', e.target.value)}
                      placeholder="Duo Pack"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={deal.description}
                      onChange={(e) => updateBundle(deal.id, 'description', e.target.value)}
                      placeholder="Buy any 2 items"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Required Items</Label>
                    <Input
                      type="number"
                      min={2}
                      value={deal.requiredCount}
                      onChange={(e) => updateBundle(deal.id, 'requiredCount', parseInt(e.target.value) || 2)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Discount (Rs.)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={deal.discountAmount}
                      onChange={(e) => updateBundle(deal.id, 'discountAmount', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Bonus Points</Label>
                    <Input
                      type="number"
                      min={0}
                      value={deal.bonusPoints}
                      onChange={(e) => updateBundle(deal.id, 'bonusPoints', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="flex items-end pb-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={deal.freeShipping}
                        onCheckedChange={(checked) => updateBundle(deal.id, 'freeShipping', checked)}
                      />
                      <Label className="text-xs">Free Shipping</Label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveBundles} disabled={updateBundles.isPending}>
              {updateBundles.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Bundle Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Price Filter Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">Price Filter Range</CardTitle>
              <CardDescription>Configure the min/max price range for the shop filter slider</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Minimum Price (Rs.)</Label>
              <Input
                type="number"
                value={priceFilter.min}
                onChange={(e) => setPriceFilter({ ...priceFilter, min: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Maximum Price (Rs.)</Label>
              <Input
                type="number"
                value={priceFilter.max}
                onChange={(e) => setPriceFilter({ ...priceFilter, max: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Step Size (Rs.)</Label>
              <Input
                type="number"
                value={priceFilter.step}
                onChange={(e) => setPriceFilter({ ...priceFilter, step: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={async () => {
                try {
                  await updatePriceFilter.mutateAsync(priceFilter);
                  toast.success('Price filter settings saved!');
                } catch (error) {
                  toast.error('Failed to save price filter settings');
                }
              }}
              disabled={updatePriceFilter.isPending}
            >
              {updatePriceFilter.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Price Filter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoyaltySettings;
