import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { checkRateLimit } from '@/hooks/useRateLimit';

export interface DbReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as DbReview[];
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reviewData: {
      product_id: string;
      rating: number;
      comment: string;
    }) => {
      if (!user) throw new Error('Must be logged in to review');

      // Check rate limit
      const rateLimitResult = await checkRateLimit('review', user.id);
      if (!rateLimitResult.allowed) {
        throw new Error(rateLimitResult.message || 'Too many review submissions. Please try again later.');
      }

      // Check if user has purchased this product
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_items!inner(product_id)')
        .eq('user_id', user.id)
        .eq('status', 'delivered');

      const hasPurchased = orders?.some(order => 
        order.order_items?.some((item: any) => item.product_id === reviewData.product_id)
      );

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          user_id: user.id,
          is_verified_purchase: hasPurchased || false,
          is_approved: false, // Requires admin approval
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] });
      toast.success('Review submitted! It will appear after approval.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAdminReviews() {
  return useQuery({
    queryKey: ['admin-reviews'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as DbReview[];
    },
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, approved }: { reviewId: string; approved: boolean }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: approved })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review updated');
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review deleted');
    },
  });
}
