import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, CreditCard, Clock, Tag, ArrowUpRight, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoHero from '@/components/layout/VideoHero';
import ProductCard from '@/components/product/ProductCard';
import LimitedDrops from '@/components/product/LimitedDrops';
import { ProductGridSkeleton } from '@/components/ui/ProductSkeleton';
import { CategoryGridSkeleton } from '@/components/ui/CategorySkeleton';
import { useProducts, useCategories, DbProduct } from '@/hooks/useProducts';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useActiveBanners } from '@/hooks/useBanners';
import { useCommunityImages } from '@/hooks/useGallery';
import { Product, SizeStock } from '@/types/product';
import heroBanner from '@/assets/hero-banner.jpg';
import { siteConfig } from '@/config/site.config';
import { useTemplateLayout } from '@/hooks/useTemplateLayout';
import { cn } from '@/lib/utils';

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

/* ─── Grid class maps ─── */
const productGridStyles: Record<string, string> = {
  asymmetric: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6',
  'single-column': 'grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-3xl',
  'edge-to-edge': 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0',
  'offset-float': 'grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6',
  'magazine-mix': 'grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6',
  'dense-neon': 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2',
  'airy-alternate': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8',
  newspaper: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  'newspaper-broadsheet': 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
};

const sectionBorderStyles: Record<string, string> = {
  raw: 'border-b-2 border-foreground',
  borderless: 'border-b border-border/50',
  overlay: '',
  glass: '',
  soft: 'border-b border-border/30',
  terminal: 'border-b border-border',
  elevated: 'border-b border-border/50',
  editorial: 'border-b border-border',
  'newspaper-broadsheet': 'border-b border-foreground',
};

const categoryCardStyles: Record<string, string> = {
  raw: 'group relative h-48 sm:h-72 md:h-96 border-2 border-foreground overflow-hidden shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] transition-all',
  borderless: 'group relative h-48 sm:h-72 md:h-96 overflow-hidden rounded-lg hover:shadow-xl transition-all',
  overlay: 'group relative h-48 sm:h-72 md:h-96 overflow-hidden hover:opacity-90 transition-all',
  glass: 'group relative h-48 sm:h-72 md:h-96 overflow-hidden rounded-2xl border border-border/30 backdrop-blur-sm hover:scale-[1.02] transition-all',
  soft: 'group relative h-48 sm:h-72 md:h-96 overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all',
  terminal: 'group relative h-48 sm:h-72 md:h-96 overflow-hidden border border-border hover:border-accent transition-all',
  elevated: 'group relative h-48 sm:h-72 md:h-96 overflow-hidden rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all',
  editorial: 'group relative h-48 sm:h-72 md:h-96 overflow-hidden rounded-sm border border-border transition-all',
  'newspaper-broadsheet': 'group relative h-48 sm:h-72 md:h-96 overflow-hidden border border-foreground transition-all',
};

