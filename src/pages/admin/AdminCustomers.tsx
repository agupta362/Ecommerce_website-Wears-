import { 
  Users,
  Mail,
  Calendar,
  ShoppingBag,
  Download,
  Phone,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV, formatDateForExport } from '@/lib/csvExport';
import { useState } from 'react';

interface CustomerWithOrders {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
}

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithOrders | null>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      // Get admin user IDs to filter them out
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      if (rolesError) throw rolesError;
      
      const adminIds = new Set(adminRoles?.map(r => r.user_id) || []);

      // Get order stats for each customer
      const { data: orderStats, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total')
        .not('user_id', 'is', null);
      
      if (ordersError) throw ordersError;

      // Security: Use Map to prevent prototype pollution with dynamic user_id keys
      const userStatsMap = new Map<string, { count: number; total: number }>();
      orderStats?.forEach(order => {
        if (!order.user_id) return;
        const existing = userStatsMap.get(order.user_id) || { count: 0, total: 0 };
        existing.count += 1;
        existing.total += Number(order.total);
        userStatsMap.set(order.user_id, existing);
      });
      const userStats = Object.fromEntries(userStatsMap);

      // Filter out admin users and return only customers
      return profiles
        ?.filter(profile => !adminIds.has(profile.id))
        .map(profile => ({
          ...profile,
          order_count: userStats?.[profile.id]?.count || 0,
          total_spent: userStats?.[profile.id]?.total || 0,
        })) as CustomerWithOrders[];
    },
  });

  const filteredCustomers = customers?.filter(c =>
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  const handleExportCSV = () => {
    if (!customers) return;
    
    const exportData = customers.map(c => ({
      name: c.full_name || 'N/A',
      email: c.email || 'N/A',
      phone: c.phone || 'N/A',
      joined: formatDateForExport(c.created_at),
      orders: c.order_count,
      total_spent: c.total_spent,
    }));

    exportToCSV(exportData, `customers-${new Date().toISOString().split('T')[0]}.csv`, [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'joined', header: 'Joined Date' },
      { key: 'orders', header: 'Total Orders' },
      { key: 'total_spent', header: 'Total Spent (Rs.)' },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-wider mb-2">Customers</h2>
          <p className="text-muted-foreground">View registered customer accounts</p>
        </div>
        <Button onClick={handleExportCSV} disabled={!customers?.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers?.filter(c => c.order_count > 0).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(customers?.reduce((sum, c) => sum + c.total_spent, 0) || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredCustomers && filteredCustomers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {customer.email || 'No email'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.phone ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(customer.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <ShoppingBag className="h-3 w-3" />
                        {customer.order_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(customer.total_spent)}</span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg mb-2">No customers yet</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'No customers match your search' : 'Customers will appear here once they create accounts'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Customer Detail Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedCustomer.full_name || 'No name'}</h3>
                  <p className="text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="font-medium">{selectedCustomer.order_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="font-medium">{formatCurrency(selectedCustomer.total_spent)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
