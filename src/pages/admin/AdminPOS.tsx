import { useState, useMemo } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Printer,
  User,
  Phone,
  Mail,
  Tag,
  Check,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { siteConfig } from '@/config/site.config';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateInvoicePDF, downloadPDF, generateThermalReceiptPDF, printThermalReceipt, ThermalWidth } from '@/lib/pdfGenerator';
import type { InvoiceData } from '@/components/invoice/InvoiceTemplate';

interface CartItem {
  productId: string;
  productName: string;
  productImage?: string;
  size: string;
  quantity: number;
  price: number;
  stock: number;
}

interface ProductWithSizes {
  id: string;
  name: string;
  price: number;
  images?: string[];
  product_sizes?: { size: string; stock: number }[];
}

const AdminPOS = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>(siteConfig.pos.defaultPaymentMethod);
  const [printFormat, setPrintFormat] = useState<'a4' | '80mm' | '58mm'>('80mm');
  
  const { data: products, isLoading } = useProducts();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discountAmount;

  const addToCart = (product: ProductWithSizes, size: string) => {
    const sizeData = product.product_sizes?.find(s => s.size === size);
    if (!sizeData || sizeData.stock < 1) {
      toast({ title: 'Out of stock', variant: 'destructive' });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id && item.size === size);
      if (existing) {
        if (existing.quantity >= sizeData.stock) {
          toast({ title: 'Max stock reached', variant: 'destructive' });
          return prev;
        }
        return prev.map(item =>
          item.productId === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0],
        size,
        quantity: 1,
        price: product.price,
        stock: sizeData.stock,
      }];
    });
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId && item.size === size) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.stock) {
          toast({ title: 'Max stock reached', variant: 'destructive' });
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.size === size)));
  };

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        toast({ title: 'Invalid code', variant: 'destructive' });
        return;
      }

      // Check validity
      if (data.min_order_amount && subtotal < Number(data.min_order_amount)) {
        toast({ 
          title: 'Minimum not met', 
          description: `Min order: Rs.${data.min_order_amount}`,
          variant: 'destructive' 
        });
        return;
      }

      // Calculate discount
      const discount = data.discount_type === 'percentage'
        ? (subtotal * Number(data.discount_value)) / 100
        : Number(data.discount_value);

      setDiscountAmount(Math.min(discount, subtotal));
      setDiscountApplied(true);
      toast({ title: 'Discount applied' });
    } catch {
      toast({ title: 'Error applying discount', variant: 'destructive' });
    }
  };

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://bglggsewgfvsbwngexvy.supabase.co/functions/v1/create-instore-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({
            items: cart,
            customerName,
            customerPhone,
            customerEmail,
            paymentMethod,
            subtotal,
            discountAmount: discountApplied ? discountAmount : 0,
            discountCode: discountApplied ? discountCode : null,
            total,
            storeLocation: siteConfig.pos.storeLocation,
            storeCode: siteConfig.invoice.storeCode,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      return response.json();
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: 'Sale Complete',
        description: `Order ${data.order.order_number} created`,
      });

      // Generate and print invoice based on selected format
      if (siteConfig.pos.printOnComplete && data.invoice) {
        const invoiceData: InvoiceData = {
          invoiceNumber: data.invoice.invoice_number,
          orderNumber: data.order.order_number,
          date: data.order.created_at,
          customer: {
            name: customerName || 'Walk-in Customer',
            phone: customerPhone || siteConfig.pos.storeLocation.phone,
            email: customerEmail,
            address: siteConfig.pos.storeLocation.addressLine1,
            city: siteConfig.pos.storeLocation.city,
            district: siteConfig.pos.storeLocation.district,
          },
          items: cart.map(item => ({
            id: item.productId,
            product_name: item.productName,
            product_image: item.productImage,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          shippingCost: 0,
          discountAmount: discountApplied ? discountAmount : 0,
          total,
          paymentMethod: paymentMethod === 'qr' ? 'QR Payment' : 'Cash',
          orderSource: 'in_store',
        };

        if (printFormat === 'a4') {
          const pdfBlob = await generateInvoicePDF(invoiceData);
          const url = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(url, '_blank');
          if (printWindow) {
            printWindow.onload = () => printWindow.print();
          }
        } else {
          const thermalWidth: ThermalWidth = printFormat === '58mm' ? 58 : 80;
          await printThermalReceipt(invoiceData, thermalWidth);
        }
      }

      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setDiscountCode('');
      setDiscountAmount(0);
      setDiscountApplied(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-wider mb-2">Point of Sale</h2>
          <p className="text-muted-foreground">Create in-store walk-in orders</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setCart([]);
            setDiscountCode('');
            setDiscountAmount(0);
            setDiscountApplied(false);
          }}
          disabled={cart.length === 0}
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[calc(100vh-320px)]">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-4">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted relative">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm truncate">{product.name}</h3>
                      <p className="text-primary font-bold">{formatCurrency(product.price)}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.product_sizes?.map(size => (
                          <Button
                            key={size.size}
                            size="sm"
                            variant={size.stock > 0 ? "outline" : "ghost"}
                            disabled={size.stock < 1}
                            className="h-7 px-2 text-xs"
                            onClick={() => addToCart(product, size.size)}
                          >
                            {size.size}
                            {size.stock < 1 && <span className="ml-1 text-destructive">×</span>}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Cart is empty</p>
              ) : (
                <ScrollArea className="h-48">
                  <div className="space-y-3 pr-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.size, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.size, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-medium text-sm w-20 text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeFromCart(item.productId, item.size)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Discount Code */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={discountApplied}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant={discountApplied ? "secondary" : "outline"}
                  onClick={applyDiscount}
                  disabled={discountApplied || !discountCode.trim()}
                >
                  {discountApplied ? <Check className="h-4 w-4" /> : 'Apply'}
                </Button>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info (Optional) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Customer (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email (optional)"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as 'cash' | 'qr')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                    <Banknote className="h-4 w-4" />
                    Cash
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="qr" id="qr" />
                  <Label htmlFor="qr" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    QR Payment
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Print Format */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Printer className="h-4 w-4" />
                Receipt Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={printFormat} onValueChange={(v) => setPrintFormat(v as 'a4' | '80mm' | '58mm')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80mm">80mm Thermal</SelectItem>
                  <SelectItem value="58mm">58mm Thermal</SelectItem>
                  <SelectItem value="a4">A4 Invoice</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Complete Sale Button */}
          <Button
            className="w-full h-14 text-lg"
            disabled={cart.length === 0 || createOrderMutation.isPending}
            onClick={() => createOrderMutation.mutate()}
          >
            <Printer className="h-5 w-5 mr-2" />
            {createOrderMutation.isPending ? 'Processing...' : `Complete Sale • ${formatCurrency(total)}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPOS;