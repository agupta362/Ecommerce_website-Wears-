import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Filter, Grid, LayoutGrid, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import SEOHead from '@/components/seo/SEOHead';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import FilterContent from '@/components/shop/FilterContent';
import { useProducts, useCategories, DbProduct } from '@/hooks/useProducts';
import { usePriceFilterSettings, DEFAULT_PRICE_FILTER } from '@/hooks/useStoreSettings';
import { Product, SizeStock } from '@/types/product';
import { siteConfig } from '@/config/site.config';
import { useTemplateLayout } from '@/hooks/useTemplateLayout';

// Get filter options from config based on store type
const shopConfig = siteConfig.shop;
const storeType = siteConfig.storeType;
const filterOptions = shopConfig.filterOptions[storeType as keyof typeof shopConfig.filterOptions] || shopConfig.filterOptions.clothing;

// Extract filter arrays from config
const sizes = siteConfig.products.sizes;

// Helper to transform DB product to frontend Product type
const transformProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  slug: dbProduct.slug,
  description: dbProduct.description || '',
  shortDescription: dbProduct.description?.slice(0, 100) || '',
  price: dbProduct.price,
  originalPrice: dbProduct.original_price || undefined,
  images: dbProduct.images || [],
  category: dbProduct.categories?.slug || '',
  sizeStock: (dbProduct.product_sizes || []).map(s => ({
    size: s.size as SizeStock['size'],
    stock: s.stock,
  })),
  tags: [],
  isFeatured: dbProduct.is_featured || false,
  isNew: dbProduct.is_new || false,
  isSale: !!dbProduct.original_price && dbProduct.original_price > dbProduct.price,
  rating: 4.5,
  reviewCount: 0,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at,
});

