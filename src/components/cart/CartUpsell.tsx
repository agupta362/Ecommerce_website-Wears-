import { useMemo, useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/context/CartContext';
import { useProducts, DbProduct } from '@/hooks/useProducts';
import ImageWithFallback from '@/components/product/ImageWithFallback';
import { Product, SizeStock } from '@/types/product';

// Transform DB product to frontend Product type
const transformProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  slug: dbProduct.slug,
  description: dbProduct.description || '',
  shortDescription: dbProduct.description?.slice(0, 100) || '',
  price: dbProduct.price,
  originalPrice: dbProduct.original_price || undefined,
  images: dbProduct.images || [],
  category: dbProduct.categories?.slug as Product['category'] || 'classic',
  club: dbProduct.club || '',
  league: dbProduct.league || '',
  era: dbProduct.era || '',
  kitType: (dbProduct.kit_type as Product['kitType']) || 'home',
  sizeStock: (dbProduct.product_sizes || []).map(s => ({
    size: s.size as SizeStock['size'],
    stock: s.stock,
  })),
  tags: [],
  isFeatured: dbProduct.is_featured || false,
  isNew: dbProduct.is_new || false,
  isSale: !!dbProduct.original_price && dbProduct.original_price > dbProduct.price,
  rating: 0,
  reviewCount: 0,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at,
});

const CartUpsell = () => {
  const { items, itemCount, addItem } = useCart();
  const { data: allProducts } = useProducts();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const cartProductIds = items.map(item => item.product.id);
  
  // Calculate upsell message based on bundle deals
  const bundleMessage = useMemo(() => {
    if (itemCount === 0) return null;
    if (itemCount === 1) return { text: 'Add 1 more for FREE shipping!', highlight: 'Duo Pack' };
    if (itemCount === 2) return { text: 'Add 1 more for Rs. 300 OFF + 3 bonus points!', highlight: 'Trio Pack' };
    if (itemCount === 3) return { text: 'Add 1 more for Rs. 500 OFF + 4 bonus points!', highlight: 'Squad Deal' };
    return null;
  }, [itemCount]);

  // Get upsell products (random products not in cart)
  const upsellProducts = useMemo(() => {
    if (!allProducts) return [];
    
    return allProducts
      .filter(p => !cartProductIds.includes(p.id) && p.product_sizes?.some(s => s.stock > 0))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(transformProduct);
  }, [allProducts, cartProductIds]);

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id];
    if (!selectedSize) return;
    
    const sizeStock = product.sizeStock.find(s => s.size === selectedSize);
    if (!sizeStock || sizeStock.stock <= 0) return;
    
    addItem(product, selectedSize as SizeStock['size'], 1, sizeStock.stock);
    
    // Clear selection after adding
    setSelectedSizes(prev => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
  };

  const getAvailableSizes = (product: Product) => {
    return product.sizeStock.filter(s => s.stock > 0);
  };

  if (upsellProducts.length === 0) return null;

  return (
    <div className="border-t pt-4">
      {bundleMessage && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
          <p className="text-sm">
            <span className="font-semibold text-accent-readable">{bundleMessage.highlight}:</span>{' '}
            <span className="text-muted-foreground">{bundleMessage.text}</span>
          </p>
        </div>
      )}
      
      <h4 className="font-display text-sm uppercase tracking-wider mb-3 text-muted-foreground">
        Complete Your Bundle
      </h4>
      
      <div className="space-y-2">
        {upsellProducts.map((product) => {
          const availableSizes = getAvailableSizes(product);
          const selectedSize = selectedSizes[product.id];
          
          return (
            <div
              key={product.id}
              className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={product.images[0]}
                  alt={product.name}
                  aspectRatio="square"
                  showSkeleton={false}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">Rs. {product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 gap-1 min-w-[60px]"
                    >
                      {selectedSize || 'Size'}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {availableSizes.map((sizeStock) => (
                      <DropdownMenuItem
                        key={sizeStock.size}
                        onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: sizeStock.size }))}
                      >
                        {sizeStock.size} {sizeStock.stock <= 3 && <span className="text-xs text-muted-foreground ml-1">({sizeStock.stock} left)</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 gap-1"
                  onClick={() => handleAddToCart(product)}
                  disabled={!selectedSize || availableSizes.length === 0}
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartUpsell;