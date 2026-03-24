import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Re-export optimized NCMBranches hook (localStorage cached, column-filtered)
export { useNCMBranches, useSyncNCMBranches, useUpdateBranchRate, useNCMBranchesAdmin } from './useNCMBranches';
export type { NCMBranch, NCMBranchFull } from './useNCMBranches';

interface CreateShipmentResponse {
  success: boolean;
  ncm_order_id?: number;
  ncm_tracking_id?: string;
  ncm_response?: Record<string, unknown>;
  error?: string;
  message?: string;
  warning?: string;
}

interface TrackShipmentResponse {
  success: boolean;
  ncm_order_id?: number;
  ncm_status?: string;
  mapped_status?: string;
  tracking_data?: Record<string, unknown>;
  error?: string;
}

interface CalculateRateResponse {
  success: boolean;
  rate: number;
  home_delivery_rate?: number;
  office_pickup_rate?: number;
  source_branch?: string;
  destination_branch?: string;
  delivery_type?: string;
  per_kg_rate?: number;
  estimated_days?: string;
  is_default?: boolean;
  error?: string;
}

interface SyncStatusesResponse {
  success: boolean;
  total?: number;
  updated?: number;
  failed?: number;
  errors?: string[];
  message?: string;
  error?: string;
}

interface NCMComment {
  comment: string;
  author: string;
  is_vendor?: boolean;
  created_at?: string;
}

interface CommentsResponse {
  success: boolean;
  ncm_order_id?: number;
  comments?: NCMComment[];
  error?: string;
}

interface TicketResponse {
  success: boolean;
  ticket_id?: string;
  ncm_ticket_id?: number;
  message?: string;
  error?: string;
}

interface ReturnExchangeResponse {
  success: boolean;
  order_id?: string;
  ncm_order_id?: number;
  status?: string;
  message?: string;
  new_ncm_order_id?: number;
  new_tracking_id?: string;
  error?: string;
}

interface RedirectResponse {
  success: boolean;
  order_id?: string;
  ncm_order_id?: number;
  message?: string;
  updated_fields?: {
    address?: string;
    branch?: string;
    phone?: string;
    cod?: number;
  };
  error?: string;
}

