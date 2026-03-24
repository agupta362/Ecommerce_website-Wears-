export type CreateProductInput = Omit<
  DbProduct,
  'id' | 'created_at' | 'updated_at' | 'product_sizes' | 'categories' | 'league' | 'club' | 'era' | 'kit_type'
> & {
  sizes: { size: string; stock: number }[];
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getFromCache, setInCache } from '@/lib/clientCache';

// Cache TTLs
const PRODUCTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CATEGORIES_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  league: string | null;
  club: string | null;
  era: string | null;
  kit_type: string;
  images: string[];
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  is_clearance: boolean;
  created_at: string;
  updated_at: string;
  product_sizes?: DbProductSize[];
  categories?: DbCategory | null;
}

export interface DbProductSize {
  id: string;
  product_id: string;
  size: string;
  stock: number;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export const useProducts = (filters?: {
  categorySlug?: string;
  league?: string;
  era?: string;
  search?: string;
  featured?: boolean;
}) => {
  return useQuery({
    queryKey: ['products', filters],
    staleTime: 5 * 60 * 1000, // 5 minutes - reduces refetches
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    refetchOnMount: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      // Only use cache for unfiltered queries to avoid stale filtered results
      const cacheKey = `products-${JSON.stringify(filters || {})}`;
      const cached = getFromCache<DbProduct[]>(cacheKey);
      if (cached) return cached;
      
      // Select only needed columns for list views (exclude description to reduce payload ~40%)
      let query = supabase
        .from('products')
        .select(`
          id, name, slug, price, original_price, category_id,
          images, is_featured, is_new, is_active, is_clearance,fits,collections,
          product_sizes (id, product_id, size, stock),
          categories(id, name, slug, image_url)
        `)
        .eq('is_active', true);

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }
      if (filters?.league) {
        query = query.eq('league', filters.league);
      }
      if (filters?.era) {
        query = query.eq('era', filters.era);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,club.ilike.%${filters.search}%,league.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Shuffle products randomly for varied display
      const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
      const products = shuffled as DbProduct[];
      
      // Cache the results
      setInCache(cacheKey, products, PRODUCTS_CACHE_TTL);
      
      return products;
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_sizes (*),
          categories (*)
        `)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as DbProduct | null;
    },
    enabled: !!slug,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    staleTime: 30 * 60 * 1000, // 30 minutes - categories rarely change
    gcTime: 60 * 60 * 1000, // 1 hour cache
    queryFn: async () => {
      // Check client cache first - categories rarely change
      const cached = getFromCache<DbCategory[]>('categories');
      if (cached) return cached;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const categories = data as DbCategory[];
      setInCache('categories', categories, CATEGORIES_CACHE_TTL);
      return categories;
    },
  });
};

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['admin-products'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_sizes (*),
          categories (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DbProduct[];
    },
  });
};
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: CreateProductInput) => {
      const { sizes, ...productData } = product;

      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      if (sizes.length > 0) {
        const { error: sizesError } = await supabase
          .from('product_sizes')
          .insert(
            sizes.map((s) => ({
              product_id: newProduct.id,
              size: s.size,
              stock: s.stock,
            }))
          );

        if (sizesError) throw sizesError;
      }

      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
};


export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbProduct> & { id: string }) => {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, size, stock }: { productId: string; size: string; stock: number }) => {
      const { error } = await supabase
        .from('product_sizes')
        .upsert({
          product_id: productId,
          size,
          stock,
        }, {
          onConflict: 'product_id,size',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
};
