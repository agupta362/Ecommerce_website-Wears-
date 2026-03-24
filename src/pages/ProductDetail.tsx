import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, Heart, Truck, Shield, RefreshCw, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import ProductReviews from '@/components/product/ProductReviews';
import SocialShare from '@/components/product/SocialShare';
import SEOHead from '@/components/seo/SEOHead';
import ImageGallery from '@/components/product/ImageGallery';
import UrgencyBadge from '@/components/product/UrgencyBadge';
import SizeQuiz from '@/components/product/SizeQuiz';
import SaleCountdown from '@/components/product/SaleCountdown';
import BundleDeals from '@/components/product/BundleDeals';
import LoyaltyPoints from '@/components/product/LoyaltyPoints';
import StickyAddToCart from '@/components/product/StickyAddToCart';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useProduct, useProducts, DbProduct } from '@/hooks/useProducts';
import { useReviewStats } from '@/hooks/useReviewStats';
import { Product, SizeStock } from '@/types/product';

// Transform DB product to frontend Product type
const transformProduct = (dbProduct: DbProduct): Product => {
  const sizeStock: SizeStock[] = dbProduct.product_sizes?.map(ps => ({
    size: ps.size as SizeStock['size'],
    stock: ps.stock ?? 0,
  })) || [];

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description || '',
    shortDescription: dbProduct.description?.slice(0, 150) || '',
    price: dbProduct.price,
    originalPrice: dbProduct.original_price ?? undefined,
    images: dbProduct.images || [],
    category: (dbProduct.categories?.slug as Product['category']) || 'classic',
    club: dbProduct.club || '',
    league: dbProduct.league || '',
    era: dbProduct.era || '',
    year: dbProduct.era || '',
    kitType: (dbProduct.kit_type as Product['kitType']) || 'home',
    sizeStock,
    tags: [],
    isFeatured: dbProduct.is_featured,
    isNew: dbProduct.is_new,
    isSale: !!dbProduct.original_price && dbProduct.original_price > dbProduct.price,
    rating: 0,
    reviewCount: 0,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
};

