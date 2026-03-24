import { useState, useEffect, useCallback } from 'react';
import { X, ShoppingBag, MapPin } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { DbProduct } from '@/hooks/useProducts';

interface Notification {
  id: number;
  productName: string;
  productImage: string;
  location: string;
  timeAgo: string;
  size: string;
}

const locations = [
  'Kathmandu',
  'Lalitpur',
  'Bhaktapur',
  'Pokhara',
  'Chitwan',
  'Biratnagar',
  'Butwal',
  'Dharan',
];

const timeAgos = [
  '2 minutes ago',
  '5 minutes ago',
  '8 minutes ago',
  '12 minutes ago',
  '15 minutes ago',
  '20 minutes ago',
];

const sizes = ['S', 'M', 'L', 'XL'];

const SocialProofNotification = () => {
  // Read from existing React Query cache only — zero network requests
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const getCachedProducts = useCallback((): DbProduct[] | undefined => {
    // Try to find any cached products query data
    const queriesData = queryClient.getQueriesData<DbProduct[]>({ queryKey: ['products'] });
    for (const [, data] of queriesData) {
      if (data && data.length > 0) return data;
    }
    return undefined;
  }, [queryClient]);

  const generateNotification = useCallback((): Notification | null => {
    const products = getCachedProducts();
    if (!products || products.length === 0) return null;

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomTimeAgo = timeAgos[Math.floor(Math.random() * timeAgos.length)];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

    return {
      id: Date.now(),
      productName: randomProduct.name,
      productImage: randomProduct.images?.[0] || '',
      location: randomLocation,
      timeAgo: randomTimeAgo,
      size: randomSize,
    };
  }, [getCachedProducts]);

  useEffect(() => {
    if (isDismissed) return;

    const initialDelay = setTimeout(() => {
      const newNotification = generateNotification();
      if (newNotification) {
        setNotification(newNotification);
        setIsVisible(true);
      }
    }, 8000);

    return () => clearTimeout(initialDelay);
  }, [generateNotification, isDismissed]);

  useEffect(() => {
    if (!isVisible || isDismissed) return;

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    const nextTimer = setTimeout(() => {
      const newNotification = generateNotification();
      if (newNotification) {
        setNotification(newNotification);
        setIsVisible(true);
      }
    }, 30000 + Math.random() * 30000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, generateNotification, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!notification || !isVisible) return null;

  return (
    <div 
      className={`fixed bottom-[7.5rem] lg:bottom-24 left-4 z-40 max-w-sm bg-card border rounded-lg shadow-lg p-4 transition-all duration-500 ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : '-translate-x-full opacity-0'
      }`}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {notification.productImage ? (
            <img
              src={notification.productImage}
              alt={notification.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-xs text-primary mb-1">
            <ShoppingBag className="h-3 w-3" />
            <span>Someone just bought</span>
          </div>
          <p className="font-medium text-sm truncate pr-4">
            {notification.productName}
          </p>
          <p className="text-xs text-muted-foreground">
            Size: {notification.size}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span>{notification.location}</span>
            <span>•</span>
            <span>{notification.timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofNotification;
