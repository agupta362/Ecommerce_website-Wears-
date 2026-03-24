import { RefreshCw, GitBranch, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNCMBranchesAdmin, useSyncNCMBranches } from '@/hooks/useNCM';

export default function NCMBranchSync() {
  const { data: branches, isLoading } = useNCMBranchesAdmin();
  const syncBranches = useSyncNCMBranches();

  const lastSynced = branches?.[0]?.last_synced_at
    ? new Date(branches[0].last_synced_at).toLocaleString()
    : 'Never';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            NCM Branches
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncBranches.mutate()}
            disabled={syncBranches.isPending}
          >
            {syncBranches.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Sync Branches
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Branches</span>
            <Badge variant="secondary">
              {isLoading ? '...' : branches?.length || 0}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last Synced
            </span>
            <span className="text-xs">{lastSynced}</span>
          </div>
          
          {/* Branch List Preview */}
          {branches && branches.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Active Branches:</p>
              <div className="flex flex-wrap gap-1">
                {branches.slice(0, 8).map((branch) => (
                  <Badge key={branch.id} variant="outline" className="text-xs">
                    {branch.branch_name}
                  </Badge>
                ))}
                {branches.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{branches.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
