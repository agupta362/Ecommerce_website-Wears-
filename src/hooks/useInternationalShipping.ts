import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InternationalShippingZone {
  id: string;
  zone_name: string;
  countries: string[];
  flat_rate: number;
  per_kg_rate: number;
  estimated_days: string;
  is_active: boolean;
}

export function useInternationalShippingZones() {
  return useQuery({
    queryKey: ['international-shipping-zones'],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<InternationalShippingZone[]> => {
      const { data, error } = await supabase
        .from('international_shipping_zones' as any)
        .select('*')
        .eq('is_active', true)
        .order('flat_rate', { ascending: true });

      if (error) {
        console.error('Error fetching intl shipping zones:', error);
        return [];
      }

      return (data ?? []) as unknown as InternationalShippingZone[];
    },
  });
}

/**
 * Find the shipping zone for a given country code.
 */
export function findZoneForCountry(zones: InternationalShippingZone[], countryCode: string): InternationalShippingZone | null {
  return zones.find(z => z.countries.includes(countryCode.toUpperCase())) ?? null;
}
