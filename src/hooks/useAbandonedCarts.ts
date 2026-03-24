import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AbandonedCartStats {
  totalAbandoned: number;
  recovered: number;
  recoveryRate: number;
  pendingRecovery: number;
  firstRemindersSent: number;
  secondRemindersSent: number;
  totalPotentialRevenue: number;
  recoveredRevenue: number;
}

export const useAbandonedCartStats = () => {
  return useQuery({
    queryKey: ['abandoned-cart-stats'],
    queryFn: async (): Promise<AbandonedCartStats> => {
      // Fetch all abandoned carts
      const { data: carts, error } = await supabase
        .from('abandoned_carts')
        .select('*');

      if (error) throw error;

      const totalAbandoned = carts?.length || 0;
      const recovered = carts?.filter(c => c.recovered_at !== null).length || 0;
      const pendingRecovery = carts?.filter(c => c.recovered_at === null).length || 0;
      const firstRemindersSent = carts?.filter(c => c.first_reminder_sent_at !== null).length || 0;
      const secondRemindersSent = carts?.filter(c => c.second_reminder_sent_at !== null).length || 0;

      const totalPotentialRevenue = carts?.reduce((sum, c) => sum + Number(c.cart_total || 0), 0) || 0;
      const recoveredRevenue = carts
        ?.filter(c => c.recovered_at !== null)
        .reduce((sum, c) => sum + Number(c.cart_total || 0), 0) || 0;

      const recoveryRate = totalAbandoned > 0 ? (recovered / totalAbandoned) * 100 : 0;

      return {
        totalAbandoned,
        recovered,
        recoveryRate,
        pendingRecovery,
        firstRemindersSent,
        secondRemindersSent,
        totalPotentialRevenue,
        recoveredRevenue,
      };
    },
  });
};

interface AbandonedCart {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  items: unknown;
  cart_total: number;
  created_at: string;
  first_reminder_sent_at: string | null;
  second_reminder_sent_at: string | null;
  recovered_at: string | null;
  discount_code: string | null;
}

export const useAbandonedCarts = () => {
  return useQuery({
    queryKey: ['abandoned-carts'],
    queryFn: async (): Promise<AbandonedCart[]> => {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });
};
