import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, Star, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ImageWithFallback from './ImageWithFallback';
import { cn } from '@/lib/utils';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const { addItem, getItemQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;
  const inWishlist = isInWishlist(product.id);
  const availableSizes = product.sizeStock.filter(s => s.stock > 0);
  const totalStock = product.sizeStock.reduce((acc, s) => acc + s.stock, 0);
  
  const selectedSizeStock = selectedSize ? product.sizeStock.find(s => s.size === selectedSize) : null;
  const cartQuantity = selectedSize ? getItemQuantity(product.id, selectedSize) : 0;
  const canAddToCart = selectedSizeStock && cartQuantity < selectedSizeStock.stock;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedSizeStock) return;
    addItem(product, selectedSize, 1, selectedSizeStock.stock);
    onClose();
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2">
          {/* Image gallery */}
          <div className="relative bg-muted aspect-square md:aspect-auto">
            <ImageWithFallback
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isSale && product.originalPrice && (
                <Badge className="bg-primary text-primary-foreground">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </Badge>
              )}
              {product.isNew && (
                <Badge className="bg-accent text-accent-foreground">NEW</Badge>
              )}
            </div>

            {/* Image navigation */}
            {product.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        idx === currentImageIndex 
                          ? 'bg-foreground w-6' 
                          : 'bg-foreground/40'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product details */}
          <div className="p-6 flex flex-col">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Club/Era */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="uppercase tracking-wider">{product.club}</span>
              {product.era && (
                <>
                  <span>•</span>
                  <span>{product.era}</span>
                </>
              )}
            </div>

            {/* Name */}
            <h2 className="font-display text-2xl uppercase tracking-wide mb-4">
              {product.name}
            </h2>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-display text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.shortDescription && (
              <p className="text-muted-foreground mb-6 line-clamp-3">
                {product.shortDescription}
              </p>
            )}

            {/* Size selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Select Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizeStock.map((sizeItem) => (
                  <button
                    key={sizeItem.size}
                    onClick={() => sizeItem.stock > 0 && setSelectedSize(sizeItem.size)}
                    disabled={sizeItem.stock === 0}
                    className={cn(
                      'px-4 py-2 border rounded-md text-sm font-medium transition-all',
                      selectedSize === sizeItem.size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : sizeItem.stock > 0
                        ? 'border-border hover:border-primary'
                        : 'border-border/50 text-muted-foreground/50 cursor-not-allowed line-through'
                    )}
                  >
                    {sizeItem.size}
                    {sizeItem.stock > 0 && sizeItem.stock < 5 && (
                      <span className="ml-1 text-xs text-primary">
                        ({sizeItem.stock} left)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <Button
                className="flex-1 btn-hero"
                onClick={handleAddToCart}
                disabled={!selectedSize || totalStock === 0 || !canAddToCart}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {totalStock === 0 ? 'Out of Stock' : !canAddToCart ? 'Max in Cart' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleWishlistToggle}
                className={cn(inWishlist && 'text-primary border-primary')}
              >
                <Heart className={cn('h-5 w-5', inWishlist && 'fill-primary')} />
              </Button>
            </div>

            {/* View full details link */}
            <Link 
              to={`/product/${product.slug}`}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
              onClick={onClose}
            >
              <span>View Full Details</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
