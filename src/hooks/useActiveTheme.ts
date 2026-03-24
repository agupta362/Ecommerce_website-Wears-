import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface ActiveThemeConfig {
  templateId: string;
  googleFonts: string;
  fonts: { display: string; body: string };
  borderRadius: string;
  navStyle: string;
  heroLayout: string;
  gridLayout: string;
  cardStyle: string;
  animationStyle: string;
  colors: {
    light: Record<string, { h: number; s: number; l: number }>;
    dark: Record<string, { h: number; s: number; l: number }>;
  };
}

const QUERY_KEY = ['store-settings', 'active_theme'];

export function useActiveTheme() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<ActiveThemeConfig | null> => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'active_theme')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return data.value as unknown as ActiveThemeConfig;
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useUpdateActiveTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: ActiveThemeConfig) => {
      // Check if key already exists
      const { data: existing } = await supabase
        .from('store_settings')
        .select('id')
        .eq('key', 'active_theme')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('store_settings')
          .update({ value: config as unknown as Json })
          .eq('key', 'active_theme');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('store_settings')
          .insert({ key: 'active_theme', value: config as unknown as Json });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