const getTotalStock = (sizeStock: SizeStock[]): number => {
  return sizeStock.reduce((total, item) => total + item.stock, 0);
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: dbProduct, isLoading } = useProduct(slug || '');
  const { data: allProducts } = useProducts();
  const { addItem, getItemQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed, viewedIds } = useRecentlyViewed();
  const { formatPrice } = useCurrency();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const addToCartRef = useRef<HTMLDivElement>(null);

  const product = dbProduct ? transformProduct(dbProduct) : null;
  
  // Fetch real review stats from DB
  const { data: reviewStats } = useReviewStats(product?.id);
  const rating = reviewStats?.averageRating ?? 0;
  const reviewCount = reviewStats?.reviewCount ?? 0;

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id);
    }
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="section-title mb-4">Product Not Found</h1>
            <Button asChild>
              <Link to="/shop">Back to Shop</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // formatPrice now comes from useCurrency context
  const inWishlist = isInWishlist(product.id);
  const selectedSizeStock = product.sizeStock.find(s => s.size === selectedSize);
  const isOutOfStock = getTotalStock(product.sizeStock) === 0;
  
  // Get "You may also like" products - ALL in-stock products except current
  const youMayAlsoLike = allProducts
    ?.filter(p => 
      p.id !== product.id && 
      p.product_sizes?.some(s => s.stock > 0)
    )
    .slice(0, 8)
    .map(transformProduct) || [];

  // Get recently viewed products
  const recentlyViewed = allProducts
    ?.filter(p => viewedIds.includes(p.id) && p.id !== product.id)
    .slice(0, 4)
    .map(transformProduct) || [];

  // Check if adding more would exceed stock
  const cartQuantity = selectedSize ? getItemQuantity(product.id, selectedSize) : 0;
  const canAddToCart = selectedSizeStock && (cartQuantity + quantity <= selectedSizeStock.stock);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedSizeStock) {
      return;
    }
    addItem(product, selectedSize, quantity, selectedSizeStock.stock);
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <SEOHead
        title={product.name}
        description={product.shortDescription}
        image={product.images[0]}
        url={`/product/${product.slug}`}
        type="product"
        product={{
          price: product.price,
          currency: 'NPR',
          availability: isOutOfStock ? 'out_of_stock' : 'in_stock',
        }}
        keywords={`${product.club}, ${product.league}, ${product.era}, retro jersey, football kit, Nepal`}
      />
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <nav className="container-tight py-4">
          <PageBreadcrumbs 
            items={[
              { label: 'Shop', href: '/shop' },
              { label: product.name }
            ]} 
          />
        </nav>

        {/* Product Section */}
        <section className="container-tight py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images - Using new ImageGallery component */}
            <ImageGallery images={product.images} productName={product.name} />

            {/* Details */}
            <div>
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {product.isSale && <span className="badge-sale">Sale</span>}
                {product.isNew && <span className="badge-new">New</span>}
              </div>

              {/* Title & Meta */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  {product.club} • {product.year}
                </p>
                <h1 className="font-display text-2xl lg:text-3xl uppercase tracking-wider mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                      i < Math.floor(rating)
                            ? 'fill-accent text-accent-readable'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-display text-3xl font-bold">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="badge-sale">
                    Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                {product.shortDescription}
              </p>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm uppercase tracking-wider">Select Size</span>
                  <div className="flex items-center gap-3">
                    <SizeQuiz onSizeRecommended={(size) => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }} />
                    <Link to="/size-guide" className="text-sm text-primary hover:underline">
                      Size Guide
                    </Link>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizeStock.map((sizeItem) => (
                    <Button
                      key={sizeItem.size}
                      variant={selectedSize === sizeItem.size ? 'default' : 'outline'}
                      disabled={sizeItem.stock === 0}
                      onClick={() => {
                        setSelectedSize(sizeItem.size);
                        // Always reset quantity to 1 when size changes
                        setQuantity(1);
                      }}
                      className="min-w-[60px]"
                    >
                      {sizeItem.size}
                      {sizeItem.stock > 0 && (
                        <span className="ml-1 text-xs opacity-70">({sizeItem.stock})</span>
                      )}
                    </Button>
                  ))}
                </div>
                {selectedSizeStock && selectedSizeStock.stock <= 5 && (
                  <div className="mt-3">
                    <UrgencyBadge stock={selectedSizeStock.stock} showViewers />
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <span className="font-display text-sm uppercase tracking-wider block mb-2">
                  Quantity
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={selectedSizeStock && quantity >= selectedSizeStock.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div ref={addToCartRef} className="flex gap-3 mb-8">
                <Button
                  className="flex-1 btn-hero"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!selectedSize || isOutOfStock || !canAddToCart}
                >
                  {isOutOfStock ? 'Out of Stock' : cartQuantity >= (selectedSizeStock?.stock || 0) ? 'Max in Cart' : 'Add to Cart'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlistToggle}
                  className={inWishlist ? 'text-primary border-primary' : ''}
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? 'fill-primary' : ''}`} />
                </Button>
                <SocialShare productSlug={product.slug} />
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 py-6 border-t border-b">
                <div className="text-center">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-primary" />
                  <span className="text-[10px] sm:text-xs leading-tight block">Free Delivery in Kathmandu</span>
                </div>
                <div className="text-center">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-primary" />
                  <span className="text-[10px] sm:text-xs leading-tight block">Quality Guaranteed</span>
                </div>
                <div className="text-center">
                  <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-primary" />
                  <span className="text-[10px] sm:text-xs leading-tight block">7-Day Returns</span>
                </div>
              </div>

              {/* COD Banner */}
              <div className="mt-6 p-3 sm:p-4 bg-accent/10">
                <p className="text-sm font-medium">
                  💵 Cash on Delivery Available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pay when you receive your order. eSewa & Khalti also accepted.
                </p>
              </div>

              {/* Sale Countdown for discounted items */}
              {product.isSale && (
                <div className="mt-6">
                  <SaleCountdown />
                </div>
              )}

              {/* Loyalty Points Preview */}
              <div className="mt-6">
                <LoyaltyPoints orderTotal={product.price * quantity} showEarnPreview />
              </div>
            </div>
          </div>

          {/* Bundle Deals */}
          <div className="mt-8">
            <BundleDeals currentProduct={product} />
          </div>
        </section>

        {/* Tabs Section */}
        <section className="container-tight py-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto scrollbar-hide flex-nowrap">
              <TabsTrigger
                value="description"
                className="font-display uppercase tracking-wider data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="font-display uppercase tracking-wider data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="font-display uppercase tracking-wider data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Reviews ({reviewCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </TabsContent>
            <TabsContent value="details" className="pt-6">
              <dl className="grid grid-cols-2 gap-4 max-w-md">
                <dt className="text-muted-foreground">Club</dt>
                <dd className="font-medium">{product.club}</dd>
                <dt className="text-muted-foreground">League</dt>
                <dd className="font-medium">{product.league}</dd>
                <dt className="text-muted-foreground">Season</dt>
                <dd className="font-medium">{product.year}</dd>
                <dt className="text-muted-foreground">Kit Type</dt>
                <dd className="font-medium capitalize">{product.kitType}</dd>
                <dt className="text-muted-foreground">Era</dt>
                <dd className="font-medium">{product.era}</dd>
              </dl>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </Tabs>
        </section>

        {/* You May Also Like - All In-Stock Products */}
        {youMayAlsoLike.length > 0 && (
          <section className="container-tight py-16">
            <h2 className="section-title mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {youMayAlsoLike.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="container-tight py-16 border-t">
            <h2 className="section-title mb-8">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {recentlyViewed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Mobile Add to Cart */}
      <StickyAddToCart
        price={product.price}
        originalPrice={product.originalPrice}
        selectedSize={selectedSize}
        canAddToCart={canAddToCart}
        isOutOfStock={isOutOfStock}
        onAddToCart={handleAddToCart}
        buttonRef={addToCartRef}
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;