import { useState, useMemo } from 'react';
import { Package, Check, ShoppingCart, Search, X, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { Product, SizeStock } from '@/types/product';
import { useProducts } from '@/hooks/useProducts';
import { useBundlesSettings, BundleDeal, DEFAULT_BUNDLES_SETTINGS } from '@/hooks/useStoreSettings';
import { toast } from 'sonner';

interface BundleDealsProps {
  currentProduct: Product;
}

interface SelectedBundleItem {
  product: Product;
  size: string;
}

const transformDbProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  slug: dbProduct.slug,
  description: dbProduct.description || '',
  shortDescription: dbProduct.description?.substring(0, 100) || '',
  price: Number(dbProduct.price),
  originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
  images: dbProduct.images || [],
  category: dbProduct.category?.slug || 'premier-league',
  club: dbProduct.club || '',
  league: dbProduct.league || '',
  era: dbProduct.era || '',
  kitType: dbProduct.kit_type || 'home',
  sizeStock: (dbProduct.product_sizes || []).map((s: any) => ({
    size: s.size as SizeStock['size'],
    stock: s.stock || 0,
  })),
  tags: [],
  isFeatured: dbProduct.is_featured || false,
  isNew: dbProduct.is_new || false,
  isSale: !!dbProduct.original_price,
  rating: 4.5,
  reviewCount: 0,
  createdAt: dbProduct.created_at || new Date().toISOString(),
  updatedAt: dbProduct.updated_at || new Date().toISOString(),
});

