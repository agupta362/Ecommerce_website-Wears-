import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getFromCache, setInCache, clearCache } from '@/lib/clientCache';

// Cache TTL - 1 hour for settings that rarely change
const SETTINGS_CACHE_TTL = 60 * 60 * 1000;

// ============================================================================
// TYPES
// ============================================================================

export interface PriceFilterSettings {
  min: number;
  max: number;
  step: number;
}

export interface LoyaltySettings {
  enabled: boolean;
  requiresSignup: boolean;
  freeItemThreshold: number;
  freeItemValue: number;
  rewardCodeExpiryDays: number;
  itemLabel: string;
}

export interface BundleDeal {
  id: string;
  name: string;
  description: string;
  requiredCount: number;
  freeShipping: boolean;
  discountAmount: number;
  bonusPoints: number;
}

export interface BundlesSettings {
  enabled: boolean;
  deals: BundleDeal[];
  pointsToFreeItem: number;
}

interface StoreSettingRow {
  id: string;
  key: string;
  value: LoyaltySettings | BundlesSettings;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_PRICE_FILTER: PriceFilterSettings = {
  min: 0,
  max: 10000,
  step: 100,
};

export const DEFAULT_LOYALTY_SETTINGS: LoyaltySettings = {
  enabled: true,
  requiresSignup: true,
  freeItemThreshold: 9,
  freeItemValue: 1600,
  rewardCodeExpiryDays: 90,
  itemLabel: 'jersey',
};

export const DEFAULT_BUNDLES_SETTINGS: BundlesSettings = {
  enabled: true,
  deals: [
    { id: 'duo', name: 'Duo Pack', description: 'Buy any 2 items', requiredCount: 2, freeShipping: true, discountAmount: 0, bonusPoints: 2 },
    { id: 'trio', name: 'Trio Pack', description: 'Buy any 3 items', requiredCount: 3, freeShipping: true, discountAmount: 300, bonusPoints: 3 },
    { id: 'squad', name: 'Squad Deal', description: 'Buy 4+ items', requiredCount: 4, freeShipping: true, discountAmount: 500, bonusPoints: 4 },
  ],
  pointsToFreeItem: 9,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch price filter settings from the database
 */
export const usePriceFilterSettings = () => {
  return useQuery({
    queryKey: ['store-settings', 'price_filter'],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<PriceFilterSettings> => {
      const cached = getFromCache<PriceFilterSettings>('price-filter-settings');
      if (cached) return cached;

      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('key', 'price_filter')
        .maybeSingle();

      if (error) {
        console.error('Error fetching price filter settings:', error);
        return DEFAULT_PRICE_FILTER;
      }

      if (!data) return DEFAULT_PRICE_FILTER;

      const settings = (data as unknown as StoreSettingRow).value as unknown as PriceFilterSettings;
      setInCache('price-filter-settings', settings, SETTINGS_CACHE_TTL);
      return settings;
    },
  });
};

/**
 * Update price filter settings (admin only)
 */
export const useUpdatePriceFilterSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: PriceFilterSettings) => {
      // Upsert: insert if not exists, update if exists
      const { error } = await supabase
        .from('store_settings')
        .upsert({ key: 'price_filter', value: JSON.parse(JSON.stringify(settings)) }, { onConflict: 'key' });

      if (error) throw error;
      return settings;
    },
    onSuccess: () => {
      clearCache('price-filter-settings');
      queryClient.invalidateQueries({ queryKey: ['store-settings', 'price_filter'] });
    },
  });
};

/**
 * Fetch loyalty settings from the database
 */
export const useLoyaltySettings = () => {
  return useQuery({
    queryKey: ['store-settings', 'loyalty'],
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    queryFn: async (): Promise<LoyaltySettings> => {
      // Check client cache first
      const cached = getFromCache<LoyaltySettings>('loyalty-settings');
      if (cached) return cached;
      
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('key', 'loyalty')
        .maybeSingle();

      if (error) {
        console.error('Error fetching loyalty settings:', error);
        return DEFAULT_LOYALTY_SETTINGS;
      }

      if (!data) return DEFAULT_LOYALTY_SETTINGS;
      
      // Type assertion since we know the structure
      const settings = (data as unknown as StoreSettingRow).value as LoyaltySettings;
      setInCache('loyalty-settings', settings, SETTINGS_CACHE_TTL);
      return settings;
    },
  });
};

/**
 * Fetch bundle settings from the database
 */
export const useBundlesSettings = () => {
  return useQuery({
    queryKey: ['store-settings', 'bundles'],
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    queryFn: async (): Promise<BundlesSettings> => {
      // Check client cache first
      const cached = getFromCache<BundlesSettings>('bundles-settings');
      if (cached) return cached;
      
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('key', 'bundles')
        .maybeSingle();

      if (error) {
        console.error('Error fetching bundles settings:', error);
        return DEFAULT_BUNDLES_SETTINGS;
      }

      if (!data) return DEFAULT_BUNDLES_SETTINGS;
      
      const settings = (data as unknown as StoreSettingRow).value as BundlesSettings;
      setInCache('bundles-settings', settings, SETTINGS_CACHE_TTL);
      return settings;
    },
  });
};

/**
 * Update loyalty settings (admin only)
 */
export const useUpdateLoyaltySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: LoyaltySettings) => {
      const { error } = await supabase
        .from('store_settings')
        .update({ value: JSON.parse(JSON.stringify(settings)) })
        .eq('key', 'loyalty');

      if (error) throw error;
      return settings;
    },
    onSuccess: () => {
      // Clear localStorage cache when settings are updated
      clearCache('loyalty-settings');
      queryClient.invalidateQueries({ queryKey: ['store-settings', 'loyalty'] });
    },
  });
};

/**
 * Update bundles settings (admin only)
 */
export const useUpdateBundlesSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: BundlesSettings) => {
      const { error } = await supabase
        .from('store_settings')
        .update({ value: JSON.parse(JSON.stringify(settings)) })
        .eq('key', 'bundles');

      if (error) throw error;
      return settings;
    },
    onSuccess: () => {
      // Clear localStorage cache when settings are updated
      clearCache('bundles-settings');
      queryClient.invalidateQueries({ queryKey: ['store-settings', 'bundles'] });
    },
  });
};
