import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '@/config/site.config';

type LoaderType = 'football' | 'jewelry' | 'cosmetics' | 'shoes' | 'default';

interface PageLoaderProps {
  type?: LoaderType;
  tagline?: string;
  showOnce?: boolean;
  minDuration?: number;
}

const PageLoader = ({
  type = (siteConfig as any).loader?.type || 'football',
  tagline = (siteConfig as any).loader?.tagline || 'Loading...',
  showOnce = true,
  minDuration = 1500,
}: PageLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Check if we should show the loader
    if (showOnce) {
      const hasLoaded = sessionStorage.getItem('pageLoaderShown');
      if (hasLoaded) {
        setShouldRender(false);
        setIsLoading(false);
        return;
      }
    }

    // Minimum display time for branding effect
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (showOnce) {
        sessionStorage.setItem('pageLoaderShown', 'true');
      }
    }, minDuration);

    return () => clearTimeout(timer);
  }, [showOnce, minDuration]);

  if (!shouldRender) return null;

  const renderLoader = () => {
    switch (type) {
      case 'football':
        return <FootballLoader />;
      case 'jewelry':
        return <JewelryLoader />;
      case 'cosmetics':
        return <CosmeticsLoader />;
      case 'shoes':
        return <ShoesLoader />;
      default:
        return <DefaultLoader />;
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-secondary flex flex-col items-center justify-center"
        >
          {renderLoader()}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 font-display text-sm uppercase tracking-widest text-secondary-foreground/70"
          >
            {tagline}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Football/Soccer Ball Loader - Pure CSS spinning ball
const FootballLoader = () => (
  <div className="relative w-20 h-20">
    <motion.div
      className="w-full h-full rounded-full bg-secondary-foreground relative overflow-hidden"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
    >
      {/* Pentagon pattern for soccer ball */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-secondary" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
      </div>
      {/* Additional pentagon shapes around */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-secondary" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-secondary" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-secondary" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-secondary" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
    </motion.div>
    {/* Bounce shadow */}
    <motion.div
      className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-3 bg-secondary-foreground/20 rounded-full blur-sm"
      animate={{ scaleX: [1, 0.8, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 0.6, repeat: Infinity }}
    />
  </div>
);

// Jewelry Loader - Sparkling diamond
const JewelryLoader = () => (
  <div className="relative">
    <motion.div
      className="w-16 h-16 bg-gradient-to-br from-secondary-foreground via-secondary-foreground/80 to-secondary-foreground"
      style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
      animate={{ rotate: [0, 180, 360], scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Sparkle effects */}
    {[0, 90, 180, 270].map((angle) => (
      <motion.div
        key={angle}
        className="absolute top-1/2 left-1/2 w-1 h-1 bg-secondary-foreground rounded-full"
        style={{
          transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(40px)`,
        }}
        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: angle / 360 }}
      />
    ))}
  </div>
);

// Cosmetics Loader - Lipstick/brush
const CosmeticsLoader = () => (
  <div className="relative flex flex-col items-center">
    <motion.div
      className="w-4 h-16 bg-gradient-to-b from-secondary-foreground to-secondary-foreground/80 rounded-t-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
    <motion.div
      className="w-6 h-6 bg-secondary-foreground/60 rounded-b-lg"
      animate={{ scaleY: [1, 0.9, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
  </div>
);

// Shoes Loader - Rotating sneaker outline
const ShoesLoader = () => (
  <motion.div
    className="text-6xl"
    animate={{ rotateY: [0, 180, 360] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    style={{ transformStyle: 'preserve-3d' }}
  >
    👟
  </motion.div>
);

// Default Loader - Logo pulse
const DefaultLoader = () => (
  <motion.div
    className="w-16 h-16 rounded-full bg-primary flex items-center justify-center"
    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <span className="font-display text-xl text-primary-foreground uppercase">
      {siteConfig.name.charAt(0)}
    </span>
  </motion.div>
);

export default PageLoader;
