import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, DollarSign, Loader2, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface RateZone {
  id: string;
  zone_name: string;
  branches: string[];
  base_rate: number;
  per_kg_rate: number;
  cod_fee: number;
  estimated_days: string;
  is_default: boolean;
  created_at: string;
}

const NCMRateZones = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<RateZone | null>(null);
  const [formData, setFormData] = useState({
    zone_name: '',
    branches: '',
    base_rate: 150,
    per_kg_rate: 30,
    cod_fee: 0,
    estimated_days: '3-5 days',
    is_default: false,
  });

  const { data: zones, isLoading } = useQuery({
    queryKey: ['ncm-rate-zones'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ncm_rate_zones')
        .select('*')
        .order('base_rate');
      if (error) throw error;
      return data as RateZone[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const zoneData = {
        zone_name: data.zone_name,
        branches: data.branches.split(',').map(b => b.trim().toUpperCase()).filter(Boolean),
        base_rate: data.base_rate,
        per_kg_rate: data.per_kg_rate,
        cod_fee: data.cod_fee,
        estimated_days: data.estimated_days,
        is_default: data.is_default,
      };

      if (data.id) {
        const { error } = await supabase
          .from('ncm_rate_zones')
          .update(zoneData)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ncm_rate_zones')
          .insert(zoneData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ncm-rate-zones'] });
      setIsDialogOpen(false);
      setEditingZone(null);
      resetForm();
      toast.success(editingZone ? 'Zone updated' : 'Zone created');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save zone');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ncm_rate_zones')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ncm-rate-zones'] });
      toast.success('Zone deleted');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete zone');
    },
  });

  const resetForm = () => {
    setFormData({
      zone_name: '',
      branches: '',
      base_rate: 150,
      per_kg_rate: 30,
      cod_fee: 0,
      estimated_days: '3-5 days',
      is_default: false,
    });
  };

  const openEditDialog = (zone: RateZone) => {
    setEditingZone(zone);
    setFormData({
      zone_name: zone.zone_name,
      branches: zone.branches.join(', '),
      base_rate: zone.base_rate,
      per_kg_rate: zone.per_kg_rate,
      cod_fee: zone.cod_fee,
      estimated_days: zone.estimated_days,
      is_default: zone.is_default,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingZone?.id,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Shipping Rate Zones
            </CardTitle>
            <CardDescription>
              Configure shipping rates for different regions. Branches not in any zone use the default zone.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingZone(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingZone ? 'Edit Zone' : 'Create Zone'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zone_name">Zone Name</Label>
                  <Input
                    id="zone_name"
                    value={formData.zone_name}
                    onChange={(e) => setFormData({ ...formData, zone_name: e.target.value })}
                    placeholder="e.g., Valley, Remote Areas"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_rate">Base Rate (Rs.)</Label>
                    <Input
                      id="base_rate"
                      type="number"
                      value={formData.base_rate}
                      onChange={(e) => setFormData({ ...formData, base_rate: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per_kg_rate">Per KG Rate (Rs.)</Label>
                    <Input
                      id="per_kg_rate"
                      type="number"
                      value={formData.per_kg_rate}
                      onChange={(e) => setFormData({ ...formData, per_kg_rate: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cod_fee">COD Fee (Rs.)</Label>
                    <Input
                      id="cod_fee"
                      type="number"
                      value={formData.cod_fee}
                      onChange={(e) => setFormData({ ...formData, cod_fee: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_days">Est. Delivery</Label>
                    <Input
                      id="estimated_days"
                      value={formData.estimated_days}
                      onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                      placeholder="e.g., 3-5 days"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branches">Branches (comma separated)</Label>
                  <Textarea
                    id="branches"
                    value={formData.branches}
                    onChange={(e) => setFormData({ ...formData, branches: e.target.value })}
                    placeholder="KATHMANDU, LALITPUR, BHAKTAPUR"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter branch names exactly as they appear in NCM
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_default">Default Zone (for unmatched branches)</Label>
                  <Switch
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingZone ? 'Update Zone' : 'Create Zone'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {zones?.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{zone.zone_name}</p>
                      {zone.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Base: Rs. {zone.base_rate}</span>
                      <span>Per KG: Rs. {zone.per_kg_rate}</span>
                      <span>{zone.estimated_days}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {zone.branches.length > 0 
                        ? `${zone.branches.length} branches: ${zone.branches.slice(0, 3).join(', ')}${zone.branches.length > 3 ? '...' : ''}`
                        : 'No specific branches (catches all unmatched)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(zone)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this zone?')) {
                          deleteMutation.mutate(zone.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!zones || zones.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  No rate zones configured. Add one to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NCMRateZones;
