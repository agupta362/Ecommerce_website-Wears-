import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Search, Plus, Trash2, Instagram, Phone, Facebook, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string | null;
  size: string;
  quantity: number;
  price: number;
}

const AdminQuickOrder = () => {
  const [orderSource, setOrderSource] = useState<string>('instagram');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{ id?: string; name: string; phone: string; email?: string } | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState({ full_name: '', phone: '', address_line1: '', city: '', district: '' });
  const [notes, setNotes] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });

  // Search customers
  const { data: customers } = useQuery({
    queryKey: ['admin-customers-search', customerSearch],
    queryFn: async () => {
      if (!customerSearch || customerSearch.length < 2) return [];
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email')
        .or(`full_name.ilike.%${customerSearch}%,phone.ilike.%${customerSearch}%,email.ilike.%${customerSearch}%`)
        .limit(5);
      return data || [];
    },
    enabled: customerSearch.length >= 2,
  });

  // Search products
  const { data: products } = useQuery({
    queryKey: ['admin-products-search', productSearch],
    queryFn: async () => {
      if (!productSearch || productSearch.length < 2) return [];
      const { data } = await supabase
        .from('products')
        .select('id, name, price, images, slug')
        .ilike('name', `%${productSearch}%`)
        .eq('is_active', true)
        .limit(10);
      return data || [];
    },
    enabled: productSearch.length >= 2,
  });

  // Get sizes for adding products
  const addProduct = async (product: { id: string; name: string; price: number; images: string[] | null }) => {
    const { data: sizes } = await supabase
      .from('product_sizes')
      .select('size, stock')
      .eq('product_id', product.id)
      .gt('stock', 0);

    const defaultSize = sizes?.[0]?.size || 'M';
    setItems(prev => [...prev, {
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] || null,
      size: defaultSize,
      quantity: 1,
      price: product.price,
    }]);
    setProductSearch('');
  };

  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const updateItem = (index: number, updates: Partial<OrderItem>) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const shippingCost = 150; // Default NCM rate
  const total = subtotal + shippingCost;

  const createOrder = useMutation({
    mutationFn: async () => {
      const customerName = selectedCustomer?.name || newCustomer.name;
      const customerPhone = selectedCustomer?.phone || newCustomer.phone;
      const customerEmail = selectedCustomer?.email || newCustomer.email;

      if (!customerName || !customerPhone) throw new Error('Customer name and phone required');
      if (items.length === 0) throw new Error('Add at least one product');

      const address = {
        full_name: shippingAddress.full_name || customerName,
        phone: shippingAddress.phone || customerPhone,
        address_line1: shippingAddress.address_line1,
        city: shippingAddress.city,
        district: shippingAddress.district,
      };

      // Create order via edge function
      const { data, error } = await supabase.functions.invoke('create-instore-order', {
        body: {
          items: items.map(i => ({
            product_id: i.product_id,
            product_name: i.product_name,
            product_image: i.product_image,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
          shipping_address: address,
          subtotal,
          shipping_cost: shippingCost,
          total,
          payment_method: 'cod',
          order_source: orderSource,
          notes: `[${orderSource.toUpperCase()}] ${notes}`,
          guest_email: customerEmail || null,
          guest_phone: customerPhone,
          user_id: selectedCustomer?.id || null,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Order created!', description: `Order ${data?.order_number || ''} created from ${orderSource}` });
      // Reset form
      setItems([]);
      setSelectedCustomer(null);
      setCustomerSearch('');
      setNotes('');
      setShippingAddress({ full_name: '', phone: '', address_line1: '', city: '', district: '' });
      setIsNewCustomer(false);
      setNewCustomer({ name: '', phone: '', email: '' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const sourceIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="h-4 w-4" />,
    whatsapp: <Phone className="h-4 w-4" />,
    facebook: <Facebook className="h-4 w-4" />,
    phone: <Phone className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="h-6 w-6" /> Quick Order
        </h1>
        <p className="text-muted-foreground">Create orders from social media / DM conversations</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Customer + Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Source */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {['instagram', 'whatsapp', 'facebook', 'phone'].map(source => (
                  <Button
                    key={source}
                    variant={orderSource === source ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderSource(source)}
                  >
                    {sourceIcons[source]}
                    <span className="ml-1 capitalize">{source}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.phone} {selectedCustomer.email && `• ${selectedCustomer.email}`}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}>
                    Change
                  </Button>
                </div>
              ) : isNewCustomer ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))} placeholder="Customer name" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={newCustomer.phone} onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="98XXXXXXXX" />
                    </div>
                  </div>
                  <div>
                    <Label>Email (optional)</Label>
                    <Input value={newCustomer.email} onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setIsNewCustomer(false)}>← Search existing</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search by name, phone, or email..."
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                    />
                  </div>
                  {customers && customers.length > 0 && (
                    <div className="border rounded-lg divide-y">
                      {customers.map(c => (
                        <button
                          key={c.id}
                          className="w-full text-left p-3 hover:bg-muted transition-colors"
                          onClick={() => {
                            setSelectedCustomer({ id: c.id, name: c.full_name || '', phone: c.phone || '', email: c.email || '' });
                            setShippingAddress(p => ({ ...p, full_name: c.full_name || '', phone: c.phone || '' }));
                          }}
                        >
                          <p className="font-medium">{c.full_name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{c.phone} {c.email && `• ${c.email}`}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setIsNewCustomer(true)}>
                    <Plus className="h-3 w-3 mr-1" /> New Customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
              </div>
              {products && products.length > 0 && productSearch.length >= 2 && (
                <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                  {products.map(p => (
                    <button
                      key={p.id}
                      className="w-full text-left p-3 hover:bg-muted transition-colors flex items-center gap-3"
                      onClick={() => addProduct(p)}
                    >
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-sm text-muted-foreground">NPR {p.price.toLocaleString()}</p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <div className="space-y-2 pt-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      {item.product_image && (
                        <img src={item.product_image} alt="" className="w-12 h-12 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product_name}</p>
                        <div className="flex gap-2 mt-1">
                          <Input
                            className="w-16 h-7 text-xs"
                            value={item.size}
                            onChange={e => updateItem(i, { size: e.target.value })}
                            placeholder="Size"
                          />
                          <Input
                            type="number"
                            className="w-16 h-7 text-xs"
                            value={item.quantity}
                            min={1}
                            onChange={e => updateItem(i, { quantity: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                      </div>
                      <p className="font-medium text-sm">NPR {(item.price * item.quantity).toLocaleString()}</p>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeItem(i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Full Name</Label>
                  <Input value={shippingAddress.full_name} onChange={e => setShippingAddress(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={shippingAddress.phone} onChange={e => setShippingAddress(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input value={shippingAddress.address_line1} onChange={e => setShippingAddress(p => ({ ...p, address_line1: e.target.value }))} placeholder="Street address" />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={shippingAddress.city} onChange={e => setShippingAddress(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <Label>District</Label>
                  <Input value={shippingAddress.district} onChange={e => setShippingAddress(p => ({ ...p, district: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {sourceIcons[orderSource]} {orderSource}
                </Badge>
              </div>

              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No items added yet</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="truncate max-w-[150px]">{item.product_name} × {item.quantity}</span>
                      <span>NPR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>NPR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>NPR {shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>NPR {total.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="DM conversation notes, special requests..."
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => createOrder.mutate()}
                disabled={items.length === 0 || createOrder.isPending || (!selectedCustomer && !newCustomer.name)}
              >
                <Send className="h-4 w-4 mr-2" />
                {createOrder.isPending ? 'Creating...' : 'Create Order (COD)'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminQuickOrder;
