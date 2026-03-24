import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Truck, RefreshCw, Package, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityItem {
  id: string;
  type: 'shipment_created' | 'status_sync' | 'branch_sync' | 'rate_check' | 'error';
  message: string;
  timestamp: string;
  details?: string;
}

const NCMActivityLog = () => {
  // Fetch recent orders with NCM activity
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['ncm-activity-orders'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, ncm_order_id, ncm_status, ncm_created_at, ncm_last_sync, created_at')
        .not('ncm_order_id', 'is', null)
        .order('ncm_last_sync', { ascending: false, nullsFirst: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent NCM comments
  const { data: recentComments, isLoading: commentsLoading } = useQuery({
    queryKey: ['ncm-activity-comments'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ncm_comments')
        .select('id, comment, author, created_at, order_id')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Fetch branch sync info
  const { data: branchInfo, isLoading: branchLoading } = useQuery({
    queryKey: ['ncm-activity-branches'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ncm_branches')
        .select('id, last_synced_at')
        .order('last_synced_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0];
    },
  });

  // Combine into activity items
  const activities: ActivityItem[] = [];

  // Add shipment creations
  recentOrders?.forEach(order => {
    if (order.ncm_created_at) {
      activities.push({
        id: `shipment-${order.id}`,
        type: 'shipment_created',
        message: `Shipment created for ${order.order_number}`,
        timestamp: order.ncm_created_at,
        details: `NCM Order ID: ${order.ncm_order_id}`,
      });
    }
    if (order.ncm_last_sync) {
      activities.push({
        id: `sync-${order.id}`,
        type: 'status_sync',
        message: `Status synced for ${order.order_number}`,
        timestamp: order.ncm_last_sync,
        details: `Current status: ${order.ncm_status || 'Unknown'}`,
      });
    }
  });

  // Add branch sync
  if (branchInfo?.last_synced_at) {
    activities.push({
      id: 'branch-sync',
      type: 'branch_sync',
      message: 'Branches synced from NCM',
      timestamp: branchInfo.last_synced_at,
    });
  }

  // Sort by timestamp
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'shipment_created':
        return <Package className="h-4 w-4 text-primary" />;
      case 'status_sync':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'branch_sync':
        return <Truck className="h-4 w-4 text-green-500" />;
      case 'rate_check':
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'shipment_created':
        return <Badge variant="default">Shipment</Badge>;
      case 'status_sync':
        return <Badge variant="secondary">Sync</Badge>;
      case 'branch_sync':
        return <Badge variant="outline">Branches</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
    }
  };

  const isLoading = ordersLoading || commentsLoading || branchLoading;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            NCM Activity Log
          </CardTitle>
          <CardDescription>
            Recent NCM shipping activities and sync events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{activity.message}</p>
                        {getActivityBadge(activity.type)}
                      </div>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No NCM activity yet</p>
                    <p className="text-sm">Activity will appear here when you ship orders via NCM</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Recent Comments */}
      {recentComments && recentComments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent NCM Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentComments.slice(0, 5).map((comment) => (
                <div key={comment.id} className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-sm">{comment.comment}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{comment.author || 'System'}</span>
                    <span>•</span>
                    <span>{format(new Date(comment.created_at!), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NCMActivityLog;
