import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Crown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import { useActiveGalleryImages } from '@/hooks/useGallery';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const LegendsVault = () => {
  const { data: images, isLoading } = useActiveGalleryImages();
  const isMobile = useIsMobile();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'row-span-1';
      case 'medium':
        return 'row-span-2';
      case 'large':
        return 'row-span-2 md:col-span-2';
      case 'tall':
        return 'row-span-3';
      default:
        return 'row-span-2';
    }
  };

  const handleCardClick = (id: string) => {
    if (!isMobile) return;
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-tight px-4 pt-6 pb-4">
          <PageBreadcrumbs items={[{ label: 'Legends Vault' }]} />
        </div>

        <section className="py-4 lg:py-12">
          <div className="container-tight px-4">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[120px] lg:auto-rows-[150px]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className={`rounded-xl ${i % 5 === 0 ? 'row-span-3' : i % 3 === 0 ? 'row-span-2 md:col-span-2' : 'row-span-2'}`} 
                  />
                ))}
              </div>
            ) : images && images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[120px] lg:auto-rows-[150px]">
                {images.map((image) => {
                  const isExpanded = expandedId === image.id;
                  
                  return (
                    <div
                      key={image.id}
                      className={`group relative rounded-xl overflow-hidden cursor-pointer ${getSizeClasses(image.display_size)} ${!isMobile ? 'hover:scale-[1.02] hover:z-10 transition-transform duration-300' : ''}`}
                      onClick={() => handleCardClick(image.id)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.title}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover ${!isMobile ? 'transition-transform duration-700 group-hover:scale-110' : ''}`}
                      />
                      
                      {/* Desktop: hover overlay */}
                      {!isMobile && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute inset-0 p-3 lg:p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 lg:translate-y-4 lg:group-hover:translate-y-0 transition-all duration-500">
                            <h3 className="font-display text-xs lg:text-base uppercase tracking-wider text-white mb-1 line-clamp-2">
                              {image.title}
                            </h3>
                            {image.description && (
                              <p className="text-[10px] lg:text-xs text-secondary-foreground/70 line-clamp-2 mb-2 lg:mb-3 hidden sm:block">
                                {image.description}
                              </p>
                            )}
                            {image.products && (
                              <Link to={`/product/${image.products.slug}`} onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-display uppercase tracking-wider text-[10px] lg:text-xs h-8 lg:h-9">
                                  <ShoppingBag className="h-3 w-3 mr-1 lg:mr-2" />
                                  Shop
                                  <ArrowRight className="h-3 w-3 ml-1 lg:ml-2" />
                                </Button>
                              </Link>
                            )}
                          </div>
                          {image.products && (
                            <div className="absolute top-2 lg:top-3 right-2 lg:right-3 bg-accent text-accent-foreground p-1.5 lg:p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100">
                              <ShoppingBag className="h-3 w-3 lg:h-4 lg:w-4" />
                            </div>
                          )}
                        </>
                      )}

                      {/* Mobile: tap-to-expand overlay */}
                      {isMobile && isExpanded && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex flex-col justify-end animate-in fade-in duration-200">
                          <h3 className="font-display text-xs uppercase tracking-wider text-white mb-1 line-clamp-2">
                            {image.title}
                          </h3>
                          {image.description && (
                            <p className="text-[10px] text-white/70 line-clamp-2 mb-2">
                              {image.description}
                            </p>
                          )}
                          {image.products && (
                            <Link to={`/product/${image.products.slug}`} onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-display uppercase tracking-wider text-[10px] h-8">
                                <ShoppingBag className="h-3 w-3 mr-1" />
                                Shop
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 lg:py-20">
                <Crown className="h-12 w-12 lg:h-16 lg:w-16 mx-auto text-muted-foreground/30 mb-4 lg:mb-6" />
                <h3 className="font-display text-xl lg:text-2xl uppercase tracking-wider text-foreground mb-2">
                  The Vault is Being Curated
                </h3>
                <p className="text-sm lg:text-base text-muted-foreground max-w-md mx-auto mb-6 lg:mb-8 px-4">
                  Our team is hand-picking the most legendary moments and iconic images. 
                  Check back soon!
                </p>
                <Button asChild className="font-display uppercase tracking-wider">
                  <Link to="/shop">
                    Browse Our Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LegendsVault;
