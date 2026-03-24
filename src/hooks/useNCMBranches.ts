import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getFromCache, setInCache } from '@/lib/clientCache';

const NCM_CACHE_KEY = 'ncm-branches-v2';
const NCM_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Streamlined interface - only fields needed for checkout
export interface NCMBranch {
  id: string;
  branch_id: number;
  branch_name: string;
  shipping_rate: number | null;
  office_pickup_rate: number | null;
  estimated_days: string | null;
}

// Extended interface for admin features
export interface NCMBranchFull extends NCMBranch {
  covered_areas: string[] | null;
  is_active: boolean | null;
  last_synced_at: string | null;
  per_kg_rate: number | null;
}

export const useNCMBranches = () => {
  return useQuery({
    queryKey: ['ncm-branches'],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (static data)
    gcTime: 48 * 60 * 60 * 1000, // 48 hours cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false, // Use cached data
    queryFn: async () => {
      // Check localStorage first
      const cached = getFromCache<NCMBranch[]>(NCM_CACHE_KEY);
      if (cached && cached.length > 0) {
        return cached;
      }
      
      // Fetch only needed columns (~65% payload reduction)
      const { data, error } = await supabase
        .from('ncm_branches')
        .select('id, branch_id, branch_name, shipping_rate, office_pickup_rate, estimated_days')
        .eq('is_active', true)
        .order('branch_name');
      
      if (error) throw error;
      
      const branches = data as NCMBranch[];
      setInCache(NCM_CACHE_KEY, branches, NCM_CACHE_TTL);
      return branches;
    },
  });
};

// Full data hook for admin features (includes all columns)
export const useNCMBranchesAdmin = () => {
  return useQuery({
    queryKey: ['ncm-branches-admin'],
    staleTime: 5 * 60 * 1000, // 5 minutes for admin (need fresher data)
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ncm_branches')
        .select('*')
        .eq('is_active', true)
        .order('branch_name');
      
      if (error) throw error;
      return data as NCMBranchFull[];
    },
  });
};

export const useSyncNCMBranches = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ncm-get-branches');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ncm-branches'] });
      // Clear localStorage cache to force fresh fetch
      try {
        localStorage.removeItem('app_cache_' + NCM_CACHE_KEY);
      } catch {}
    },
  });
};

export const useUpdateBranchRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      branchId, 
      shipping_rate, 
      per_kg_rate,
      estimated_days 
    }: { 
      branchId: string; 
      shipping_rate?: number;
      per_kg_rate?: number;
      estimated_days?: string;
    }) => {
      const updates: Record<string, number | string> = {};
      if (shipping_rate !== undefined) updates.shipping_rate = shipping_rate;
      if (per_kg_rate !== undefined) updates.per_kg_rate = per_kg_rate;
      if (estimated_days !== undefined) updates.estimated_days = estimated_days;

      const { data, error } = await supabase
        .from('ncm_branches')
        .update(updates)
        .eq('id', branchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ncm-branches'] });
      // Clear localStorage cache to force fresh fetch
      try {
        localStorage.removeItem('app_cache_' + NCM_CACHE_KEY);
      } catch {}
    },
  });
};
