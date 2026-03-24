import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ChevronDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTemplateLayout, type CardStyle } from '@/hooks/useTemplateLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ImageWithFallback from './ImageWithFallback';
import UrgencyBadge from './UrgencyBadge';
import QuickViewModal from './QuickViewModal';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const getTotalStock = (sizeStock: { size: string; stock: number }[]): number =>
  sizeStock.reduce((total, item) => total + item.stock, 0);

const isLowStock = (sizeStock: { size: string; stock: number }[]): boolean =>
  getTotalStock(sizeStock) < 10;

/* ─── Style maps by cardStyle ─── */
const cardWrapperStyles: Record<CardStyle, string> = {
  raw: 'border-2 border-foreground bg-background',
  borderless: 'bg-background shadow-sm hover:shadow-md transition-shadow',
  overlay: 'bg-background overflow-hidden',
  glass: 'bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden',
  soft: 'bg-card rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden',
  terminal: 'bg-card border border-border',
  elevated: 'bg-card rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden',
  editorial: 'bg-background',
  'newspaper-broadsheet': 'bg-background border-b border-border pb-4',
};

const contentStyles: Record<CardStyle, string> = {
  raw: 'p-2 sm:p-3 lg:p-4 border-t-2 border-foreground',
  borderless: 'p-3 lg:p-4',
  overlay: 'p-2 sm:p-3 lg:p-4',
  glass: 'p-3 lg:p-4',
  soft: 'p-3 lg:p-4',
  terminal: 'p-2 sm:p-3 border-t border-border',
  elevated: 'p-3 lg:p-4',
  editorial: 'pt-3 lg:pt-4',
  'newspaper-broadsheet': 'pt-2',
};

const clubStyles: Record<CardStyle, string> = {
  raw: 'text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider block mb-0.5 sm:mb-1 truncate',
  borderless: 'text-xs text-muted-foreground tracking-wide block mb-1 truncate',
  overlay: 'text-xs text-muted-foreground tracking-wide block mb-1 truncate',
  glass: 'text-xs text-muted-foreground/80 tracking-wide block mb-1 truncate',
  soft: 'text-xs text-muted-foreground tracking-wide block mb-1 truncate',
  terminal: 'text-[10px] text-accent uppercase tracking-widest block mb-1 truncate font-mono',
  elevated: 'text-xs text-muted-foreground tracking-wide block mb-1 truncate',
  editorial: 'text-xs text-muted-foreground italic block mb-1 truncate',
  'newspaper-broadsheet': 'text-xs text-muted-foreground block mb-0.5 truncate',
};

const nameStyles: Record<CardStyle, string> = {
  raw: 'font-display text-xs sm:text-sm lg:text-base uppercase tracking-wider mb-1 sm:mb-2 line-clamp-2 leading-tight',
  borderless: 'font-display text-sm lg:text-base tracking-wide mb-2 line-clamp-2 leading-snug',
  overlay: 'font-display text-sm lg:text-base tracking-wide mb-2 line-clamp-2 leading-snug',
  glass: 'font-display text-sm lg:text-base mb-2 line-clamp-2 leading-snug',
  soft: 'font-display text-sm lg:text-base mb-2 line-clamp-2 leading-snug',
  terminal: 'font-display text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2 line-clamp-2 leading-tight',
  elevated: 'font-display text-sm lg:text-base mb-2 line-clamp-2 leading-snug font-medium',
  editorial: 'font-display text-sm lg:text-base italic mb-2 line-clamp-2 leading-snug',
  'newspaper-broadsheet': 'font-display text-sm lg:text-base mb-1 line-clamp-2 leading-tight font-bold',
};

const priceStyles: Record<CardStyle, string> = {
  raw: 'font-display font-bold text-sm sm:text-lg',
  borderless: 'font-display font-semibold text-sm sm:text-base',
  overlay: 'font-display font-semibold text-sm sm:text-base',
  glass: 'font-display font-semibold text-sm sm:text-base',
  soft: 'font-display font-semibold text-sm sm:text-base',
  terminal: 'font-display font-bold text-sm sm:text-lg text-accent',
  elevated: 'font-display font-semibold text-sm sm:text-base',
  editorial: 'font-display text-sm sm:text-base',
  'newspaper-broadsheet': 'font-display font-bold text-sm sm:text-base',
};

const saleBadgeStyles: Record<CardStyle, string> = {
  raw: 'bg-accent text-accent-foreground font-display text-[10px] lg:text-xs uppercase tracking-wider px-2 py-0.5',
  borderless: 'bg-destructive text-destructive-foreground text-[10px] lg:text-xs rounded-full px-2 py-0.5',
  overlay: 'bg-destructive text-destructive-foreground text-[10px] lg:text-xs rounded px-2 py-0.5',
  glass: 'bg-destructive/80 text-destructive-foreground text-[10px] lg:text-xs rounded-full px-2 py-0.5 backdrop-blur-sm',
  soft: 'bg-destructive text-destructive-foreground text-[10px] lg:text-xs rounded-full px-2 py-0.5',
  terminal: 'bg-accent text-accent-foreground font-mono text-[10px] lg:text-xs px-2 py-0.5',
  elevated: 'bg-destructive text-destructive-foreground text-[10px] lg:text-xs rounded-full px-2 py-0.5',
  editorial: 'text-destructive text-[10px] lg:text-xs italic',
  'newspaper-broadsheet': 'bg-destructive text-destructive-foreground text-[10px] lg:text-xs px-1.5 py-0.5',
};

