import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, ExternalLink, ShoppingCart, DollarSign, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import StoreSetupWizard from '@/components/admin/StoreSetupWizard';

const SuperAdmin = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      navigate('/admin');
    }
  }, [authLoading, isSuperAdmin, navigate]);

  const { data: stores, isLoading } = useQuery({
    queryKey: ['store-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_registry')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin,
  });

  const toggleStore = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('store_registry').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store-registry'] }),
  });

  if (authLoading || !isSuperAdmin) return null;

  const totalStores = stores?.length || 0;
  const activeStores = stores?.filter(s => s.is_active).length || 0;
  const totalRevenue = stores?.reduce((sum, s) => sum + (Number(s.monthly_revenue) || 0), 0) || 0;
  const totalOrders = stores?.reduce((sum, s) => sum + (Number(s.total_orders) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-wider">Super Admin</h1>
          <p className="text-muted-foreground">Manage all registered store clones</p>
        </div>
        <StoreSetupWizard onComplete={() => queryClient.invalidateQueries({ queryKey: ['store-registry'] })} />
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalStores}</p>
                <p className="text-xs text-muted-foreground">Total Stores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeStores}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">NPR {totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Combined Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !stores?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No stores registered yet. Use the setup wizard to create your first store.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map(store => (
            <Card key={store.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{store.store_name}</CardTitle>
                    <CardDescription className="truncate max-w-[200px]">{store.store_url}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={store.is_active ? 'default' : 'secondary'}>
                      {store.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{store.plan}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium">NPR {(Number(store.monthly_revenue) || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Orders</span>
                  <span className="font-medium">{store.total_orders || 0}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <a href={`${store.store_url}/admin`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" /> Admin
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant={store.is_active ? 'destructive' : 'default'}
                    onClick={() => toggleStore.mutate({ id: store.id, is_active: !store.is_active })}
                  >
                    {store.is_active ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
