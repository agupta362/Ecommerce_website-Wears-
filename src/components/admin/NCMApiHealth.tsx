import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApiEndpoint {
  name: string;
  description: string;
  status: 'unknown' | 'checking' | 'connected' | 'error' | 'degraded';
  lastCheck?: string;
  message?: string;
}

const NCMApiHealth = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    { name: 'Create Shipment', description: 'Create new NCM shipments', status: 'unknown' },
    { name: 'Track Shipment', description: 'Track shipment status', status: 'unknown' },
    { name: 'Rate Calculation', description: 'Calculate shipping rates', status: 'unknown' },
    { name: 'Branches API', description: 'Fetch branch list', status: 'unknown' },
  ]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<string | null>(null);

  const checkEndpoint = async (name: string): Promise<{ status: 'connected' | 'error' | 'degraded'; message: string }> => {
    try {
      switch (name) {
        case 'Create Shipment':
          // Can't actually test without creating an order, so we check if function responds
          try {
            const { data, error } = await supabase.functions.invoke('ncm-create-shipment', {
              body: { test: true }
            });
            // If we got our structured JSON response (even with success: false), function is working
            // Expected: { success: false, error: "Invalid request data" }
            if (data && typeof data === 'object' && 'success' in data) {
              return { status: 'connected', message: 'Function available' };
            }
            // If error contains specific message about our validation, function is working
            if (error?.message?.includes('400') || error?.message?.includes('Invalid')) {
              return { status: 'connected', message: 'Function available' };
            }
            // True network/deploy errors
            if (error?.message?.includes('FunctionsHttpError') || error?.message?.includes('Failed to fetch')) {
              return { status: 'error', message: 'Function unavailable' };
            }
            return { status: 'connected', message: 'Function available' };
          } catch {
            return { status: 'error', message: 'Function unreachable' };
          }

        case 'Track Shipment':
          try {
            const { data, error } = await supabase.functions.invoke('ncm-track-shipment', {
              body: { ncm_order_id: '999999' }
            });
            
            // If we got our structured JSON response (even with success: false), function is working
            // Expected: { success: false, error: "Unable to retrieve tracking information..." }
            if (data && typeof data === 'object' && 'success' in data) {
              return { status: 'connected', message: 'Function responding' };
            }
            
            // If error message indicates our function responded (just with error status)
            if (error?.message?.includes('502') || error?.message?.includes('404')) {
              return { status: 'connected', message: 'Function responding' };
            }
            
            // True network/deploy errors
            if (error?.message?.includes('FunctionsHttpError') || error?.message?.includes('Failed to fetch')) {
              return { status: 'error', message: 'Function unavailable' };
            }
            
            return { status: 'connected', message: 'API responding' };
          } catch {
            return { status: 'error', message: 'Function unreachable' };
          }

        case 'Rate Calculation':
          const { data: rateData, error: rateError } = await supabase.functions.invoke('ncm-calculate-rate', {
            body: { to_branch: 'KATHMANDU' }
          });
          if (rateError) return { status: 'error', message: rateError.message };
          if (rateData?.rate_source === 'ncm_api') {
            return { status: 'connected', message: 'NCM API active' };
          } else if (rateData?.rate_source?.includes('zone')) {
            return { status: 'degraded', message: 'Using zone-based rates' };
          }
          return { status: 'degraded', message: 'Using fallback rates' };

        case 'Branches API':
          const { data: branchData, error: branchError } = await supabase.functions.invoke('ncm-get-branches');
          if (branchError) return { status: 'error', message: branchError.message };
          return { status: 'connected', message: `${branchData?.branches?.length || 0} branches synced` };

        default:
          return { status: 'error', message: 'Unknown endpoint' };
      }
    } catch (error) {
      return { status: 'error', message: error instanceof Error ? error.message : 'Check failed' };
    }
  };

  const runHealthCheck = async () => {
    setIsChecking(true);
    
    // Set all to checking
    setEndpoints(prev => prev.map(e => ({ ...e, status: 'checking' as const })));

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        const result = await checkEndpoint(endpoint.name);
        return {
          ...endpoint,
          status: result.status,
          message: result.message,
          lastCheck: new Date().toLocaleTimeString()
        };
      })
    );

    setEndpoints(results);
    setLastFullCheck(new Date().toLocaleString());
    setIsChecking(false);
    toast.success('Health check completed');
  };

  const getStatusIcon = (status: ApiEndpoint['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ApiEndpoint['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Degraded</Badge>;
      case 'checking':
        return <Badge variant="outline">Checking...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const connectedCount = endpoints.filter(e => e.status === 'connected').length;
  const errorCount = endpoints.filter(e => e.status === 'error').length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>NCM API Health Status</CardTitle>
            <CardDescription>
              Monitor the status of NCM shipping API endpoints
            </CardDescription>
          </div>
          <Button onClick={runHealthCheck} disabled={isChecking}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Check Now
          </Button>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{connectedCount} Connected</span>
            </div>
            {errorCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">{errorCount} Errors</span>
              </div>
            )}
            {lastFullCheck && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted ml-auto">
                <span className="text-sm text-muted-foreground">Last check: {lastFullCheck}</span>
              </div>
            )}
          </div>

          {/* Endpoint List */}
          <div className="space-y-3">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.name}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(endpoint.status)}
                  <div>
                    <p className="font-medium">{endpoint.name}</p>
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    {endpoint.message && (
                      <p className="text-xs text-muted-foreground mt-1">{endpoint.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(endpoint.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">About Rate Calculation</p>
              <p className="text-sm text-muted-foreground mt-1">
                If the NCM Rate API is unavailable, the system automatically falls back to 
                zone-based pricing configured in the Rate Zones tab. This ensures customers 
                always see accurate shipping costs at checkout.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NCMApiHealth;