const newBadgeStyles: Record<CardStyle, string> = {
  raw: 'bg-foreground text-background font-display text-[10px] lg:text-xs uppercase tracking-wider px-2 py-0.5',
  borderless: 'bg-primary text-primary-foreground text-[10px] lg:text-xs rounded-full px-2 py-0.5',
  overlay: 'bg-primary text-primary-foreground text-[10px] lg:text-xs rounded px-2 py-0.5',
  glass: 'bg-primary/80 text-primary-foreground text-[10px] lg:text-xs rounded-full px-2 py-0.5 backdrop-blur-sm',
  soft: 'bg-primary text-primary-foreground text-[10px] lg:text-xs rounded-full px-2 py-0.5',
  terminal: 'bg-foreground text-background font-mono text-[10px] lg:text-xs px-2 py-0.5',
  elevated: 'bg-primary text-primary-foreground text-[10px] lg:text-xs rounded-full px-2 py-0.5',
  editorial: 'text-primary text-[10px] lg:text-xs italic font-medium',
  'newspaper-broadsheet': 'bg-foreground text-background text-[10px] lg:text-xs px-1.5 py-0.5',
};

const actionBtnStyles: Record<CardStyle, string> = {
  raw: 'bg-background border-2 border-foreground h-8 w-8 lg:h-9 lg:w-9',
  borderless: 'bg-background/90 backdrop-blur-sm border border-border h-8 w-8 lg:h-9 lg:w-9 rounded-full shadow-sm',
  overlay: 'bg-background/90 backdrop-blur-sm h-8 w-8 lg:h-9 lg:w-9 rounded-full shadow-sm',
  glass: 'bg-background/20 backdrop-blur-md border border-border/30 h-8 w-8 lg:h-9 lg:w-9 rounded-full',
  soft: 'bg-background border border-border h-8 w-8 lg:h-9 lg:w-9 rounded-full shadow-sm',
  terminal: 'bg-card border border-border h-8 w-8 lg:h-9 lg:w-9',
  elevated: 'bg-background border border-border h-8 w-8 lg:h-9 lg:w-9 rounded-full shadow-sm',
  editorial: 'bg-background border border-border h-8 w-8 lg:h-9 lg:w-9 rounded-full',
  'newspaper-broadsheet': 'bg-background border border-foreground h-8 w-8 lg:h-9 lg:w-9',
};

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addItem, getItemQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { cardStyle } = useTemplateLayout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const totalStock = getTotalStock(product.sizeStock);
  const lowStock = isLowStock(product.sizeStock);
  const inWishlist = isInWishlist(product.id);
  const availableSizes = product.sizeStock.filter(s => {
    const inCart = getItemQuantity(product.id, s.size);
    return s.stock > 0 && inCart < s.stock;
  });

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (size: string) => {
    const sizeStock = product.sizeStock.find(s => s.size === size);
    addItem(product, size, 1, sizeStock?.stock);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <Link to={`/product/${product.slug}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className={cn('relative', cardWrapperStyles[cardStyle])}>
          {/* Image */}
          <div className="relative overflow-hidden bg-muted">
            <ImageWithFallback src={product.images[0]} alt={product.name} aspectRatio="3/4" />

            {totalStock === 0 && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <span className={cn(
                  'font-display text-2xl uppercase tracking-wider -rotate-12 px-4 py-2',
                  cardStyle === 'raw' ? 'border-2 border-destructive text-destructive' : 'text-destructive font-bold'
                )}>
                  Out of Stock
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              {product.isSale && product.originalPrice && (
                <span className={saleBadgeStyles[cardStyle]}>
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              )}
              {product.isNew && (
                <span className={newBadgeStyles[cardStyle]}>New</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  actionBtnStyles[cardStyle],
                  'lg:translate-x-12 lg:group-hover:translate-x-0 transition-transform duration-200',
                  inWishlist && 'bg-accent'
                )}
                onClick={handleWishlistToggle}
              >
                <Heart className={cn("h-4 w-4", inWishlist && 'fill-foreground')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(actionBtnStyles[cardStyle], 'lg:translate-x-12 lg:group-hover:translate-x-0 transition-transform duration-200 delay-75')}
                onClick={handleQuickView}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Add */}
            <div className="absolute bottom-0 left-0 right-0 p-2 hidden lg:block lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-200">
              {totalStock > 0 && (
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Button className="w-full text-xs h-9">
                      <ShoppingBag className="h-3 w-3 mr-1" />Quick Add<ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    {availableSizes.map((sizeItem) => (
                      <DropdownMenuItem
                        key={sizeItem.size}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(sizeItem.size); }}
                        className="flex justify-between cursor-pointer"
                      >
                        <span>Size {sizeItem.size}</span>
                        <span className="text-muted-foreground text-xs">{sizeItem.stock} left</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={contentStyles[cardStyle]}>
            <span className={clubStyles[cardStyle]}>{product.club}</span>
            <h3 className={nameStyles[cardStyle]}>{product.name}</h3>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className={priceStyles[cardStyle]}>{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            {lowStock && totalStock > 0 && (
              <div className="mt-1 sm:mt-2"><UrgencyBadge stock={totalStock} /></div>
            )}
          </div>
        </div>
      </Link>

      <QuickViewModal product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
    </>
  );
};

export default ProductCard;