// Create shipment in NCM (admin action with additional fields)
export function useCreateNCMShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      deliveryType = "Door2Door",  // NCM expects: Door2Branch, Door2Door, Branch2Branch, Branch2Door
      packageDescription,
      weight = 0.5,
      codConfirmed = true
    }: {
      orderId: string;
      deliveryType?: string;
      packageDescription?: string;
      weight?: number;
      codConfirmed?: boolean;
    }): Promise<CreateShipmentResponse> => {
      const { data, error } = await supabase.functions.invoke("ncm-create-shipment", {
        body: { 
          order_id: orderId,
          delivery_type: deliveryType,
          package_description: packageDescription,
          weight,
          cod_confirmed: codConfirmed
        },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to create shipment");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({
        title: "Shipment created",
        description: `NCM Order ID: ${data.ncm_order_id}${data.ncm_tracking_id ? ` | Tracking: ${data.ncm_tracking_id}` : ''}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Shipment creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Track shipment status
export function useTrackNCMShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, ncmOrderId }: { orderId?: string; ncmOrderId?: number }): Promise<TrackShipmentResponse> => {
      const { data, error } = await supabase.functions.invoke("ncm-track-shipment", {
        body: { order_id: orderId, ncm_order_id: ncmOrderId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to track shipment");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Tracking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Calculate shipping rate (uses fixed source branch)
export function useCalculateShippingRate() {
  return useMutation({
    mutationFn: async ({ toBranch, deliveryType = "normal" }: {
      toBranch: string;
      deliveryType?: string;
    }): Promise<CalculateRateResponse> => {
      const { data, error } = await supabase.functions.invoke("ncm-calculate-rate", {
        body: { to_branch: toBranch, delivery_type: deliveryType },
      });
      if (error) throw error;
      return data;
    },
  });
}

// Sync all shipment statuses
export function useSyncNCMStatuses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<SyncStatusesResponse> => {
      const { data, error } = await supabase.functions.invoke("ncm-sync-statuses");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({
        title: "Status sync complete",
        description: data.message || `Updated ${data.updated || 0} orders`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Status sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Get NCM order comments
export function useNCMComments() {
  return useMutation({
    mutationFn: async ({ orderId, ncmOrderId }: { orderId?: string; ncmOrderId?: number }): Promise<CommentsResponse> => {
      const { data, error } = await supabase.functions.invoke("ncm-get-comments", {
        body: { order_id: orderId, ncm_order_id: ncmOrderId },
      });
      if (error) throw error;
      return data;
    },
  });
}

// Add comment to NCM order
export function useAddNCMComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, ncmOrderId, comment }: { 
      orderId?: string; 
      ncmOrderId?: number;
      comment: string;
    }): Promise<{ success: boolean; message?: string; error?: string }> => {
      const { data, error } = await supabase.functions.invoke("ncm-add-comment", {
        body: { order_id: orderId, ncm_order_id: ncmOrderId, comment },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to add comment");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ncm-comments"] });
      toast({
        title: "Comment added",
        description: "Your comment has been sent to NCM",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Create NCM support ticket
export function useCreateNCMTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, subject, message }: { 
      orderId?: string;
      subject: string;
      message: string;
    }): Promise<TicketResponse> => {
      const { data, error } = await supabase.functions.invoke("ncm-create-ticket", {
        body: { order_id: orderId, subject, message },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to create ticket");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ncm-tickets"] });
      toast({
        title: "Ticket created",
        description: "Your support ticket has been submitted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Close NCM support ticket
export function useCloseNCMTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, ncmTicketId }: { 
      ticketId?: string;
      ncmTicketId?: number;
    }): Promise<{ success: boolean; message?: string; error?: string }> => {
      const { data, error } = await supabase.functions.invoke("ncm-close-ticket", {
        body: { ticket_id: ticketId, ncm_ticket_id: ncmTicketId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to close ticket");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ncm-tickets"] });
      toast({
        title: "Ticket closed",
        description: "The support ticket has been closed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to close ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Initiate order return
export function useReturnOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { 
      orderId: string;
      reason?: string;
    }): Promise<ReturnExchangeResponse> => {
      const { data, error } = await supabase.functions.invoke("ncm-return-order", {
        body: { order_id: orderId, reason },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to initiate return");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({
        title: "Return initiated",
        description: "The return request has been submitted to NCM",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to initiate return",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Create exchange order
export function useExchangeOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, exchangeItems, reason }: { 
      orderId: string;
      exchangeItems?: unknown[];
      reason?: string;
    }): Promise<ReturnExchangeResponse> => {
      const { data, error } = await supabase.functions.invoke("ncm-exchange-order", {
        body: { order_id: orderId, exchange_items: exchangeItems, reason },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to create exchange");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({
        title: "Exchange created",
        description: "The exchange order has been created in NCM",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create exchange",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Redirect order (change address/branch/COD)
export function useRedirectOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newAddress, newBranch, newPhone, newCod }: { 
      orderId: string;
      newAddress?: string;
      newBranch?: string;
      newPhone?: string;
      newCod?: number;
    }): Promise<RedirectResponse> => {
      const { data, error } = await supabase.functions.invoke("ncm-redirect-order", {
        body: { 
          order_id: orderId, 
          new_address: newAddress,
          new_branch: newBranch,
          new_phone: newPhone,
          new_cod: newCod
        },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to redirect order");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({
        title: "Order redirected",
        description: "The order has been redirected successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to redirect order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Fetch local NCM comments for an order
export function useLocalNCMComments(orderId?: string) {
  return useQuery({
    queryKey: ["ncm-comments", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from("ncm_comments")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!orderId,
  });
}

// Fetch local NCM tickets
export function useNCMTickets(orderId?: string) {
  return useQuery({
    queryKey: ["ncm-tickets", orderId],
    queryFn: async () => {
      let query = supabase
        .from("ncm_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (orderId) {
        query = query.eq("order_id", orderId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

// Source branch constant - Fixed to NARAYANGHAT (your registered branch in NCM)
export const SOURCE_BRANCH = "NARAYANGHAT";

// District to branch mapping helper
export const DISTRICT_TO_BRANCH: Record<string, string> = {
  // Valley
  "Kathmandu": "TINKUNE",
  "Lalitpur": "TINKUNE",
  "Bhaktapur": "TINKUNE",
  // Province 1
  "Jhapa": "BIRTAMOD",
  "Morang": "BIRATNAGAR",
  "Sunsari": "ITAHARI",
  // Gandaki
  "Kaski": "POKHARA",
  // Lumbini
  "Rupandehi": "BUTWAL",
  // Bagmati
  "Chitwan": "NARAYANGHAT",
  "Makwanpur": "HETAUDA",
};

export function getBranchFromDistrict(district: string): string {
  const normalizedDistrict = district.trim();
  return DISTRICT_TO_BRANCH[normalizedDistrict] || "TINKUNE";
}
