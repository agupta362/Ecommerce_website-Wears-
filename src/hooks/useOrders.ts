import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Json } from '@/integrations/supabase/types';
import { checkRateLimit, getAnonymousIdentifier } from '@/hooks/useRateLimit';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'esewa' | 'khalti';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  phone2?: string;
  district: string;
  city: string;
  address: string;
}

export interface DbOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_screenshot_url: string | null;
  subtotal: number;
  shipping_cost: number;
  gift_wrap_cost: number;
  discount_amount: number;
  total: number;
  shipping_address: ShippingAddress;
  notes: string | null;
  admin_notes: string | null;
  gift_wrap: boolean;
  gift_message: string | null;
  discount_code: string | null;
  created_at: string;
  updated_at: string;
  order_items?: DbOrderItem[];
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string;
  quantity: number;
  price: number;
}

// Helper to safely parse shipping address from Json
const parseShippingAddress = (address: Json): ShippingAddress => {
  if (typeof address === 'object' && address !== null && !Array.isArray(address)) {
    return {
      fullName: String((address as Record<string, unknown>).fullName || ''),
      phone: String((address as Record<string, unknown>).phone || ''),
      phone2: String((address as Record<string, unknown>).phone2 || ''),
      district: String((address as Record<string, unknown>).district || ''),
      city: String((address as Record<string, unknown>).city || ''),
      address: String((address as Record<string, unknown>).address || ''),
    };
  }
  return { fullName: '', phone: '', phone2: '', district: '', city: '', address: '' };
};

// Transform raw order data to DbOrder
const transformOrder = (order: Record<string, unknown>): DbOrder => ({
  ...order,
  shipping_address: parseShippingAddress(order.shipping_address as Json),
} as DbOrder);

export const useMyOrders = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-orders', user?.id],
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data ?? []).map(order => transformOrder(order as Record<string, unknown>));
    },
    enabled: !!user,
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .maybeSingle();
      
      if (error) throw error;
      return data ? transformOrder(data as Record<string, unknown>) : null;
    },
    enabled: !!orderId,
  });
};

export const useAdminOrders = (status?: OrderStatus) => {
  return useQuery({
    queryKey: ['admin-orders', status],
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data ?? []).map(order => transformOrder(order as Record<string, unknown>));
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (orderData: {
      items: { productId: string; productName: string; productImage: string; size: string; quantity: number; price: number }[];
      shippingAddress: ShippingAddress;
      paymentMethod: PaymentMethod;
      subtotal: number;
      shippingCost: number;
      giftWrapCost: number;
      discountAmount: number;
      total: number;
      giftWrap: boolean;
      giftMessage?: string;
      discountCode?: string;
      notes?: string;
      guestEmail?: string;
      guestPhone?: string;
      destinationBranch?: number;
      alternatePhone?: string;
      deliveryInstruction?: string;
      deliveryType?: 'home_delivery' | 'office_pickup';
    }) => {
      // Check rate limit - but don't block orders if rate limiter fails
      try {
        const identifier = user?.id || orderData.guestEmail?.toLowerCase() || getAnonymousIdentifier();
        const rateLimitResult = await checkRateLimit('order', identifier);
        if (!rateLimitResult.allowed) {
          throw new Error(rateLimitResult.message || 'Too many orders placed. Please try again later.');
        }
      } catch (rateLimitError) {
        // Log but don't block if rate limiter has issues
        console.warn('Rate limit check failed, proceeding with order:', rateLimitError);
      }

      // Use Edge Function to create order atomically (fixes guest order item manipulation vulnerability)
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          items: orderData.items,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          subtotal: orderData.subtotal,
          shippingCost: orderData.shippingCost,
          giftWrapCost: orderData.giftWrapCost,
          discountAmount: orderData.discountAmount,
          total: orderData.total,
          giftWrap: orderData.giftWrap,
          giftMessage: orderData.giftMessage,
          discountCode: orderData.discountCode,
          notes: orderData.notes,
          guestEmail: orderData.guestEmail,
          guestPhone: orderData.guestPhone,
          destinationBranch: orderData.destinationBranch,
          alternatePhone: orderData.alternatePhone,
          deliveryInstruction: orderData.deliveryInstruction,
          deliveryType: orderData.deliveryType,
        },
      });

      if (error) {
        console.error('Order creation failed:', error);
        throw new Error(error.message || 'Failed to create order');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create order');
      }

      const order = data.order;

      // Send admin notification email (non-blocking)
      supabase.functions.invoke('send-order-notification', {
        body: {
          orderNumber: order.order_number,
          items: orderData.items.map(item => ({
            productName: item.productName,
            productImage: item.productImage,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          subtotal: orderData.subtotal,
          shippingCost: orderData.shippingCost,
          giftWrapCost: orderData.giftWrapCost,
          discountAmount: orderData.discountAmount,
          total: orderData.total,
          giftWrap: orderData.giftWrap,
          giftMessage: orderData.giftMessage,
          discountCode: orderData.discountCode,
          notes: orderData.notes,
          guestEmail: orderData.guestEmail,
          guestPhone: orderData.guestPhone,
          createdAt: order.created_at,
        }
      }).catch(err => console.error('Failed to send admin notification:', err));
      
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status, adminNotes }: { orderId: string; status: OrderStatus; adminNotes?: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          admin_notes: adminNotes,
        })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};

