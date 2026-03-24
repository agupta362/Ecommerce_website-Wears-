import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, CreditCard, Building, Smartphone, Package, Gift, Loader2, Tag, X, Info, Shirt, Star, MapPin, Calculator, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import { useCart } from '@/context/CartContext';
import { useCreateOrder, PaymentMethod } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { useLoyaltyRewards, useValidateRewardCode, useRewardCode } from '@/hooks/useLoyaltyRewards';
import { useNCMBranches } from '@/hooks/useNCMBranches';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import LoyaltyPoints from '@/components/product/LoyaltyPoints';
import { useCurrency } from '@/context/CurrencyContext';

const nepalDistricts = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Butwal',
  'Biratnagar', 'Birgunj', 'Dharan', 'Nepalgunj', 'Other'
];

const JERSEY_PRICE = 1600;
const DEFAULT_SHIPPING = 150;

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, clearCart, markCartRecovered } = useCart();
  const createOrder = useCreateOrder();
  const { data: loyalty } = useLoyaltyRewards();
  const { validateCode } = useValidateRewardCode();
  const { data: ncmBranches, isLoading: branchesLoading } = useNCMBranches();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [giftWrap, setGiftWrap] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [rewardCode, setRewardCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: string;
    value: number;
    minAmount: number;
  } | null>(null);
  const [appliedReward, setAppliedReward] = useState<{
    code: string;
    discountValue: number;
  } | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isApplyingReward, setIsApplyingReward] = useState(false);
  const [calculatedShipping, setCalculatedShipping] = useState<number | null>(null);
  const [officePickupRate, setOfficePickupRate] = useState<number | null>(null);
  const [estimatedDays, setEstimatedDays] = useState<string | null>(null);
  const [isCalculatingRate, setIsCalculatingRate] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'office_pickup'>('home_delivery');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    district: '',
    city: '',
    area: '',
    giftMessage: '',
    destinationBranch: '',
    deliveryInstruction: '',
  });

  const { formatPrice, isBaseCurrency } = useCurrency();

  // Calculate jersey count for loyalty tracking
  const jerseyCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Bundle-based discounts and shipping
  const getBundleDiscount = () => {
    if (jerseyCount >= 4) return 500; // Squad Deal
    if (jerseyCount >= 3) return 300; // Trio Pack
    return 0; // Duo Pack has no discount, only free shipping
  };

  const getBonusPoints = () => {
    if (jerseyCount >= 4) return 4; // Squad Deal
    if (jerseyCount >= 3) return 3; // Trio Pack
    if (jerseyCount >= 2) return 2; // Duo Pack
    return 0;
  };

  const bundleDiscount = getBundleDiscount();
  const bonusPointsEarned = getBonusPoints();
  
  // Calculate shipping based on delivery type
  // 2+ jerseys = free shipping, otherwise use calculated rate based on delivery type
  const getShippingCost = () => {
    if (jerseyCount >= 2) return 0;
    if (deliveryType === 'office_pickup' && officePickupRate !== null) {
      return officePickupRate;
    }
    return calculatedShipping ?? DEFAULT_SHIPPING;
  };
  
  const shippingCost = getShippingCost();
  
  const giftWrapCost = giftWrap ? 100 : 0;

  // Use shipping rates directly from cached branch data (no edge function call)
  useEffect(() => {
    if (formData.destinationBranch && jerseyCount < 2) {
      const selectedBranch = ncmBranches?.find(
        b => b.branch_id.toString() === formData.destinationBranch
      );
      if (selectedBranch) {
        // Use rates directly from fetched data - no network call!
        setCalculatedShipping(selectedBranch.shipping_rate ?? DEFAULT_SHIPPING);
        setOfficePickupRate(selectedBranch.office_pickup_rate ?? null);
        setEstimatedDays(selectedBranch.estimated_days ?? null);
      }
    } else if (jerseyCount >= 2) {
      setCalculatedShipping(0);
      setOfficePickupRate(0);
    }
  }, [formData.destinationBranch, ncmBranches, jerseyCount]);
  
  // Calculate discount from discount code
  const discountAmount = appliedDiscount
    ? appliedDiscount.type === 'percentage'
      ? Math.round(subtotal * (appliedDiscount.value / 100))
      : appliedDiscount.value
    : 0;

  // Calculate reward code discount (free jersey = Rs. 1600)
  const rewardDiscount = appliedReward ? Math.min(appliedReward.discountValue, JERSEY_PRICE) : 0;
  
  // Total discount includes bundle discount + discount code + reward code
  const totalDiscount = bundleDiscount + discountAmount + rewardDiscount;
  
  const total = Math.max(0, subtotal + shippingCost + giftWrapCost - totalDiscount);

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return;
    
    setIsApplyingDiscount(true);
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Invalid discount code');
        return;
      }

      // Check validity dates
      const now = new Date();
      if (data.valid_from && new Date(data.valid_from) > now) {
        toast.error('This code is not yet active');
        return;
      }
      if (data.valid_until && new Date(data.valid_until) < now) {
        toast.error('This discount code has expired');
        return;
      }

      // Check usage limit
      if (data.max_uses && (data.used_count || 0) >= data.max_uses) {
        toast.error('This code has reached its usage limit');
        return;
      }

      // Check minimum order
      if (data.min_order_amount && subtotal < data.min_order_amount) {
        toast.error(`Minimum order of Rs. ${data.min_order_amount.toLocaleString()} required`);
        return;
      }

      setAppliedDiscount({
        code: data.code,
        type: data.discount_type || 'percentage',
        value: data.discount_value,
        minAmount: data.min_order_amount || 0,
      });
      setDiscountCode('');
      toast.success('Discount applied!');
    } catch (error) {
      console.error('Discount code error:', error);
      toast.error('Failed to apply discount code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const applyRewardCode = async () => {
    if (!rewardCode.trim()) return;
    if (!user) {
      toast.error('Please sign in to use reward codes');
      return;
    }
    
    setIsApplyingReward(true);
    try {
      const validCode = await validateCode(rewardCode);
      
      if (!validCode) {
        toast.error('Invalid or expired reward code');
        return;
      }

      setAppliedReward({
        code: validCode.code,
        discountValue: validCode.discount_value,
      });
      setRewardCode('');
      toast.success('🎁 Free Kit reward applied!');
    } catch (error) {
      console.error('Reward code error:', error);
      toast.error('Failed to apply reward code');
    } finally {
      setIsApplyingReward(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    toast.info('Discount removed');
  };

  const removeReward = () => {
    setAppliedReward(null);
    toast.info('Reward removed');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.district || !formData.city || !formData.area || !formData.destinationBranch) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0] || '',
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          district: formData.district,
          city: formData.city,
          address: formData.area,
        },
        paymentMethod,
        subtotal,
        shippingCost,
        giftWrapCost,
        discountAmount: totalDiscount,
        discountCode: appliedDiscount?.code || appliedReward?.code,
        total,
        giftWrap,
        giftMessage: formData.giftMessage || undefined,
        guestEmail: !user ? formData.email || undefined : undefined,
        guestPhone: !user ? formData.phone : undefined,
        destinationBranch: formData.destinationBranch ? parseInt(formData.destinationBranch) : undefined,
        deliveryInstruction: formData.deliveryInstruction || undefined,
        deliveryType: deliveryType,
      });

      // Mark reward code as used if applied
      if (appliedReward && order?.id) {
        await useRewardCode(appliedReward.code, order.id);
      }

      // Mark abandoned cart as recovered
      if (order?.id) {
        await markCartRecovered(order.id);
      }
      
      clearCart();
      navigate('/order-confirmation', { 
        state: { orderNumber: order?.order_number } 
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="section-title mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">Add some retro classics before checking out!</p>
            <Button asChild className="btn-hero">
              <Link to="/shop">Shop Now</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get bundle deal name for display
  const getBundleDealName = () => {
    if (jerseyCount >= 4) return 'Squad Deal';
    if (jerseyCount >= 3) return 'Trio Pack';
    if (jerseyCount >= 2) return 'Duo Pack';
    return null;
  };

  const bundleDealName = getBundleDealName();

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container-tight px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 lg:pb-8">
          <PageBreadcrumbs 
            items={[
              { label: 'Shop', href: '/shop' },
              { label: 'Checkout' }
            ]} 
            className="mb-4"
          />
          <Link to="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>

          <h1 className="section-title mb-8">Checkout</h1>

          {/* Bundle Benefits Banner */}
          <div className="mb-6 space-y-2">
            {bundleDealName ? (
              <Alert className="bg-green-500/10 border-green-500/20">
                <Package className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  ✅ <strong>{bundleDealName}</strong> activated! 
                  {bundleDiscount > 0 && ` Rs. ${bundleDiscount} OFF +`} Free Shipping + {bonusPointsEarned} bonus points!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-accent/10 border-accent/20">
                <Truck className="h-4 w-4 text-accent-readable" />
                <AlertDescription>
                  Add {2 - jerseyCount} more jersey{2 - jerseyCount !== 1 ? 's' : ''} to unlock <strong>Duo Pack</strong>: Free Shipping + 2 bonus points!
                </AlertDescription>
              </Alert>
            )}
            
            {bonusPointsEarned > 0 && (
              <Alert className="bg-primary/10 border-primary/20">
                <Star className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  🎯 You'll earn <strong>{bonusPointsEarned} bonus points</strong>! Collect 9 points for a FREE kit.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping Details */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="bg-card p-4 sm:p-6 rounded-lg">
                  <h2 className="font-display text-base sm:text-lg uppercase tracking-wider mb-4 sm:mb-6">
                    Shipping Information
                  </h2>
                  
                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="98XXXXXXXX"
                          required
                        />
                      </div>
                    </div>

                    {!user && (
                      <div>
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="For order updates"
                        />
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="district">District *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between font-normal",
                                !formData.district && "text-muted-foreground"
                              )}
                            >
                              {formData.district || "Select district"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 bg-popover" align="start">
                            <Command>
                              <CommandInput placeholder="Search district..." />
                              <CommandList>
                                <CommandEmpty>No district found.</CommandEmpty>
                                <CommandGroup>
                                  {nepalDistricts.map((district) => (
                                    <CommandItem
                                      key={district}
                                      value={district}
                                      onSelect={() => setFormData(prev => ({ ...prev, district }))}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.district === district ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {district}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="city">City/Town *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="e.g., Thamel"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="area">Street Address / Area *</Label>
                      <Input
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        placeholder="Street name, house number, area"
                        required
                      />
                    </div>


                    <div>
                      <Label htmlFor="destinationBranch" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Branch *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between font-normal",
                              !formData.destinationBranch && "text-muted-foreground"
                            )}
                            disabled={branchesLoading}
                          >
                            {branchesLoading 
                              ? "Loading branches..." 
                              : formData.destinationBranch 
                                ? ncmBranches?.find(b => b.branch_id.toString() === formData.destinationBranch)?.branch_name 
                                : "Search or select branch"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-popover" align="start">
                          <Command>
                            <CommandInput placeholder="Type to search branches..." />
                            <CommandList>
                              <CommandEmpty>No branch found.</CommandEmpty>
                              <CommandGroup>
                                {ncmBranches && ncmBranches.length > 0 ? (
                                  ncmBranches.map((branch) => (
                                    <CommandItem
                                      key={branch.branch_id}
                                      value={branch.branch_name}
                                      onSelect={() => setFormData(prev => ({ ...prev, destinationBranch: String(branch.branch_id) }))}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.destinationBranch === String(branch.branch_id) ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {branch.branch_name}
                                    </CommandItem>
                                  ))
                                ) : (
                                  <CommandItem disabled>No branches available</CommandItem>
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground mt-1">
                        Type to search or select the NCM branch closest to you
                      </p>
                      <p className="text-xs text-primary/80 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Major city branches (Kathmandu Valley, Pokhara, Biratnagar, etc.): 1-2 days delivery
                      </p>
                    </div>

                    {/* Delivery Type Selection - Only show when branch is selected */}
                    {formData.destinationBranch && (
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <Label className="flex items-center gap-2 mb-3">
                          <Truck className="h-4 w-4" />
                          Delivery Type
                        </Label>
                        
                        {isCalculatingRate ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Calculating rates...</span>
                          </div>
                        ) : jerseyCount >= 2 ? (
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-sm text-green-700 font-medium">
                              ✅ Free shipping included with your Duo Pack or higher!
                            </p>
                          </div>
                        ) : (
                          <RadioGroup 
                            value={deliveryType} 
                            onValueChange={(value) => setDeliveryType(value as 'home_delivery' | 'office_pickup')}
                            className="space-y-3"
                          >
                            <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${deliveryType === 'home_delivery' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                              <RadioGroupItem value="home_delivery" id="home_delivery" className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Home Delivery</span>
                                  <span className="font-bold text-primary">
                                    {calculatedShipping !== null ? formatPrice(calculatedShipping) : formatPrice(DEFAULT_SHIPPING)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Courier delivers directly to your door
                                </p>
                                {estimatedDays && (
                                  <p className="text-xs text-primary mt-1 font-medium">
                                    📦 Estimated delivery: {estimatedDays}
                                  </p>
                                )}
                              </div>
                            </label>

                            <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${deliveryType === 'office_pickup' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                              <RadioGroupItem value="office_pickup" id="office_pickup" className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Office Pickup</span>
                                  <div className="text-right">
                                    {officePickupRate !== null ? (
                                      <>
                                        <span className="font-bold text-green-600">{formatPrice(officePickupRate)}</span>
                                        {calculatedShipping && officePickupRate < calculatedShipping && (
                                          <span className="text-xs text-green-600 ml-1">
                                            (Save {formatPrice(calculatedShipping - officePickupRate)}!)
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground">Not available</span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Pick up from {ncmBranches?.find(b => b.branch_id.toString() === formData.destinationBranch)?.branch_name || 'NCM'} office
                                </p>
                                {estimatedDays && officePickupRate !== null && (
                                  <p className="text-xs text-green-600 mt-1 font-medium">
                                    📦 Available for pickup: {estimatedDays}
                                  </p>
                                )}
                              </div>
                            </label>
                          </RadioGroup>
                        )}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="deliveryInstruction">Delivery Instructions (Optional)</Label>
                      <Textarea
                        id="deliveryInstruction"
                        name="deliveryInstruction"
                        value={formData.deliveryInstruction}
                        onChange={handleInputChange}
                        placeholder="e.g., Near temple/school, call before delivery, leave at gate"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card p-4 sm:p-6 rounded-lg">
                  <h2 className="font-display text-base sm:text-lg uppercase tracking-wider mb-4 sm:mb-6">
                    Payment Method
                  </h2>

                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} className="space-y-3">
                    <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="cod" id="cod" />
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <span className="font-medium block">Cash on Delivery</span>
                        <span className="text-sm text-muted-foreground">Pay when you receive</span>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Recommended</span>
                    </label>

                    <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="esewa" id="esewa" />
                      <Smartphone className="h-6 w-6 text-green-600" />
                      <div className="flex-1">
                        <span className="font-medium block">eSewa</span>
                        <span className="text-sm text-muted-foreground">Send to 9866115154</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="khalti" id="khalti" />
                      <Smartphone className="h-6 w-6 text-purple-600" />
                      <div className="flex-1">
                        <span className="font-medium block">Khalti</span>
                        <span className="text-sm text-muted-foreground">Send to 9866115154</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Building className="h-6 w-6" />
                      <div className="flex-1">
                        <span className="font-medium block">Bank Transfer</span>
                        <span className="text-sm text-muted-foreground">We'll send bank details</span>
                      </div>
                    </label>
                  </RadioGroup>

                  {(paymentMethod === 'esewa' || paymentMethod === 'khalti' || paymentMethod === 'bank_transfer') && (
                    <div className="mt-4 p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm">
                        After placing order, please send the payment and WhatsApp us the screenshot for confirmation.
                      </p>
                    </div>
                  )}
                </div>

                {/* Loyalty Points Preview */}
                {user && jerseyCount > 0 && (
                  <div className="bg-card p-6 rounded-lg">
                    <h2 className="font-display text-lg uppercase tracking-wider mb-4">
                      <Shirt className="h-5 w-5 inline mr-2" />
                      Loyalty Rewards
                    </h2>
                    <LoyaltyPoints showEarnPreview jerseyCount={jerseyCount} />
                    {loyalty && loyalty.progressToFreeKit + jerseyCount >= 9 && (
                      <Alert className="mt-3 bg-accent/20 border-accent">
                        <Gift className="h-4 w-4 text-accent" />
                        <AlertDescription className="text-accent-foreground">
                          🎉 This order will unlock a <strong>FREE jersey</strong> reward!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card p-4 sm:p-6 rounded-lg sticky top-24">
                  <h2 className="font-display text-base sm:text-lg uppercase tracking-wider mb-4 sm:mb-6">
                    Order Summary
                  </h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                          <p className="text-sm font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Gift Wrap */}
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer mb-4">
                    <Checkbox
                      checked={giftWrap}
                      onCheckedChange={(checked) => setGiftWrap(checked as boolean)}
                    />
                    <Gift className="h-5 w-5 text-accent" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">Gift Wrapping</span>
                      <span className="text-xs text-muted-foreground block">+ Rs. 100</span>
                    </div>
                  </label>

                  {/* Discount Code */}
                  <div className="mb-4">
                    <Label className="text-sm mb-2 flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Discount Code
                    </Label>
                    {appliedDiscount ? (
                      <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{appliedDiscount.code}</span>
                          <span className="text-xs text-muted-foreground">
                            ({appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}% off` : `Rs. ${appliedDiscount.value} off`})
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={removeDiscount} className="h-6 w-6">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={applyDiscountCode}
                          disabled={isApplyingDiscount || !discountCode.trim()}
                        >
                          {isApplyingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Reward Code (Free Kit) */}
                  {user && loyalty && loyalty.availableCodes.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm mb-2 flex items-center gap-1">
                        <Gift className="h-4 w-4 text-accent" />
                        Free Kit Reward Code
                      </Label>
                      {appliedReward ? (
                        <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-accent" />
                            <span className="text-sm font-medium">{appliedReward.code}</span>
                            <span className="text-xs text-muted-foreground">
                              (Rs. {appliedReward.discountValue} off)
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={removeReward} className="h-6 w-6">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="FREEKIT-XXXXXXXX"
                            value={rewardCode}
                            onChange={(e) => setRewardCode(e.target.value.toUpperCase())}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={applyRewardCode}
                            disabled={isApplyingReward || !rewardCode.trim()}
                            className="border-accent text-accent hover:bg-accent/10"
                          >
                            {isApplyingReward ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        You have {loyalty.availableCodes.length} reward code{loyalty.availableCodes.length > 1 ? 's' : ''} available
                      </p>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-2 py-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({jerseyCount} jersey{jerseyCount > 1 ? 's' : ''})</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Shipping
                        {isCalculatingRate && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                      </span>
                      <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                        {jerseyCount >= 2 ? (
                          'FREE ✓'
                        ) : isCalculatingRate ? (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calculator className="h-3 w-3" />
                            Calculating...
                          </span>
                        ) : !formData.destinationBranch ? (
                          <span className="text-muted-foreground text-xs">Select branch to calculate</span>
                        ) : calculatedShipping !== null ? (
                          <span className="flex flex-col items-end">
                            <span>{formatPrice(shippingCost)}</span>
                            <span className="text-xs text-muted-foreground">via NCM Courier</span>
                          </span>
                        ) : (
                          formatPrice(DEFAULT_SHIPPING)
                        )}
                      </span>
                    </div>
                    {giftWrap && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gift Wrap</span>
                        <span>{formatPrice(giftWrapCost)}</span>
                      </div>
                    )}
                    {bundleDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{bundleDealName} Discount</span>
                        <span>-{formatPrice(bundleDiscount)}</span>
                      </div>
                    )}
                    {appliedDiscount && (
                      <div className="flex justify-between text-sm text-primary">
                        <span>Discount ({appliedDiscount.code})</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    {appliedReward && (
                      <div className="flex justify-between text-sm text-accent">
                        <span>Free Kit Reward</span>
                        <span>-{formatPrice(rewardDiscount)}</span>
                      </div>
                    )}
                    {bonusPointsEarned > 0 && (
                      <div className="flex justify-between text-sm text-primary">
                        <span>Bonus Points Earned</span>
                        <span className="font-medium">+{bonusPointsEarned} pts</span>
                      </div>
                    )}
                    <div className="flex justify-between font-display text-xl font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {!isBaseCurrency && (
                      <p className="text-xs text-muted-foreground text-right">
                        Prices shown for reference. Charged in NPR (Rs. {total.toLocaleString()})
                      </p>
                    )}
                  </div>

                  {/* Shipping Disclaimer */}
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg mb-4 text-xs text-muted-foreground">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>
                      Shipping charges may vary based on your location. We'll confirm the final amount when we contact you after checkout.
                    </p>
                  </div>

                  <Button type="submit" className="w-full btn-hero" size="lg" disabled={createOrder.isPending}>
                    {createOrder.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    By placing order, you agree to our{' '}
                    <Link to="/terms" className="underline hover:text-primary">Terms</Link> and{' '}
                    <Link to="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link>
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Sticky Mobile Order Bar */}
          <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden bg-card border-t-2 border-foreground px-4 py-3 safe-area-bottom">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="font-display text-lg font-bold">{formatPrice(total)}</p>
              </div>
              <Button 
                type="submit" 
                form="checkout-form"
                className="btn-hero flex-1 max-w-[200px]" 
                size="lg" 
                disabled={createOrder.isPending}
                onClick={handleSubmit}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Placing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
