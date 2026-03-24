import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface StickyAddToCartProps {
  price: number;
  originalPrice?: number;
  selectedSize: string;
  canAddToCart: boolean;
  isOutOfStock: boolean;
  onAddToCart: () => void;
  buttonRef: React.RefObject<HTMLDivElement>;
}

const StickyAddToCart = ({
  price,
  originalPrice,
  selectedSize,
  canAddToCart,
  isOutOfStock,
  onAddToCart,
  buttonRef,
}: StickyAddToCartProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when the main button is NOT visible
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );

    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => observer.disconnect();
  }, [buttonRef]);

  const formatPrice = (p: number) => `Rs. ${p.toLocaleString()}`;

  const getButtonText = () => {
    if (isOutOfStock) return 'Out of Stock';
    if (!selectedSize) return 'Select Size';
    if (!canAddToCart) return 'Max in Cart';
    return 'Add to Cart';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          <div className="bg-card/95 backdrop-blur-md border-t shadow-lg px-4 py-3 safe-area-bottom">
            <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xl font-bold">
                  {formatPrice(price)}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <Button
                className="btn-hero flex-shrink-0"
                size="lg"
                onClick={onAddToCart}
                disabled={!selectedSize || isOutOfStock || !canAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {getButtonText()}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyAddToCart;
