import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { CartItem, Product } from '@/types/product';
import { toast } from 'sonner';
import { siteConfig } from '@/config/site.config';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const CART_STORAGE_KEY = `${siteConfig.storeSlug}_cart`;
const SYNC_DEBOUNCE_MS = 2000; // Wait 2 seconds after last cart change before syncing

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; size: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; size: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; size: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, size, quantity } = action.payload;
      const existingIndex = state.items.findIndex(
        item => item.product.id === product.id && item.size === size
      );

      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += quantity;
        return { ...state, items: newItems };
      }

      return {
        ...state,
        items: [...state.items, { product, size, quantity }],
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(
          item => !(item.product.id === action.payload.productId && item.size === action.payload.size)
        ),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, size, quantity } = action.payload;
      if (quantity < 1) return state;

      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === productId && item.size === size
            ? { ...item, quantity }
            : item
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'SET_CART_OPEN':
      return { ...state, isOpen: action.payload };

    case 'LOAD_CART':
      return { ...state, items: action.payload };

    default:
      return state;
  }
};

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string, quantity?: number, maxStock?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getItemQuantity: (productId: string, size: string) => number;
  markCartRecovered: (orderId: string) => Promise<void>;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const { user } = useAuth();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abandonedCartIdRef = useRef<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  // Sync cart to abandoned_carts table for logged-in users (debounced)
  const syncToAbandonedCarts = useCallback(async () => {
    if (!user || state.items.length === 0) return;

    try {
      const cartData = {
        user_id: user.id,
        items: state.items.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.images?.[0] || '',
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
        cart_total: state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        updated_at: new Date().toISOString(),
      };

      if (abandonedCartIdRef.current) {
        // Update existing abandoned cart
        await supabase
          .from('abandoned_carts')
          .update(cartData)
          .eq('id', abandonedCartIdRef.current)
          .is('recovered_at', null);
      } else {
        // Check for existing unrecovered cart for this user
        const { data: existing } = await supabase
          .from('abandoned_carts')
          .select('id')
          .eq('user_id', user.id)
          .is('recovered_at', null)
          .maybeSingle();

        if (existing) {
          abandonedCartIdRef.current = existing.id;
          await supabase
            .from('abandoned_carts')
            .update(cartData)
            .eq('id', existing.id);
        } else {
          // Create new abandoned cart
          const { data: newCart } = await supabase
            .from('abandoned_carts')
            .insert(cartData)
            .select('id')
            .single();
          
          if (newCart) {
            abandonedCartIdRef.current = newCart.id;
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync abandoned cart:', error);
    }
  }, [user, state.items]);

  // Debounced sync when cart changes
  useEffect(() => {
    if (!user || state.items.length === 0) {
      // Clear abandoned cart if cart is empty
      if (abandonedCartIdRef.current && state.items.length === 0) {
        supabase
          .from('abandoned_carts')
          .delete()
          .eq('id', abandonedCartIdRef.current)
          .then(() => {
            abandonedCartIdRef.current = null;
          });
      }
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncToAbandonedCarts();
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, state.items, syncToAbandonedCarts]);

  // Mark cart as recovered helper
  const markCartRecovered = useCallback(async (orderId: string) => {
    if (abandonedCartIdRef.current) {
      try {
        await supabase
          .from('abandoned_carts')
          .update({
            recovered_at: new Date().toISOString(),
            recovered_order_id: orderId,
          })
          .eq('id', abandonedCartIdRef.current);
        
        abandonedCartIdRef.current = null;
      } catch (error) {
        console.error('Failed to mark cart as recovered:', error);
      }
    }
  }, []);

  const addItem = (product: Product, size: string, quantity: number = 1, maxStock?: number) => {
    const currentQty = getItemQuantity(product.id, size);
    
    // If maxStock is provided, validate we don't exceed it
    if (maxStock !== undefined && currentQty + quantity > maxStock) {
      if (currentQty >= maxStock) {
        toast.error(`You already have all ${maxStock} available items in your cart`);
        return;
      }
      const canAdd = maxStock - currentQty;
      dispatch({ type: 'ADD_ITEM', payload: { product, size, quantity: canAdd } });
      toast.success(`Added ${canAdd} item(s) to cart (max stock reached)`);
      return;
    }
    
    dispatch({ type: 'ADD_ITEM', payload: { product, size, quantity } });
    toast.success(`${product.name} (${size}) added to cart`);
  };

  const removeItem = (productId: string, size: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, size } });
    toast.info('Item removed from cart');
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.info('Cart cleared');
  };

  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });
  const setCartOpen = (open: boolean) => dispatch({ type: 'SET_CART_OPEN', payload: open });

  const getItemQuantity = (productId: string, size: string): number => {
    const item = state.items.find(i => i.product.id === productId && i.size === size);
    return item?.quantity || 0;
  };

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        setCartOpen,
        getItemQuantity,
        markCartRecovered,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
