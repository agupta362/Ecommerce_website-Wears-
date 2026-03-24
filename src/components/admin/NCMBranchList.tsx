import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, MapPin, Loader2, CheckCircle2, Save } from 'lucide-react';
import { useNCMBranchesAdmin, useSyncNCMBranches, useUpdateBranchRate, NCMBranchFull } from '@/hooks/useNCMBranches';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

interface BranchEditState {
  [branchId: string]: {
    shipping_rate: number;
    estimated_days: string;
  };
}

const NCMBranchList = () => {
  const { data: branches, isLoading, refetch } = useNCMBranchesAdmin();
  const syncBranches = useSyncNCMBranches();
  const updateBranchRate = useUpdateBranchRate();
  const [searchQuery, setSearchQuery] = useState('');
  const [editedBranches, setEditedBranches] = useState<BranchEditState>({});
  const [bulkRate, setBulkRate] = useState('');

  const handleSync = async () => {
    try {
      await syncBranches.mutateAsync();
      await refetch();
      toast.success('Branches synced successfully');
    } catch (error) {
      toast.error('Failed to sync branches');
    }
  };

  const handleRateChange = (branchId: string, field: 'shipping_rate' | 'estimated_days', value: string | number) => {
    setEditedBranches(prev => ({
      ...prev,
      [branchId]: {
        shipping_rate: field === 'shipping_rate' ? Number(value) : (prev[branchId]?.shipping_rate ?? 150),
        estimated_days: field === 'estimated_days' ? String(value) : (prev[branchId]?.estimated_days ?? '3-5 days'),
      }
    }));
  };

  const handleSaveBranch = async (branchId: string) => {
    const edited = editedBranches[branchId];
    if (!edited) return;

    try {
      await updateBranchRate.mutateAsync({
        branchId,
        shipping_rate: edited.shipping_rate,
        estimated_days: edited.estimated_days,
      });
      setEditedBranches(prev => {
        const { [branchId]: _, ...rest } = prev;
        return rest;
      });
      toast.success('Branch rate updated');
    } catch (error) {
      toast.error('Failed to update branch rate');
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkRate || !filteredBranches.length) return;
    
    const rate = Number(bulkRate);
    if (isNaN(rate) || rate < 0) {
      toast.error('Please enter a valid rate');
      return;
    }

    try {
      await Promise.all(
        filteredBranches.map(branch =>
          updateBranchRate.mutateAsync({
            branchId: branch.id,
            shipping_rate: rate,
          })
        )
      );
      setBulkRate('');
      toast.success(`Updated ${filteredBranches.length} branches to Rs. ${rate}`);
    } catch (error) {
      toast.error('Failed to update some branches');
    }
  };

  const filteredBranches = branches?.filter(branch =>
    branch.branch_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const lastSyncTime = branches?.[0]?.last_synced_at 
    ? new Date(branches[0].last_synced_at).toLocaleString()
    : 'Never';

  const getBranchValue = (branchId: string, field: 'shipping_rate' | 'estimated_days', defaultVal: number | string | null | undefined) => {
    if (editedBranches[branchId]) {
      return editedBranches[branchId][field];
    }
    return defaultVal ?? (field === 'shipping_rate' ? 150 : '3-5 days');
  };

  const hasChanges = (branchId: string, branch: { shipping_rate?: number | null; estimated_days?: string | null }) => {
    const edited = editedBranches[branchId];
    if (!edited) return false;
    return edited.shipping_rate !== (branch.shipping_rate ?? 150) || 
           edited.estimated_days !== (branch.estimated_days ?? '3-5 days');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              NCM Branch Shipping Rates
            </CardTitle>
            <CardDescription>
              Set shipping rates for each of the {branches?.length || 0} branches • Last synced: {lastSyncTime}
            </CardDescription>
          </div>
          <Button 
            onClick={handleSync} 
            disabled={syncBranches.isPending}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncBranches.isPending ? 'animate-spin' : ''}`} />
            Sync Branches
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Branch List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 rounded-lg font-medium text-sm">
                  <div className="col-span-5">Branch</div>
                  <div className="col-span-3">Rate (Rs.)</div>
                  <div className="col-span-3">Est. Days</div>
                  <div className="col-span-1"></div>
                </div>

                {filteredBranches.map((branch) => (
                  <div
                    key={branch.id}
                    className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {/* Branch Name */}
                    <div className="col-span-5 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{branch.branch_name}</p>
                        <p className="text-xs text-muted-foreground">ID: {branch.branch_id}</p>
                      </div>
                    </div>

                    {/* Shipping Rate */}
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={getBranchValue(branch.id, 'shipping_rate', branch.shipping_rate)}
                        onChange={(e) => handleRateChange(branch.id, 'shipping_rate', e.target.value)}
                        className="h-8 w-24"
                        min={0}
                      />
                    </div>

                    {/* Estimated Days */}
                    <div className="col-span-3">
                      <Input
                        type="text"
                        value={getBranchValue(branch.id, 'estimated_days', branch.estimated_days)}
                        onChange={(e) => handleRateChange(branch.id, 'estimated_days', e.target.value)}
                        className="h-8"
                        placeholder="3-5 days"
                      />
                    </div>

                    {/* Save Button */}
                    <div className="col-span-1">
                      {hasChanges(branch.id, branch) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveBranch(branch.id)}
                          disabled={updateBranchRate.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      )}
                      {!hasChanges(branch.id, branch) && branch.is_active && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
                {filteredBranches.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? 'No branches match your search' : 'No branches found'}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Bulk Actions */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Set {searchQuery ? 'filtered' : 'all'} to Rs.</Label>
                <Input
                  type="number"
                  value={bulkRate}
                  onChange={(e) => setBulkRate(e.target.value)}
                  className="h-8 w-24"
                  placeholder="150"
                  min={0}
                />
                <Button
                  size="sm"
                  onClick={handleBulkUpdate}
                  disabled={!bulkRate || filteredBranches.length === 0 || updateBranchRate.isPending}
                >
                  Apply to {filteredBranches.length} branches
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Default rate for branches without custom pricing: Rs. 150
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{branches?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Branches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {branches?.filter(b => b.is_active).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{filteredBranches.length}</p>
              <p className="text-xs text-muted-foreground">Showing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NCMBranchList;
