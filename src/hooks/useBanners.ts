import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getFromCache, setInCache } from '@/lib/clientCache';

// Cache TTLs
const BANNER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export interface SaleBanner {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string;
  button_link: string;
  background_style: string;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useActiveBanners = () => {
  return useQuery({
    queryKey: ['active-banners'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    queryFn: async () => {
      // Check client cache first
      const cached = getFromCache<SaleBanner[]>('active-banners');
      if (cached) return cached;
      
      const { data, error } = await supabase
        .from('sale_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      const banners = (data || []) as SaleBanner[];
      setInCache('active-banners', banners, BANNER_CACHE_TTL);
      return banners;
    },
  });
};

export const useAdminBanners = () => {
  return useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sale_banners')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return (data || []) as SaleBanner[];
    },
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bannerData: Omit<SaleBanner, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sale_banners')
        .insert([bannerData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['active-banners'] });
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...bannerData }: Partial<SaleBanner> & { id: string }) => {
      const { error } = await supabase
        .from('sale_banners')
        .update(bannerData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['active-banners'] });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sale_banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['active-banners'] });
    },
  });
};
