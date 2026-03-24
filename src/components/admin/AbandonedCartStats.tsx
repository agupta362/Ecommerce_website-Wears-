import { ShoppingCart, TrendingUp, Mail, DollarSign, RefreshCw, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAbandonedCartStats, useAbandonedCarts } from '@/hooks/useAbandonedCarts';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const AbandonedCartStats = () => {
  const { data: stats, isLoading: statsLoading } = useAbandonedCartStats();
  const { data: carts, isLoading: cartsLoading } = useAbandonedCarts();

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  if (statsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg uppercase tracking-wider mb-4">Cart Recovery Analytics</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Track abandoned carts and recovery email effectiveness
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recoveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.recovered} of {stats?.totalAbandoned} carts recovered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recovered Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.recoveredRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {stats?.recovered} recovered carts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Recovery</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRecovery}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats?.totalPotentialRevenue || 0)} potential
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.firstRemindersSent || 0) + (stats?.secondRemindersSent || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.firstRemindersSent} first + {stats?.secondRemindersSent} discount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Abandoned Carts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Abandoned Carts</CardTitle>
        </CardHeader>
        <CardContent>
          {cartsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : carts && carts.length > 0 ? (
            <div className="space-y-3">
              {carts.slice(0, 10).map(cart => (
                <div
                  key={cart.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {cart.guest_email || `User ${cart.user_id?.slice(0, 8)}...`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Array.isArray(cart.items) ? cart.items.length : 0} items • {format(new Date(cart.created_at), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(cart.cart_total)}</p>
                      <div className="flex gap-1 justify-end">
                        {cart.recovered_at ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                            Recovered
                          </Badge>
                        ) : cart.second_reminder_sent_at ? (
                          <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 text-xs">
                            2nd Email
                          </Badge>
                        ) : cart.first_reminder_sent_at ? (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 text-xs">
                            1st Email
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 text-xs">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No abandoned carts yet. Cart recovery emails will appear here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AbandonedCartStats;