const Index = () => {
  const { data: allDbProducts, isLoading: productsLoading } = useProducts();
  const { data: dbCategories, isLoading: categoriesLoading } = useCategories();
  const { viewedIds } = useRecentlyViewed();
  const { data: activeBanners } = useActiveBanners();
  const { data: communityImages } = useCommunityImages(6);
  const { gridLayout, cardStyle, animationStyle } = useTemplateLayout();

  const gridCls = productGridStyles[gridLayout] || productGridStyles.asymmetric;
  const sectionBorder = sectionBorderStyles[cardStyle] || sectionBorderStyles.raw;
  const catCardCls = categoryCardStyles[cardStyle] || categoryCardStyles.raw;
  const isBrutalist = cardStyle === 'raw';


  const featuredProducts = useMemo(() => {
    return (allDbProducts || []).filter(p => p.is_featured).slice(0, 8).map(transformProduct);
  }, [allDbProducts]);

  const clearanceProducts = useMemo(() => {
    return (allDbProducts || []).filter(p => p.is_clearance && p.product_sizes?.some(s => s.stock > 0)).slice(0, 4).map(transformProduct);
  }, [allDbProducts]);

  const recentlyViewedProducts = useMemo(() => {
    if (!allDbProducts || viewedIds.length === 0) return [];
    return viewedIds.map(id => allDbProducts.find(p => p.id === id)).filter((p): p is DbProduct => p !== undefined).slice(0, 4).map(transformProduct);
  }, [allDbProducts, viewedIds]);

  const categories = useMemo(() => {
    return (dbCategories || []).map(cat => ({
      id: cat.id, name: cat.name, slug: cat.slug, description: cat.description , image_url: cat.image_url || '', productCount: 0,
    }));
  }, [dbCategories]);

  const iconMap: Record<string, typeof Truck> = { Truck, CreditCard, Shield, RefreshCw };
  const features = siteConfig.homepage.featuresBar.map(f => ({
    icon: iconMap[f.icon] || Shield, title: f.title, description: f.description,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <VideoHero posterImage={heroBanner} />

        {/* Features Bar */}
        <section className={sectionBorder}>
          <div className="container-tight">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {features.map((feature, idx) => (
                <div
                  key={feature.title}
                  className={cn(
                    'flex items-center gap-3 py-6 px-4',
                    idx < features.length - 1 && (isBrutalist ? 'lg:border-r-2 border-foreground' : 'lg:border-r border-border'),
                    idx < 2 && (isBrutalist ? 'border-b-2 lg:border-b-0 border-foreground' : 'border-b lg:border-b-0 border-border'),
                  )}
                >
                  <div className={cn('w-10 h-10 flex items-center justify-center flex-shrink-0', isBrutalist ? 'bg-accent' : 'bg-primary/10 rounded-lg')}>
                    <feature.icon className={cn('h-5 w-5', isBrutalist ? 'text-accent-foreground' : 'text-primary')} />
                  </div>
                  <div>
                    <h4 className="font-display text-xs uppercase tracking-wider">{feature.title}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className={cn('py-10 sm:py-16 lg:py-24 bg-muted', sectionBorder)}>
          <div className="container-tight">
            <div className="mb-6 sm:mb-12 text-center">
              <h2 className={cn('font-display text-3xl sm:text-5xl md:text-7xl uppercase tracking-tighter mb-2 sm:mb-4', isBrutalist && 'italic')}>Find it Fast</h2>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">
                Find Your Fashion Mood
              </p>
            </div>
            {categoriesLoading ? <CategoryGridSkeleton count={6} /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {dbCategories?.map((category) => (
  <Link key={category.id} to={`/shop?category=${category.slug}`} className={catCardCls}>
    {category.image_url ? (
      <img
        src={category.image_url}
        alt={category.name}
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
        loading="lazy"
      />
    ) : (
      <div className="w-full h-full bg-muted" />
    )}

    <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/20 transition-colors" />

    <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6">
      <h3 className={cn('font-display text-lg sm:text-3xl md:text-4xl text-accent uppercase font-bold leading-none transform group-hover:-translate-y-2 transition-transform', isBrutalist && 'italic')}>
        {category.name}
      </h3>
      <p className="text-background text-[10px] sm:text-xs uppercase tracking-widest mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        Explore collection
      </p>
    </div>

    <div className="absolute top-3 right-3 sm:top-6 sm:right-6">
      <div className={cn('w-8 h-8 sm:w-12 sm:h-12 bg-background flex items-center justify-center transform group-hover:rotate-45 transition-transform', isBrutalist ? 'rounded-full border-2 border-foreground' : 'rounded-full border border-border')}>
        <ArrowUpRight className="h-4 w-4 sm:h-6 sm:w-6" />
      </div>
    </div>
  </Link>
))}
                
              </div>
            )}
          </div>
        </section>

        {/* Limited Drops */}
        {allDbProducts && allDbProducts.length > 0 && <LimitedDrops products={allDbProducts} />}

        {/* Featured Products */}
        <section className={cn('py-10 sm:py-16 lg:py-24', sectionBorder)}>
          <div className="container-tight">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className={cn('font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase leading-[0.9]')}>
                  <span className="block">Featured</span>
                  <span className={cn('block', isBrutalist && 'text-outline text-foreground')}>Classics</span>
                </h2>
              </div>
              <Button asChild><Link to="/shop">View All<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
            {productsLoading ? <ProductGridSkeleton count={8} /> : featuredProducts.length > 0 ? (
              <div className={gridCls}>
                {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className={cn('text-center py-12', isBrutalist ? 'border-2 border-foreground' : 'border border-border rounded-lg')}>
                <p className="text-muted-foreground uppercase text-xs tracking-wider">No featured products yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Clearance */}
        {clearanceProducts.length > 0 && (
          <section className={cn('py-16 lg:py-24', sectionBorder)}>
            <div className="container-tight">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-destructive flex items-center justify-center"><Tag className="h-5 w-5 text-destructive-foreground" /></div>
                  <div>
                    <h2 className="section-title mb-0">Clearance</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Last chance deals</p>
                  </div>
                </div>
                <Button asChild><Link to="/shop?filter=clearance">View All<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              </div>
              <div className={gridCls}>
                {clearanceProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <section className={cn('py-16 lg:py-24', sectionBorder)}>
            <div className="container-tight">
              <div className="flex items-center gap-3 mb-8">
                <div className={cn('w-10 h-10 flex items-center justify-center', isBrutalist ? 'bg-accent' : 'bg-primary/10 rounded-lg')}>
                  <Clock className={cn('h-5 w-5', isBrutalist ? 'text-accent-foreground' : 'text-primary')} />
                </div>
                <div>
                  <h2 className="section-title mb-0">Recently Viewed</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Pick up where you left off</p>
                </div>
              </div>
              <div className={gridCls}>
                {recentlyViewedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
          </section>
        )}

        {/* Sale Banner */}
        {activeBanners && activeBanners.length > 0 ? (
          activeBanners.map((banner) => (
            <section key={banner.id} className={cn('py-20 lg:py-32 bg-foreground text-background relative overflow-hidden', sectionBorder)}>
              <div className="container-tight text-center relative z-10">
                <span className="inline-block text-accent text-xs uppercase tracking-[0.3em] mb-4">Limited Time Offer</span>
                <h2 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-wider mb-4">{banner.title}</h2>
                {banner.subtitle && <p className="text-background/70 text-sm uppercase tracking-wider mb-8 max-w-2xl mx-auto">{banner.subtitle}</p>}
                <Button asChild size="lg" className="bg-accent text-accent-foreground border-accent hover:bg-background hover:text-foreground hover:border-background">
                  <Link to={banner.button_link}>{banner.button_text}<ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </section>
          ))
        ) : (
          <section className="py-20 lg:py-32 bg-foreground text-background relative overflow-hidden">
            <div className="container-tight text-center relative z-10">
              <span className="inline-block text-accent text-xs uppercase tracking-[0.3em] mb-4">{siteConfig.homepage.saleBanner.label}</span>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-wider mb-4">{siteConfig.homepage.saleBanner.title}</h2>
              <p className="text-background/70 text-sm uppercase tracking-wider mb-8 max-w-2xl mx-auto">{siteConfig.homepage.saleBanner.subtitle}</p>
              <Button asChild size="lg" className="bg-accent text-accent-foreground border-accent hover:bg-background hover:text-foreground hover:border-background">
                <Link to={siteConfig.homepage.saleBanner.cta.link}>{siteConfig.homepage.saleBanner.cta.text}<ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        <section className={cn('py-16 lg:py-24', sectionBorder)}>
          <div className="container-tight">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tighter mb-8 leading-[0.9]">Why {siteConfig.name}?</h2>
                <p className="text-sm text-muted-foreground uppercase tracking-wider leading-relaxed font-bold mb-12">{siteConfig.homepage.whyChooseUs.subtitle}</p>
                <div className="space-y-10">
                  {siteConfig.homepage.whyChooseUs.features.map((item) => (
                    <div key={item.title} className="flex gap-6">
                      <div className={cn(
                        'flex-shrink-0 w-16 h-16 flex items-center justify-center text-3xl',
                        isBrutalist
                          ? `${item.dark ? 'bg-foreground text-accent' : 'bg-accent text-accent-foreground'} border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]`
                          : `${item.dark ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'} rounded-xl`
                      )}>
                        {item.emoji}
                      </div>
                      <div>
                        <h3 className={cn('font-display text-xl uppercase mb-2 font-bold', isBrutalist && 'italic')}>{item.title}</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className={cn(
                  'relative z-10 overflow-hidden',
                  isBrutalist ? 'border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] rotate-3' : 'rounded-2xl shadow-xl'
                )}>
                  <img src={heroBanner} className="w-full h-auto" alt="Quality Details" loading="lazy" />
                </div>
                {isBrutalist && (
                  <>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent border-2 border-foreground rounded-full -z-10" />
                    <div className="absolute -bottom-10 -left-10 w-64 h-24 bg-foreground -z-10 rotate-12" />
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Community */}
        <section className={cn('py-16 lg:py-24 bg-accent', sectionBorder)}>
          <div className="container-tight text-center">
            <h2 className={cn('font-display text-4xl md:text-6xl uppercase tracking-tighter text-accent-foreground mb-4 font-bold', isBrutalist && 'italic')}>
              {siteConfig.social.instagramHandle}
            </h2>
            <p className="text-sm text-accent-foreground/70 uppercase tracking-wider mb-8 font-bold">{siteConfig.homepage.communitySubtitle}</p>
            <Button asChild className={cn(isBrutalist ? 'bg-foreground text-accent border-2 border-foreground hover:bg-background hover:text-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' : '')}>
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer">Follow The Squad<ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-12">
              {(communityImages && communityImages.length > 0
                ? communityImages.map((img) => (
                    <div key={img.id} className={cn('aspect-square overflow-hidden hover:scale-105 transition-transform', isBrutalist ? 'border-2 border-foreground' : 'rounded-lg')}>
                      <img src={img.image_url} alt={img.title || 'Community photo'} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))
                : Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`placeholder-${idx}`} className={cn('aspect-square bg-accent-foreground/5', isBrutalist ? 'border-2 border-foreground' : 'rounded-lg')} />
                  ))
              )}
            </div>
          </div>
        </section>

        {/* Newsletter / Contact CTA */}
        <section className="py-16 lg:py-24">
          <div className="container-tight">
            <div className={cn(
              'p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center',
              isBrutalist ? 'border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]' : 'border border-border rounded-2xl shadow-lg'
            )}>
              <div className="md:w-1/2">
                <h2 className={cn('font-display text-4xl md:text-6xl uppercase tracking-tighter mb-4', isBrutalist && 'italic')}>Join The<br />Glory Club</h2>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-8">{siteConfig.newsletter.description}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input type="email" placeholder="ENTER YOUR EMAIL" className={cn('flex-grow p-4 bg-background text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-accent', isBrutalist ? 'border-2 border-foreground font-mono' : 'border border-border rounded-lg')} />
                  <Button className="px-8 py-4">Subscribe</Button>
                </div>
              </div>
              <div className="md:w-1/2 grid grid-cols-2 gap-4">
                <div className={cn('p-4 text-center hover:bg-muted transition-colors', isBrutalist ? 'border-2 border-foreground' : 'border border-border rounded-lg')}>
                  <Phone className="w-8 h-8 mx-auto mb-2" />
                  <span className="block text-xs font-bold uppercase">{siteConfig.contact.phone}</span>
                  <span className="block text-[8px] text-muted-foreground">WHATSAPP SUPPORT</span>
                </div>
                <div className={cn('p-4 text-center hover:bg-muted transition-colors', isBrutalist ? 'border-2 border-foreground' : 'border border-border rounded-lg')}>
                  <Mail className="w-8 h-8 mx-auto mb-2" />
                  <span className="block text-xs font-bold uppercase">{siteConfig.contact.email}</span>
                  <span className="block text-[8px] text-muted-foreground">EMAIL ENQUIRIES</span>
                </div>
                <div className={cn('p-4 text-center hover:bg-muted transition-colors col-span-2', isBrutalist ? 'border-2 border-foreground' : 'border border-border rounded-lg')}>
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <span className="block text-xs font-bold uppercase">{siteConfig.contact.address.full}</span>
                  <span className="block text-[8px] text-muted-foreground">HEAD OFFICE</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
