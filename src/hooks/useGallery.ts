import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  description: string | null;
  product_id: string | null;
  display_size: 'small' | 'medium' | 'large' | 'tall';
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  } | null;
}

export const useCommunityImages = (limit = 6) => {
  return useQuery({
    queryKey: ['community-gallery-images', limit],
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, image_url, title')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
};

export const useActiveGalleryImages = () => {
  return useQuery({
    queryKey: ['active-gallery-images'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select(`
          *,
          products (
            id,
            name,
            slug,
            price,
            images
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as GalleryImage[];
    },
  });
};

export const useAdminGalleryImages = () => {
  return useQuery({
    queryKey: ['admin-gallery-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select(`
          *,
          products (
            id,
            name,
            slug,
            price,
            images
          )
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as GalleryImage[];
    },
  });
};

export const useCreateGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at' | 'products'>) => {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert(image)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['active-gallery-images'] });
    },
  });
};

export const useUpdateGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GalleryImage> & { id: string }) => {
      const { data, error } = await supabase
        .from('gallery_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['active-gallery-images'] });
    },
  });
};

export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['active-gallery-images'] });
    },
  });
};
