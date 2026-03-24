import { Skeleton } from '@/components/ui/skeleton';

const CategorySkeleton = () => {
  return (
    <div className="aspect-square rounded-lg overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  );
};

export const CategoryGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </div>
  );
};

export default CategorySkeleton;
