import { useState } from 'react';
import { 
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Download,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrderStats, useAdminOrders } from '@/hooks/useOrders';
import { useAdminProducts } from '@/hooks/useProducts';
import { exportToCSV, formatDateForExport } from '@/lib/csvExport';
import AbandonedCartStats from '@/components/admin/AbandonedCartStats';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('all');
  const { data: stats, isLoading: statsLoading } = useOrderStats();
  const { data: orders } = useAdminOrders();
  const { data: products } = useAdminProducts();

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  // Filter orders by time range
  const getFilteredOrders = () => {
    if (!orders) return [];
    const now = new Date();
    
    switch (timeRange) {
      case 'today':
        return orders.filter(o => new Date(o.created_at).toDateString() === now.toDateString());
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orders.filter(o => new Date(o.created_at) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orders.filter(o => new Date(o.created_at) >= monthAgo);
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Calculate analytics
  const totalRevenue = filteredOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total), 0);

  const averageOrderValue = filteredOrders.length > 0
    ? filteredOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0) / filteredOrders.filter(o => o.status !== 'cancelled').length
    : 0;

  // Security: Use Map to prevent prototype pollution with dynamic keys
  const ordersByStatusMap = new Map<string, number>();
  filteredOrders.forEach(order => {
    const count = ordersByStatusMap.get(order.status) || 0;
    ordersByStatusMap.set(order.status, count + 1);
  });
  const ordersByStatus = Object.fromEntries(ordersByStatusMap);

  const ordersByPaymentMethodMap = new Map<string, number>();
  filteredOrders.forEach(order => {
    const count = ordersByPaymentMethodMap.get(order.payment_method) || 0;
    ordersByPaymentMethodMap.set(order.payment_method, count + 1);
  });
  const ordersByPaymentMethod = Object.fromEntries(ordersByPaymentMethodMap);

  // Daily sales for chart data - using Map for safety
  const dailySalesMap = new Map<string, { date: string; orders: number; revenue: number }>();
  filteredOrders.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString();
    const existing = dailySalesMap.get(date) || { date, orders: 0, revenue: 0 };
    existing.orders += 1;
    if (order.status !== 'cancelled') {
      existing.revenue += Number(order.total);
    }
    dailySalesMap.set(date, existing);
  });
  const dailySales = Object.fromEntries(dailySalesMap);

  const dailySalesData = Object.values(dailySales).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ).slice(-14); // Last 14 days

  const handleExportReport = () => {
    const reportData = dailySalesData.map(d => ({
      date: d.date,
      orders: d.orders,
      revenue: d.revenue,
    }));

    exportToCSV(reportData, `sales-report-${new Date().toISOString().split('T')[0]}.csv`, [
      { key: 'date', header: 'Date' },
      { key: 'orders', header: 'Orders' },
      { key: 'revenue', header: 'Revenue (Rs.)' },
    ]);
  };

  if (statsLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-wider mb-2">Analytics</h2>
          <p className="text-muted-foreground">Track your store's performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="recovery">Cart Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {timeRange === 'all' ? 'All time' : timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'Last 7 days' : 'Last 30 days'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredOrders.filter(o => o.status === 'delivered').length} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Math.round(averageOrderValue))}</div>
            <p className="text-xs text-muted-foreground mt-1">Per order average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredOrders.length 
                ? Math.round((filteredOrders.filter(o => o.status === 'delivered').length / filteredOrders.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Orders delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Chart - Simple Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Sales (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {dailySalesData.length > 0 ? (
            <div className="space-y-2">
              {dailySalesData.map(day => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{day.date}</span>
                  <div className="flex items-center gap-8">
                    <span className="text-muted-foreground">{day.orders} orders</span>
                    <span className="font-bold">{formatCurrency(day.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No sales data for this period</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Stats by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(ordersByStatus).length > 0 ? (
                Object.entries(ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="capitalize">{status}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {filteredOrders.length ? Math.round((count / filteredOrders.length) * 100) : 0}%
                      </span>
                      <span className="font-bold">{count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No orders in this period</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(ordersByPaymentMethod).length > 0 ? (
                Object.entries(ordersByPaymentMethod).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="uppercase">{method.replace('_', ' ')}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {filteredOrders.length ? Math.round((count / filteredOrders.length) * 100) : 0}%
                      </span>
                      <span className="font-bold">{count} orders</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No payment data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products?.filter(p => p.is_active).length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products?.filter(p => p.is_featured).length || 0}</p>
                <p className="text-sm text-muted-foreground">Featured Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="recovery">
          <AbandonedCartStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
