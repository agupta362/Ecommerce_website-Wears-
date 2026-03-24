import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '@/components/product/ImageWithFallback';
import CartUpsell from './CartUpsell';
import EmptyState from '@/components/ui/EmptyState';

const CartDrawer = () => {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-lg bg-card">
        <SheetHeader>
          <SheetTitle className="font-display text-xl uppercase tracking-wider">
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <EmptyState 
              type="cart"
              onAction={() => setCartOpen(false)}
              secondaryActionLabel="View Sale Items"
              secondaryActionHref="/shop?filter=sale"
              className="py-0"
            />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => {
                // Get available stock for this size
                const sizeStock = item.product.sizeStock.find(s => s.size === item.size);
                const maxStock = sizeStock?.stock ?? 0;
                
                return (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.product.images[0]}
                      alt={item.product.name}
                      aspectRatio="square"
                      showSkeleton={false}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate mb-1">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Size: {item.size}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.quantity + 1)
                          }
                          disabled={item.quantity >= maxStock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.product.id, item.size)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
              })}
            </div>

            {/* Upsell Section */}
            <CartUpsell />

            {/* Cart Footer */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-xl font-bold">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping calculated at checkout. COD available.
              </p>
              <div className="grid gap-2">
                <Button
                  className="w-full btn-hero"
                  asChild
                  onClick={() => setCartOpen(false)}
                >
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCartOpen(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
