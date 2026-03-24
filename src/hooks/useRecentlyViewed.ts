import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { products } from '@/data/products';
import { Product } from '@/types/product';
import { siteConfig } from '@/config/site.config';

const LOCAL_STORAGE_KEY = `${siteConfig.storeSlug}_recently_viewed`;
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const { user } = useAuth();
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasSyncedRef = useRef(false);

  // Load from localStorage first (instant, zero egress), then background-sync from Supabase
  useEffect(() => {
    // Always load from localStorage first for instant display
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setViewedIds(JSON.parse(saved));
      } catch {
        // Invalid JSON, ignore
      }
    }

    if (user && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      // Background sync from Supabase (merge with localStorage)
      supabase
        .from('recently_viewed')
        .select('product_id')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(MAX_ITEMS)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const remoteIds = data.map(d => d.product_id);
            // Merge: remote takes priority, then local, deduplicated
            setViewedIds(prev => {
              const merged = [...new Set([...remoteIds, ...prev])].slice(0, MAX_ITEMS);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
              return merged;
            });
          }
        });
    }

    setIsLoading(false);
  }, [user]);

  const addToRecentlyViewed = async (productId: string) => {
    const updated = [productId, ...viewedIds.filter(id => id !== productId)].slice(0, MAX_ITEMS);
    setViewedIds(updated);
    // Always save to localStorage (primary store)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (user) {
      // Background sync to Supabase (fire-and-forget)
      supabase.from('recently_viewed').upsert({
        user_id: user.id,
        product_id: productId,
        viewed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,product_id' });
    }
  };

  const getRecentlyViewedProducts = (): Product[] => {
    return viewedIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined);
  };

  return {
    viewedIds,
    isLoading,
    addToRecentlyViewed,
    getRecentlyViewedProducts,
  };
}
