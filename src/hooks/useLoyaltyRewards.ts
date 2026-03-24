import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface LoyaltyReward {
  id: string;
  user_id: string;
  total_jerseys_purchased: number;
  bonus_points: number;
  free_kits_earned: number;
  free_kits_redeemed: number;
  created_at: string;
  updated_at: string;
}

export interface RewardCode {
  id: string;
  user_id: string;
  code: string;
  reward_type: string;
  discount_value: number;
  is_used: boolean;
  used_at: string | null;
  used_in_order_id: string | null;
  expires_at: string;
  created_at: string;
}

export interface LoyaltyData {
  totalJerseys: number;
  bonusPoints: number;
  freeKitsEarned: number;
  freeKitsRedeemed: number;
  progressToFreeKit: number; // 0-8
  jerseysToGo: number; // jerseys needed for next free kit
  availableCodes: RewardCode[];
  availableFreeKits: number; // earned - redeemed
}

export const useLoyaltyRewards = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['loyalty-rewards', user?.id],
    queryFn: async (): Promise<LoyaltyData> => {
      if (!user) {
        return {
          totalJerseys: 0,
          bonusPoints: 0,
          freeKitsEarned: 0,
          freeKitsRedeemed: 0,
          progressToFreeKit: 0,
          jerseysToGo: 9,
          availableCodes: [],
          availableFreeKits: 0,
        };
      }

      // Fetch loyalty record
      const { data: loyalty, error: loyaltyError } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (loyaltyError) throw loyaltyError;

      // Fetch available (unused, unexpired) reward codes
      const { data: codes, error: codesError } = await supabase
        .from('reward_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;

      const totalJerseys = loyalty?.total_jerseys_purchased || 0;
      const progressToFreeKit = totalJerseys % 9;
      const jerseysToGo = 9 - progressToFreeKit;
      const freeKitsEarned = loyalty?.free_kits_earned || 0;
      const freeKitsRedeemed = loyalty?.free_kits_redeemed || 0;

      return {
        totalJerseys,
        bonusPoints: loyalty?.bonus_points || 0,
        freeKitsEarned,
        freeKitsRedeemed,
        progressToFreeKit,
        jerseysToGo: progressToFreeKit === 0 && totalJerseys > 0 ? 9 : jerseysToGo,
        availableCodes: (codes || []) as RewardCode[],
        availableFreeKits: freeKitsEarned - freeKitsRedeemed,
      };
    },
    enabled: !!user,
  });
};

// Hook to validate a reward code before checkout
export const useValidateRewardCode = () => {
  const { user } = useAuth();

  const validateCode = async (code: string): Promise<RewardCode | null> => {
    if (!user || !code.trim()) return null;

    const { data, error } = await supabase
      .from('reward_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('user_id', user.id)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !data) return null;
    return data as RewardCode;
  };

  return { validateCode };
};

// Function to mark reward code as used (called after successful order)
export const useRewardCode = async (code: string, orderId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('use_reward_code', {
    p_code: code.toUpperCase().trim(),
    p_order_id: orderId,
  });

  if (error) {
    console.error('Error using reward code:', error);
    return false;
  }

  return data as boolean;
};