// Admin: Remove an item from an order and recalculate totals
export const useRemoveOrderItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, itemId }: { orderId: string; itemId: string }) => {
      // Delete the item
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId);
      
      if (deleteError) throw deleteError;

      // Fetch remaining items to recalculate totals
      const { data: remainingItems, error: fetchError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (fetchError) throw fetchError;

      const newSubtotal = (remainingItems || []).reduce(
        (sum, item) => sum + Number(item.price) * item.quantity, 0
      );

      // Fetch current order for shipping/discount/gift wrap costs
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('shipping_cost, discount_amount, gift_wrap_cost')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const newTotal = newSubtotal + Number(order.shipping_cost || 0) 
        + Number(order.gift_wrap_cost || 0) - Number(order.discount_amount || 0);

      const { error: updateError } = await supabase
        .from('orders')
        .update({ subtotal: newSubtotal, total: Math.max(0, newTotal) })
        .eq('id', orderId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};

// Admin: Update order details (shipping address, notes, etc.)
export const useUpdateOrderDetails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, updates }: { 
      orderId: string; 
      updates: {
        shipping_address?: ShippingAddress;
        admin_notes?: string;
        shipping_cost?: number;
        discount_amount?: number;
      }
    }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.shipping_address) updateData.shipping_address = updates.shipping_address as unknown as Json;
      if (updates.admin_notes !== undefined) updateData.admin_notes = updates.admin_notes;
      if (updates.shipping_cost !== undefined) updateData.shipping_cost = updates.shipping_cost;
      if (updates.discount_amount !== undefined) updateData.discount_amount = updates.discount_amount;

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};

// Admin: Update item quantity
export const useUpdateOrderItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, quantity, orderId }: { itemId: string; quantity: number; orderId: string }) => {
      const { error } = await supabase
        .from('order_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;

      // Recalculate totals
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      const newSubtotal = (items || []).reduce(
        (sum, item) => sum + Number(item.price) * item.quantity, 0
      );

      const { data: order } = await supabase
        .from('orders')
        .select('shipping_cost, discount_amount, gift_wrap_cost')
        .eq('id', orderId)
        .single();

      if (order) {
        const newTotal = newSubtotal + Number(order.shipping_cost || 0)
          + Number(order.gift_wrap_cost || 0) - Number(order.discount_amount || 0);

        await supabase
          .from('orders')
          .update({ subtotal: newSubtotal, total: Math.max(0, newTotal) })
          .eq('id', orderId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};

export const useOrderStats = () => {
  return useQuery({
    queryKey: ['order-stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, total, created_at');
      
      if (error) throw error;
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const stats = {
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
        confirmedOrders: orders?.filter(o => o.status === 'confirmed').length || 0,
        processingOrders: orders?.filter(o => o.status === 'processing').length || 0,
        shippedOrders: orders?.filter(o => o.status === 'shipped').length || 0,
        deliveredOrders: orders?.filter(o => o.status === 'delivered').length || 0,
        cancelledOrders: orders?.filter(o => o.status === 'cancelled').length || 0,
        totalRevenue: orders?.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0) || 0,
        todayRevenue: orders?.filter(o => o.created_at >= startOfDay && o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0) || 0,
        weekRevenue: orders?.filter(o => o.created_at >= startOfWeek && o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0) || 0,
        monthRevenue: orders?.filter(o => o.created_at >= startOfMonth && o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0) || 0,
      };
      
      return stats;
    },
  });
};
