import { Skeleton } from '@/components/ui/skeleton';

const ProductSkeleton = () => {
  return (
    <div className="bg-card rounded-lg overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-[3/4] w-full" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Club/year */}
        <Skeleton className="h-3 w-24" />
        
        {/* Name */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        {/* Sizes */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};

export default ProductSkeleton;
