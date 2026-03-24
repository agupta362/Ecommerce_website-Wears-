import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
}

/**
 * Fetch aggregated review stats (avg rating, count) for a product.
 * Only counts approved reviews.
 */
export function useReviewStats(productId: string | undefined) {
  return useQuery({
    queryKey: ['review-stats', productId],
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<ReviewStats> => {
      if (!productId) return { averageRating: 0, reviewCount: 0 };

      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true);

      if (error) {
        console.error('Error fetching review stats:', error);
        return { averageRating: 0, reviewCount: 0 };
      }

      if (!data || data.length === 0) {
        return { averageRating: 0, reviewCount: 0 };
      }

      const sum = data.reduce((acc, r) => acc + r.rating, 0);
      return {
        averageRating: Math.round((sum / data.length) * 10) / 10,
        reviewCount: data.length,
      };
    },
  });
}

/**
 * Batch fetch review stats for multiple products at once.
 * Returns a map of productId -> ReviewStats.
 */
export function useBulkReviewStats(productIds: string[]) {
  return useQuery({
    queryKey: ['review-stats-bulk', productIds.sort().join(',')],
    enabled: productIds.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<Record<string, ReviewStats>> => {
      const { data, error } = await supabase
        .from('reviews')
        .select('product_id, rating')
        .in('product_id', productIds)
        .eq('is_approved', true);

      if (error) {
        console.error('Error fetching bulk review stats:', error);
        return {};
      }

      const statsMap: Record<string, { sum: number; count: number }> = {};
      for (const review of data || []) {
        if (!statsMap[review.product_id]) {
          statsMap[review.product_id] = { sum: 0, count: 0 };
        }
        statsMap[review.product_id].sum += review.rating;
        statsMap[review.product_id].count += 1;
      }

      const result: Record<string, ReviewStats> = {};
      for (const [pid, s] of Object.entries(statsMap)) {
        result[pid] = {
          averageRating: Math.round((s.sum / s.count) * 10) / 10,
          reviewCount: s.count,
        };
      }
      return result;
    },
  });
}