const BundleDeals = ({ currentProduct }: BundleDealsProps) => {
  const { addItem, getItemQuantity } = useCart();
  const { data: dbProducts, isLoading: productsLoading } = useProducts();
  const { data: bundlesSettings, isLoading: settingsLoading } = useBundlesSettings();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedBundleItem[]>([
    { product: currentProduct, size: currentProduct.sizeStock.find(s => s.stock > 0)?.size || 'M' }
  ]);
  
  // Use settings from database or fallback to defaults
  const bundleDeals: BundleDeal[] = bundlesSettings?.deals || DEFAULT_BUNDLES_SETTINGS.deals;
  const bundlesEnabled = bundlesSettings?.enabled ?? true;
  const pointsToFreeItem = bundlesSettings?.pointsToFreeItem || 9;
  
  const isLoading = productsLoading || settingsLoading;

  // Transform and filter products
  const allProducts = useMemo(() => {
    if (!dbProducts) return [];
    return dbProducts.map(transformDbProduct).filter(p => 
      p.sizeStock.some(s => s.stock > 0) // Only products with stock
    );
  }, [dbProducts]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    const query = searchQuery.toLowerCase();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.club.toLowerCase().includes(query) ||
      p.league.toLowerCase().includes(query)
    );
  }, [allProducts, searchQuery]);

  const isProductSelected = (productId: string) => 
    selectedItems.some(item => item.product.id === productId);

  const getSelectedSize = (productId: string) => 
    selectedItems.find(item => item.product.id === productId)?.size || '';

  const toggleProduct = (product: Product) => {
    if (product.id === currentProduct.id) return; // Can't deselect current product
    
    if (isProductSelected(product.id)) {
      setSelectedItems(prev => prev.filter(item => item.product.id !== product.id));
    } else {
      const defaultSize = product.sizeStock.find(s => s.stock > 0)?.size || 'M';
      setSelectedItems(prev => [...prev, { product, size: defaultSize }]);
    }
  };

  const updateItemSize = (productId: string, size: string) => {
    setSelectedItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, size } : item
    ));
  };

  const getActiveDeal = () => {
    const count = selectedItems.length;
    for (let i = bundleDeals.length - 1; i >= 0; i--) {
      if (count >= bundleDeals[i].requiredCount) return bundleDeals[i];
    }
    return null;
  };

  const activeDeal = getActiveDeal();

  const calculateTotal = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.product.price, 0);
    const discount = activeDeal ? activeDeal.discountAmount : 0;
    const shipping = activeDeal?.freeShipping ? 0 : 150;
    return { subtotal, discount, shipping, total: subtotal - discount + shipping };
  };

  const { subtotal, discount, shipping, total } = calculateTotal();

  const handleAddBundle = () => {
    // Validate stock for each item
    for (const item of selectedItems) {
      const sizeData = item.product.sizeStock.find(s => s.size === item.size);
      const stockAvailable = sizeData?.stock || 0;
      const currentInCart = getItemQuantity(item.product.id, item.size);
      
      if (currentInCart + 1 > stockAvailable) {
        toast.error(`${item.product.name} (${item.size}) has only ${stockAvailable} in stock. You already have ${currentInCart} in cart.`);
        return;
      }
    }
    
    // Add all items to cart
    selectedItems.forEach(item => {
      addItem(item.product, item.size, 1);
    });
    
    const benefitsMsg = activeDeal 
      ? activeDeal.discountAmount > 0 
        ? `Rs. ${activeDeal.discountAmount} off + Free Shipping + ${activeDeal.bonusPoints} pts`
        : `Free Shipping + ${activeDeal.bonusPoints} pts`
      : '';
    toast.success(`Added ${selectedItems.length} items to cart${benefitsMsg ? ` (${benefitsMsg})` : ''}`);
  };

  const getAvailableSizes = (product: Product) => 
    product.sizeStock.filter(s => s.stock > 0);

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 md:p-6 bg-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 md:p-6 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg uppercase tracking-wider">Bundle & Save</h3>
      </div>

      {/* Bundle Tiers */}
      <div className="flex flex-wrap gap-2 mb-4">
        {bundleDeals.map((deal) => {
          const benefitText = deal.discountAmount > 0 
            ? `Rs. ${deal.discountAmount} OFF + ${deal.bonusPoints}pts`
            : `Free Shipping + ${deal.bonusPoints}pts`;
          return (
            <Badge
              key={deal.id}
              variant={activeDeal?.id === deal.id ? "default" : "secondary"}
              className="text-xs"
            >
              {deal.name}: {benefitText}
            </Badge>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jerseys by name, club, or league..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Selected ({selectedItems.length})</p>
          <div className="space-y-2">
            {selectedItems.map((item) => {
              const availableSizes = getAvailableSizes(item.product);
              const isCurrentProduct = item.product.id === currentProduct.id;
              
              return (
                <div
                  key={item.product.id}
                  className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <div className="h-5 w-5 rounded bg-primary flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Rs. {item.product.price.toLocaleString()}</p>
                  </div>
                  <Select
                    value={item.size}
                    onValueChange={(size) => updateItemSize(item.product.id, size)}
                  >
                    <SelectTrigger className="w-16 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSizes.map((s) => (
                        <SelectItem key={s.size} value={s.size} className="text-xs">
                          {s.size} ({s.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!isCurrentProduct && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => toggleProduct(item.product)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Products */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Add more jerseys ({filteredProducts.length} available)</p>
        <ScrollArea className="h-48 border rounded-lg">
          <div className="p-2 space-y-2">
            {filteredProducts.filter(p => !isProductSelected(p.id)).map((product) => {
              const availableSizes = getAvailableSizes(product);
              
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                >
                  {product.images[0] && (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Rs. {product.price.toLocaleString()} · {availableSizes.map(s => s.size).join(', ')}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg]" />
                </button>
              );
            })}
            {filteredProducts.filter(p => !isProductSelected(p.id)).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                {searchQuery ? 'No products match your search' : 'All products selected'}
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Pricing Summary */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({selectedItems.length} items)</span>
          <span>Rs. {subtotal.toLocaleString()}</span>
        </div>
        {activeDeal && activeDeal.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>{activeDeal.name} Discount</span>
            <span>- Rs. {discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className={activeDeal?.freeShipping ? 'text-green-600 font-medium' : ''}>
            {activeDeal?.freeShipping ? 'FREE' : `Rs. ${shipping.toLocaleString()}`}
          </span>
        </div>
        {activeDeal && (
          <div className="flex justify-between text-sm text-primary">
            <span>Bonus Points Earned</span>
            <span>+{activeDeal.bonusPoints} pts</span>
          </div>
        )}
        <div className="flex justify-between font-display text-lg pt-2 border-t">
          <span>Total</span>
          <span>Rs. {total.toLocaleString()}</span>
        </div>
      </div>

      <Button 
        onClick={handleAddBundle}
        className="w-full mt-4"
        disabled={selectedItems.length < 2}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Add Bundle to Cart
      </Button>

      {!activeDeal && selectedItems.length === 1 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Add 1 more item to unlock Free Shipping + 2 bonus points!
        </p>
      )}
      
      {activeDeal && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          🎯 Collect {pointsToFreeItem} points to get a FREE kit!
        </p>
      )}
    </div>
  );
};

export default BundleDeals;
