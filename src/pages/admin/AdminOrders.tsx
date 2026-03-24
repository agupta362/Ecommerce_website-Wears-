import { useState } from 'react';
import { 
  Search, 
  Filter,
  Eye,
  Package,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Download,
  Truck,
  RefreshCw,
  FileText,
  Store,
  Printer,
  ChevronDown,
  Trash2,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useAdminOrders, useUpdateOrderStatus, useRemoveOrderItem, useUpdateOrderItem, OrderStatus, DbOrder } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { useTrackNCMShipment, useSyncNCMStatuses } from '@/hooks/useNCM';
import { useGenerateInvoice, useOrderInvoice } from '@/hooks/useInvoice';
import ShipOrderModal from '@/components/admin/ShipOrderModal';
import NCMCommentsPanel from '@/components/admin/NCMCommentsPanel';
import NCMTicketsPanel from '@/components/admin/NCMTicketsPanel';
import NCMRedirectPanel from '@/components/admin/NCMRedirectPanel';
import NCMAdminActions from '@/components/admin/NCMAdminActions';
import OrderExportModal from '@/components/admin/OrderExportModal';
import { generateInvoicePDF, downloadPDF, generateThermalReceiptPDF, ThermalWidth } from '@/lib/pdfGenerator';
import type { InvoiceData } from '@/components/invoice/InvoiceTemplate';
import { siteConfig } from '@/config/site.config';

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [shipOrderModalOpen, setShipOrderModalOpen] = useState(false);
  const [orderToShip, setOrderToShip] = useState<DbOrder | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  
  const { data: orders, isLoading } = useAdminOrders(statusFilter === 'all' ? undefined : statusFilter);
  const updateStatus = useUpdateOrderStatus();
  const removeItem = useRemoveOrderItem();
  const updateItem = useUpdateOrderItem();
  const { toast } = useToast();
  const trackShipment = useTrackNCMShipment();
  const syncStatuses = useSyncNCMStatuses();
  const generateInvoice = useGenerateInvoice();

  const filteredOrders = orders?.filter(order => 
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.shipping_address.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.guest_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOrderData = orders?.find(o => o.id === selectedOrder);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus, adminNotes });
      toast({
        title: 'Order updated',
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

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

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  const handleGenerateInvoice = async (order: DbOrder, format: 'a4' | '80mm' | '58mm' = 'a4') => {
    const result = await generateInvoice.mutateAsync(order.id);
    
    if (result.success && result.invoice) {
      // Generate and download PDF
      const invoiceData: InvoiceData = {
        invoiceNumber: result.invoice.invoice_number,
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
        items: order.order_items?.map(item => ({
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
        orderSource: (order as any).order_source,
        notes: order.notes,
      };

      if (format === 'a4') {
        const pdfBlob = await generateInvoicePDF(invoiceData);
        downloadPDF(pdfBlob, `invoice-${result.invoice.invoice_number}.pdf`);
      } else {
        const thermalWidth: ThermalWidth = format === '58mm' ? 58 : 80;
        const pdfBlob = await generateThermalReceiptPDF(invoiceData, thermalWidth);
        const url = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => printWindow.print();
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-wider mb-2">Orders</h2>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => syncStatuses.mutate()} disabled={syncStatuses.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncStatuses.isPending ? 'animate-spin' : ''}`} />
            Sync NCM
          </Button>
          <Button onClick={() => setExportModalOpen(true)} disabled={!orders?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-display text-lg">{order.order_number}</span>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      {order.gift_wrap && <Badge variant="outline">Gift Wrapped</Badge>}
                      {(order as any).order_source === 'in_store' && (
                        <Badge variant="outline" className="gap-1">
                          <Store className="h-3 w-3" />
                          In-Store
                        </Badge>
                      )}
                      {(order as any).ncm_order_id && (
                        <Badge variant="secondary" className="gap-1">
                          <Truck className="h-3 w-3" />
                          NCM: {(order as any).ncm_order_id}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {order.shipping_address.city}, {order.shipping_address.district}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {order.shipping_address.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_items?.length || 0} items • {order.payment_method.toUpperCase()}
                      </p>
                    </div>
                    
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {!(order as any).ncm_order_id && ['confirmed', 'processing'].includes(order.status) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setOrderToShip(order);
                          setShipOrderModalOpen(true);
                        }}
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Ship
                      </Button>
                    )}
                    {(order as any).ncm_order_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => trackShipment.mutate({ orderId: order.id })}
                        disabled={trackShipment.isPending}
                      >
                        <RefreshCw className={`h-4 w-4 ${trackShipment.isPending ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedOrder(order.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Orders will appear here once customers place them'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Order {selectedOrderData?.order_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrderData && (
            <div className="space-y-6">
              {/* Status & Info */}
              <div className="flex flex-wrap items-center gap-4">
                <Badge className={`${getStatusColor(selectedOrderData.status)} text-base px-4 py-1`}>
                  {selectedOrderData.status.toUpperCase()}
                </Badge>
                {(selectedOrderData as any).order_source === 'in_store' && (
                  <Badge variant="outline" className="gap-1">
                    <Store className="h-3 w-3" />
                    In-Store Sale
                  </Badge>
                )}
                <span className="text-muted-foreground">
                  Placed on {new Date(selectedOrderData.created_at).toLocaleString()}
                </span>
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={generateInvoice.isPending}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {generateInvoice.isPending ? 'Generating...' : 'Invoice'}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleGenerateInvoice(selectedOrderData, 'a4')}>
                        <FileText className="h-4 w-4 mr-2" />
                        A4 PDF Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateInvoice(selectedOrderData, '80mm')}>
                        <Printer className="h-4 w-4 mr-2" />
                        80mm Thermal Receipt
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateInvoice(selectedOrderData, '58mm')}>
                        <Printer className="h-4 w-4 mr-2" />
                        58mm Thermal Receipt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{selectedOrderData.shipping_address.fullName}</p>
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" /> {selectedOrderData.shipping_address.phone}
                  </p>
                  {selectedOrderData.guest_email && (
                    <p className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" /> {selectedOrderData.guest_email}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" /> 
                    {selectedOrderData.shipping_address.address}, {selectedOrderData.shipping_address.city}, {selectedOrderData.shipping_address.district}
                  </p>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrderData.order_items?.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="h-16 w-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover rounded" />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                        </div>
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={item.quantity <= 1 || updateItem.isPending}
                            onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1, orderId: selectedOrderData.id })}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={updateItem.isPending}
                            onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1, orderId: selectedOrderData.id })}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-bold w-24 text-right">{formatCurrency(item.price * item.quantity)}</p>
                        {/* Remove item */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          disabled={removeItem.isPending || (selectedOrderData.order_items?.length || 0) <= 1}
                          onClick={() => {
                            if (confirm(`Remove ${item.product_name} from this order?`)) {
                              removeItem.mutate({ orderId: selectedOrderData.id, itemId: item.id });
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedOrderData.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{formatCurrency(selectedOrderData.shipping_cost)}</span>
                    </div>
                    {selectedOrderData.gift_wrap_cost > 0 && (
                      <div className="flex justify-between">
                        <span>Gift Wrap</span>
                        <span>{formatCurrency(selectedOrderData.gift_wrap_cost)}</span>
                      </div>
                    )}
                    {selectedOrderData.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(selectedOrderData.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrderData.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Payment Method</span>
                      <span>{selectedOrderData.payment_method.toUpperCase()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {(selectedOrderData.notes || selectedOrderData.gift_message) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Customer Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrderData.notes && <p>{selectedOrderData.notes}</p>}
                    {selectedOrderData.gift_message && (
                      <p className="mt-2 italic">Gift Message: "{selectedOrderData.gift_message}"</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* NCM Panels for shipped orders with ncm_order_id */}
              {(selectedOrderData as any).ncm_order_id && (
                <>
                  {/* NCM Admin Actions (Return/Exchange) */}
                  <NCMAdminActions
                    orderId={selectedOrderData.id}
                    orderStatus={selectedOrderData.status}
                    ncmOrderId={(selectedOrderData as any).ncm_order_id}
                  />

                  {/* NCM Redirect Panel - only for shipped orders */}
                  {['shipped'].includes(selectedOrderData.status) && (
                    <NCMRedirectPanel
                      orderId={selectedOrderData.id}
                      ncmOrderId={(selectedOrderData as any).ncm_order_id}
                      currentAddress={selectedOrderData.shipping_address.address}
                      currentBranch={(selectedOrderData as any).destination_branch}
                      currentPhone={selectedOrderData.shipping_address.phone}
                      currentCod={selectedOrderData.payment_method === 'cod' ? selectedOrderData.total : undefined}
                    />
                  )}

                  {/* NCM Comments Panel */}
                  <NCMCommentsPanel 
                    orderId={selectedOrderData.id} 
                    ncmOrderId={(selectedOrderData as any).ncm_order_id} 
                  />
                </>
              )}

              {/* NCM Support Tickets - Always visible for all orders */}
              <NCMTicketsPanel orderId={selectedOrderData.id} />

              {/* Admin Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add internal notes about this order..."
                    value={adminNotes || selectedOrderData.admin_notes || ''}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                  <Button
                    className="mt-2"
                    size="sm"
                    onClick={() => handleStatusChange(selectedOrderData.id, selectedOrderData.status)}
                  >
                    Save Notes
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ship Order Modal */}
      <ShipOrderModal
        open={shipOrderModalOpen}
        onOpenChange={setShipOrderModalOpen}
        order={orderToShip}
      />

      {/* Export Modal */}
      <OrderExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        orders={orders || []}
      />
    </div>
  );
};

export default AdminOrders;
