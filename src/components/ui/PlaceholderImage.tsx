import { cn } from '@/lib/utils';

// Import placeholder SVGs
import heroBannerPlaceholder from '@/assets/placeholders/hero-banner-placeholder.svg';
import saleBannerPlaceholder from '@/assets/placeholders/sale-banner-placeholder.svg';
import categoryPlaceholder from '@/assets/placeholders/category-placeholder.svg';
import promoBannerPlaceholder from '@/assets/placeholders/promo-banner-placeholder.svg';
import instagramPlaceholder from '@/assets/placeholders/instagram-placeholder.svg';
import productPlaceholder from '@/assets/placeholders/product-placeholder.svg';

export type PlaceholderType = 
  | 'hero' 
  | 'sale' 
  | 'category' 
  | 'promo' 
  | 'instagram' 
  | 'product';

interface PlaceholderImageProps {
  type: PlaceholderType;
  className?: string;
  alt?: string;
  showDevOverlay?: boolean;
}

const placeholderMap: Record<PlaceholderType, string> = {
  hero: heroBannerPlaceholder,
  sale: saleBannerPlaceholder,
  category: categoryPlaceholder,
  promo: promoBannerPlaceholder,
  instagram: instagramPlaceholder,
  product: productPlaceholder,
};

const dimensionHints: Record<PlaceholderType, string> = {
  hero: '1920 × 1080px',
  sale: '1200 × 400px',
  category: '400 × 400px',
  promo: '1200 × 300px',
  instagram: '400 × 400px per image',
  product: '400 × 500px',
};

const PlaceholderImage = ({ 
  type, 
  className, 
  alt,
  showDevOverlay = false 
}: PlaceholderImageProps) => {
  const src = placeholderMap[type];
  const hint = dimensionHints[type];
  
  return (
    <div className={cn('relative group', className)}>
      <img 
        src={src} 
        alt={alt || `${type} placeholder`}
        className="w-full h-full object-cover"
      />
      
      {/* Dev overlay - shows on hover in development */}
      {showDevOverlay && (
        <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-primary-foreground">
          <span className="font-display text-lg uppercase tracking-wider mb-2">
            Replace this image
          </span>
          <span className="text-sm opacity-80">
            Recommended: {hint}
          </span>
        </div>
      )}
    </div>
  );
};

export default PlaceholderImage;