const Shop = () => {
  const { gridLayout } = useTemplateLayout();
  const gridStyles: Record<string, string> = {
    asymmetric: 'grid-cols-2 lg:grid-cols-3',
    'single-column': 'grid-cols-1 sm:grid-cols-2',
    'edge-to-edge': 'grid-cols-2 lg:grid-cols-3',
    'offset-float': 'grid-cols-2 lg:grid-cols-3',
    'magazine-mix': 'grid-cols-2 lg:grid-cols-3',
    'dense-neon': 'grid-cols-2 lg:grid-cols-3',
    'airy-alternate': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    newspaper: 'grid-cols-2 lg:grid-cols-3',
    'newspaper-broadsheet': 'grid-cols-2 lg:grid-cols-3',
  };
  const baseGrid = gridStyles[gridLayout] || gridStyles.asymmetric;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterParam = searchParams.get('filter');
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';

  
  const { data: dbProducts, isLoading } = useProducts({ search: searchQuery });
  const { data: categories } = useCategories();
  const { data: priceFilterSettings } = usePriceFilterSettings();
  
  const priceFilterRange = priceFilterSettings || DEFAULT_PRICE_FILTER;

  // Transform DB products to frontend Product type
  const products = useMemo(() => {
    return (dbProducts || []).map(transformProduct);
  }, [dbProducts]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([priceFilterRange.min, priceFilterRange.max]);
  const [sortBy, setSortBy] = useState('featured');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);

  // Sync price range when settings load
  useEffect(() => {
    setPriceRange([priceFilterRange.min, priceFilterRange.max]);
  }, [priceFilterRange.min, priceFilterRange.max]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q)
      );    
    }

    // Filter by URL params
    if (filterParam === 'new') {
      result = result.filter(p => p.isNew);
    } else if (filterParam === 'sale') {
      result = result.filter(p => p.isSale);
    } else if (filterParam === 'featured') {
      result = result.filter(p => p.isFeatured);
    }

    if (categoryParam || selectedCategories.length > 0) {
      result = result.filter(p => {
        const productCat = (p.category || '').toLowerCase();
        
        // 1. Check if matches URL (?category=t-shirts)
        const matchesUrl = categoryParam ? productCat === categoryParam.toLowerCase() : false;
        
        // 2. Check if matches Sidebar buttons (T-Shirts)
        const matchesSidebar = selectedCategories.some(selected => {
          const slugifiedSelection = selected.toLowerCase().replace(/\s+/g, '-');
          return slugifiedSelection === productCat || selected.toLowerCase() === productCat;
        });

        // If it matches either, keep the product
        return matchesUrl || matchesSidebar;
      });
    }


    // if (selectedCategories.length > 0) {
    //   result = result.filter(p => selectedCategories.includes(p.category));
    // }
    // Filter by price range
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    //Filter by sizes
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.sizeStock.some(s => selectedSizes.includes(s.size) && s.stock > 0)
      );
    }
    // Filter by available sizes
    // if (selectedSizes.length > 0) {
    //   result = result.filter(p => 
    //     p.sizeStock.some(s => selectedSizes.includes(s.size) && s.stock > 0)
    //   );
    // }
  

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        result = [...result].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
    }, [products, filterParam, categoryParam, searchQuery, selectedSizes, selectedCategories, priceRange, sortBy]);

  const clearFilters = useCallback(() => {
    setSelectedSizes([]);
    setSelectedCategories([]);
    setPriceRange([priceFilterRange.min, priceFilterRange.max]);
    navigate('/shop', { replace: true });
  }, [priceFilterRange.min, priceFilterRange.max, navigate]);

  const hasActiveFilters =
  selectedSizes.length > 0 ||
  selectedCategories.length > 0 ||
  priceRange[0] > priceFilterRange.min ||
  priceRange[1] < priceFilterRange.max;

  // Memoized filter content props
  const filterContentProps = useMemo(() => ({
    priceFilterRange,
    priceRange,
    selectedCategories,           
    onCategoriesChange: setSelectedCategories,
    onPriceRangeChange: setPriceRange,
    selectedSizes,
    onSizesChange: setSelectedSizes,
    hasActiveFilters,
    onClearFilters: clearFilters,
  }), [priceFilterRange, priceRange, selectedCategories,selectedSizes.length, hasActiveFilters, clearFilters]);

  const getPageTitle = () => {
    if (searchQuery) return `Search: "${searchQuery}"`;
    if (filterParam === 'new') return 'New Arrivals';
    if (filterParam === 'sale') return 'Sale Items';
    if (categoryParam && categories) {
      const cat = categories.find(c => c.slug === categoryParam);
      return cat?.name || 'Shop';
    }
    return 'All Products';
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={getPageTitle()}
        description={siteConfig.seo.description}
        url="/shop"
      />
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary py-12">
          <div className="container-tight">
            <PageBreadcrumbs 
              items={[{ label: getPageTitle() }]} 
              className="text-secondary-foreground/70 mb-4 [&_a]:text-secondary-foreground/70 [&_a:hover]:text-accent [&_span]:text-secondary-foreground"
            />
            <h1 className="section-title text-secondary-foreground">{getPageTitle()}</h1>
            <p className="text-secondary-foreground/80 mt-2">
              {filteredProducts.length} products found
            </p>
          </div>
        </section>

        <div className="container-tight py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h3 className="font-display text-lg uppercase tracking-wider mb-6">
                  Filters
                </h3>
                <FilterContent {...filterContentProps} />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet modal={false}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                            {selectedSizes.length}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="font-display uppercase tracking-wider">
                          Filters
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent {...filterContentProps} />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Active Filters Tags */}
                  {hasActiveFilters && (
                    <div className="hidden sm:flex items-center gap-2 flex-wrap">
                      {selectedSizes.map((filter) => (
                        <span
                          key={filter}
                          className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                        >
                          {filter}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSelectedSizes(selectedSizes.filter(s => s !== filter));
                            }}
                            
                          />
                        </span>
                      ))}
                      {selectedCategories.map((category) => (
                        <span key={category} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded">
                        {category}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                        />
                      </span>
                  ))}
                    </div>
                  )}
                  </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Grid Toggle */}
                  <div className="hidden md:flex items-center gap-1 border rounded-md p-1">
                    <Button
                      variant={gridCols === 2 ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGridCols(2)}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={gridCols === 3 ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGridCols(3)}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products */}
              {filteredProducts.length > 0 ? (
                <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${
                  gridCols === 2 ? 'grid-cols-2' : 
                  gridCols === 3 ? baseGrid : 
                  'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wider mb-3">
                    No Products Found
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    We couldn't find any products matching your criteria. Try adjusting your filters or browse our full collection.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={clearFilters} size="lg" className="btn-hero">
                      Clear All Filters
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/shop">View All Products</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
