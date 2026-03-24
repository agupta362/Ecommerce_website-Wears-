import { useState } from 'react';
import { Download, Calendar, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { exportOrdersToExcel, exportOrdersToPDF, filterOrders } from '@/lib/exportUtils';
import { exportToCSV, formatDateForExport } from '@/lib/csvExport';
import { format } from 'date-fns';
import { DbOrder } from '@/hooks/useOrders';

interface OrderExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: DbOrder[];
}

type ExportFormat = 'excel' | 'csv' | 'pdf';
type OrderSource = 'all' | 'online' | 'in_store';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function OrderExportModal({ open, onOpenChange, orders }: OrderExportModalProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['all']);
  const [orderSource, setOrderSource] = useState<OrderSource>('all');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');

  const handleStatusChange = (status: string, checked: boolean) => {
    if (status === 'all') {
      setSelectedStatuses(checked ? ['all'] : []);
    } else {
      setSelectedStatuses(prev => {
        const newStatuses = prev.filter(s => s !== 'all');
        if (checked) {
          return [...newStatuses, status];
        } else {
          return newStatuses.filter(s => s !== status);
        }
      });
    }
  };

  const handleExport = () => {
    // Transform orders to export format
    const exportOrders = orders.map(order => ({
      invoice_number: (order as any).invoice?.invoice_number,
      order_number: order.order_number,
      date: formatDateForExport(order.created_at),
      order_source: (order as any).order_source || 'online',
      customer: order.shipping_address.fullName,
      phone: order.shipping_address.phone,
      email: order.guest_email || '',
      city: order.shipping_address.city,
      district: order.shipping_address.district,
      items: order.order_items?.length || 0,
      subtotal: order.subtotal,
      shipping: order.shipping_cost,
      discount: order.discount_amount,
      total: order.total,
      status: order.status,
      payment_method: order.payment_method,
    }));

    // Apply filters
    const status = selectedStatuses.includes('all') ? 'all' : selectedStatuses[0];
    const filteredData = filterOrders(exportOrders, {
      dateFrom,
      dateTo,
      status,
      orderSource,
    });

    if (filteredData.length === 0) {
      return;
    }

    const filename = `orders-${format(new Date(), 'yyyy-MM-dd')}`;

    switch (exportFormat) {
      case 'excel':
        exportOrdersToExcel(filteredData, `${filename}.csv`);
        break;
      case 'csv': {
        // Convert to Record<string, unknown>[] for csvExport compatibility
        const csvData = filteredData.map(row => ({ ...row } as Record<string, unknown>));
        exportToCSV(csvData, `${filename}.csv`, [
          { key: 'invoice_number', header: 'Invoice #' },
          { key: 'order_number', header: 'Order #' },
          { key: 'date', header: 'Date' },
          { key: 'order_source', header: 'Source' },
          { key: 'customer', header: 'Customer' },
          { key: 'phone', header: 'Phone' },
          { key: 'email', header: 'Email' },
          { key: 'city', header: 'City' },
          { key: 'district', header: 'District' },
          { key: 'items', header: 'Items' },
          { key: 'subtotal', header: 'Subtotal' },
          { key: 'shipping', header: 'Shipping' },
          { key: 'discount', header: 'Discount' },
          { key: 'total', header: 'Total' },
          { key: 'status', header: 'Status' },
          { key: 'payment_method', header: 'Payment' },
        ]);
        break;
      }
      case 'pdf':
        exportOrdersToPDF(filteredData, `${filename}.pdf`, {
          dateFrom,
          dateTo,
          status,
          orderSource,
        });
        break;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Orders
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="flex gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {dateTo ? format(dateTo, 'MMM d, yyyy') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Order Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(status => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={selectedStatuses.includes(status.value)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(status.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`status-${status.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Order Source */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Order Source</Label>
            <RadioGroup
              value={orderSource}
              onValueChange={(v) => setOrderSource(v as OrderSource)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="source-all" />
                <Label htmlFor="source-all" className="text-sm cursor-pointer">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="source-online" />
                <Label htmlFor="source-online" className="text-sm cursor-pointer">Online</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in_store" id="source-instore" />
                <Label htmlFor="source-instore" className="text-sm cursor-pointer">In-Store</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup
              value={exportFormat}
              onValueChange={(v) => setExportFormat(v as ExportFormat)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="excel" id="format-excel" />
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <Label htmlFor="format-excel" className="flex-1 cursor-pointer">
                  <span className="font-medium">Excel</span>
                  <span className="text-xs text-muted-foreground ml-2">(.csv)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="csv" id="format-csv" />
                <FileText className="h-5 w-5 text-blue-600" />
                <Label htmlFor="format-csv" className="flex-1 cursor-pointer">
                  <span className="font-medium">CSV</span>
                  <span className="text-xs text-muted-foreground ml-2">(.csv)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="pdf" id="format-pdf" />
                <FileText className="h-5 w-5 text-red-600" />
                <Label htmlFor="format-pdf" className="flex-1 cursor-pointer">
                  <span className="font-medium">PDF Report</span>
                  <span className="text-xs text-muted-foreground ml-2">(.pdf)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OrderExportModal;