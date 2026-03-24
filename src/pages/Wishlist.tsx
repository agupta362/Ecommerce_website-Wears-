import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts, DbProduct } from '@/hooks/useProducts';
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
    rating: 4.5,
    reviewCount: 0,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
};

const Wishlist = () => {
  const { wishlist, clearWishlist } = useWishlist();
  const { data: dbProducts, isLoading } = useProducts();

  // Map wishlist IDs to database products
  const wishlistProducts = dbProducts
    ?.filter(p => wishlist.includes(p.id))
    .map(transformProduct) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary py-12">
          <div className="container-tight">
            <PageBreadcrumbs 
              items={[{ label: 'Wishlist' }]} 
              className="text-secondary-foreground/70 mb-4 [&_a]:text-secondary-foreground/70 [&_a:hover]:text-accent [&_span]:text-secondary-foreground"
            />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="section-title text-secondary-foreground">My Wishlist</h1>
                <p className="text-secondary-foreground/80 mt-2">
                  {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              {wishlistProducts.length > 0 && (
                <Button variant="outline" onClick={clearWishlist} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </section>

        <div className="container-tight px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState 
              type="wishlist"
              secondaryActionLabel="View Sale Items"
              secondaryActionHref="/shop?filter=sale"
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
