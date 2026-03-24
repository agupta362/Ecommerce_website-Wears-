import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  store_code: string;
  sequence_number: number;
  generated_at: string;
  generated_by: string | null;
  pdf_url: string | null;
}

interface GenerateInvoiceResponse {
  success: boolean;
  invoice: Invoice;
  error?: string;
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://bglggsewgfvsbwngexvy.supabase.co/functions/v1/generate-invoice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate invoice');
      }

      return response.json() as Promise<GenerateInvoiceResponse>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: 'Invoice Generated',
        description: `Invoice ${data.invoice.invoice_number} created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useOrderInvoice(orderId: string | undefined) {
  return useQuery({
    queryKey: ['invoice', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;
      return data as Invoice | null;
    },
    enabled: !!orderId,
  });
}

export function useUserInvoices() {
  return useQuery({
    queryKey: ['user-invoices'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get invoices for user's orders
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          orders!inner (
            id,
            order_number,
            user_id,
            total,
            status
          )
        `)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}