import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | '3/4' | '4/3' | '16/9';
  showSkeleton?: boolean;
}

const ImageWithFallback = ({ 
  src, 
  alt, 
  className,
  aspectRatio = '3/4',
  showSkeleton = true 
}: ImageWithFallbackProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectClasses = {
    'square': 'aspect-square',
    '3/4': 'aspect-[3/4]',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
  };

  if (hasError || !src) {
    return (
      <div className={cn(
        "bg-muted flex items-center justify-center",
        aspectClasses[aspectRatio],
        className
      )}>
        <div className="text-center text-muted-foreground p-4">
          <ImageOff className="h-8 w-8 mx-auto mb-2" />
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspectClasses[aspectRatio])}>
      {showSkeleton && isLoading && (
        <Skeleton className="absolute inset-0" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

export default ImageWithFallback;
