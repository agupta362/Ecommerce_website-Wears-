import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Heart, MapPin, User, LogOut, Settings, Lock, Eye, EyeOff, ChevronDown, ChevronUp, Truck, FileText, Download } from 'lucide-react';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useMyOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import LoyaltyPoints from '@/components/product/LoyaltyPoints';
import OrderTrackingTimeline from '@/components/order/OrderTrackingTimeline';
import OrderActions from '@/components/order/OrderActions';
import { useOrderInvoice } from '@/hooks/useInvoice';
import { generateInvoicePDF, downloadPDF } from '@/lib/pdfGenerator';
import type { InvoiceData } from '@/components/invoice/InvoiceTemplate';
import { siteConfig } from '@/config/site.config';

const changePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const Account = () => {
  const navigate = useNavigate();
  const { user, isLoading, signOut, isAdmin } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const { toast } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    setIsChangingPassword(true);
    
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    setIsChangingPassword(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password updated!',
        description: 'Your password has been successfully changed.',
      });
      passwordForm.reset();
      setShowPasswordForm(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Invoice download component for individual orders
  const InvoiceDownloadButton = ({ order }: { order: any }) => {
    const { data: invoice, isLoading } = useOrderInvoice(order.id);
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
      if (!invoice) return;
      
      setDownloading(true);
      try {
        const invoiceData: InvoiceData = {
          invoiceNumber: invoice.invoice_number,
          orderNumber: order.order_number,
          date: order.created_at,
          customer: {
            name: order.shipping_address.fullName,
            phone: order.shipping_address.phone,
            email: order.guest_email,
            address: order.shipping_address.address || '',
            city: order.shipping_address.city,
            district: order.shipping_address.district,
          },
          items: order.order_items?.map((item: any) => ({
            id: item.id,
            product_name: item.product_name,
            product_image: item.product_image,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })) || [],
          subtotal: order.subtotal,
          shippingCost: order.shipping_cost,
          discountAmount: order.discount_amount,
          giftWrapCost: order.gift_wrap_cost,
          total: order.total,
          paymentMethod: order.payment_method,
          notes: order.notes,
        };

        const pdfBlob = await generateInvoicePDF(invoiceData);
        downloadPDF(pdfBlob, `invoice-${invoice.invoice_number}.pdf`);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to download invoice',
          variant: 'destructive',
        });
      } finally {
        setDownloading(false);
      }
    };

    if (isLoading) return null;
    if (!invoice) return null;

    return (
      <div className="mt-4 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="h-4 w-4 mr-2" />
          {downloading ? 'Downloading...' : `Download Invoice (${invoice.invoice_number})`}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-6 sm:py-12">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          <PageBreadcrumbs 
            items={[{ label: 'My Account' }]} 
            className="mb-6"
          />
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 space-y-4">
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user.email}</p>
                    {isAdmin && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <Button asChild variant="outline" className="w-full mb-2">
                    <Link to="/admin">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
              </div>

              <nav className="bg-card border rounded-lg overflow-hidden">
                <Link to="/account" className="flex items-center gap-3 p-4 bg-muted/50 border-l-4 border-primary">
                  <Package className="h-5 w-5" />
                  <span className="font-medium">My Orders</span>
                </Link>
                <Link to="/wishlist" className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <Heart className="h-5 w-5" />
                  <span>Wishlist</span>
                </Link>
                <Link to="/account/addresses" className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <MapPin className="h-5 w-5" />
                  <span>Addresses</span>
                </Link>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/30 transition-colors"
                >
                  <Lock className="h-5 w-5" />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/30 transition-colors text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </nav>

              {/* Change Password Form */}
              {showPasswordForm && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-display text-lg uppercase tracking-wider mb-4">Change Password</h3>
                  <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-10"
                          {...passwordForm.register('newPassword')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-destructive text-sm">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...passwordForm.register('confirmPassword')}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-destructive text-sm">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={isChangingPassword} className="flex-1">
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowPasswordForm(false);
                        passwordForm.reset();
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Loyalty Points Section */}
              <LoyaltyPoints />
            </div>

            {/* Main Content - Orders */}
            <div className="flex-1">
              <h1 className="font-display text-2xl uppercase tracking-wider mb-6">My Orders</h1>

              {ordersLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-muted rounded-lg"></div>
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => {
                    const isExpanded = expandedOrder === order.id;
                    const orderData = order as any;
                    
                    return (
                      <div key={order.id} className="bg-card border rounded-lg overflow-hidden">
                        {/* Order Header */}
                        <div 
                          className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                              <p className="font-display text-lg">{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                              {orderData.ncm_order_id && (
                                <Badge variant="secondary" className="gap-1">
                                  <Truck className="h-3 w-3" />
                                  NCM
                                </Badge>
                              )}
                              <span className="font-bold">Rs. {order.total.toLocaleString()}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex flex-wrap gap-4">
                              {order.order_items?.slice(0, 3).map(item => (
                                <div key={item.id} className="flex items-center gap-2 text-sm">
                                  <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                                    {item.product_image ? (
                                      <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover rounded" />
                                    ) : (
                                      <Package className="h-6 w-6 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium line-clamp-1">{item.product_name}</p>
                                    <p className="text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                              {order.order_items && order.order_items.length > 3 && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  +{order.order_items.length - 3} more items
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Order Details */}
                        {isExpanded && (
                          <div className="px-6 pb-6 border-t bg-muted/20">
                            <div className="pt-4">
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Tracking Status
                              </h4>
                              <OrderTrackingTimeline
                                orderStatus={order.status}
                                ncmStatus={orderData.ncm_status}
                                ncmOrderId={orderData.ncm_order_id}
                                ncmTrackingId={orderData.ncm_tracking_id}
                              />
                              
                              {/* Return/Exchange Actions */}
                              <OrderActions
                                orderId={order.id}
                                orderNumber={order.order_number}
                                orderStatus={order.status}
                                ncmOrderId={orderData.ncm_order_id}
                              />

                              {/* Invoice Download */}
                              {['confirmed', 'delivered', 'shipped'].includes(order.status) && (
                                <InvoiceDownloadButton order={order} />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-card border rounded-lg">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-lg mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                  <Button asChild>
                    <Link to="/shop">Browse Products</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
