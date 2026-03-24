import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode, useState, useEffect } from 'react';
import { useReducedMotion, useIsMobile } from '@/hooks/useReducedMotion';

interface ImageRevealProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

const ImageReveal = ({
  children,
  direction = 'left',
  delay = 0,
  duration = 0.8,
  className = '',
}: ImageRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [forceVisible, setForceVisible] = useState(false);

  // Safety timeout: force visibility after 2 seconds on mobile if animation hasn't triggered
  useEffect(() => {
    if (isMobile) {
      const timeout = setTimeout(() => {
        setForceVisible(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isMobile]);

  // Reduced motion or force visible - render static
  if (prefersReducedMotion || forceVisible) {
    return <div className={`overflow-hidden ${className}`}>{children}</div>;
  }

  // Mobile: Use simpler fade animation instead of clipPath for better performance
  if (isMobile) {
    return (
      <div ref={ref} className={`overflow-hidden ${className}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: duration * 0.5,
            delay: delay * 0.5,
            ease: 'easeOut',
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  const getClipPath = () => {
    switch (direction) {
      case 'left':
        return {
          hidden: 'inset(0 100% 0 0)',
          visible: 'inset(0 0% 0 0)',
        };
      case 'right':
        return {
          hidden: 'inset(0 0 0 100%)',
          visible: 'inset(0 0 0 0%)',
        };
      case 'up':
        return {
          hidden: 'inset(100% 0 0 0)',
          visible: 'inset(0% 0 0 0)',
        };
      case 'down':
        return {
          hidden: 'inset(0 0 100% 0)',
          visible: 'inset(0 0 0% 0)',
        };
      default:
        return {
          hidden: 'inset(0 100% 0 0)',
          visible: 'inset(0 0% 0 0)',
        };
    }
  };

  const clipPaths = getClipPath();

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ clipPath: clipPaths.hidden }}
        animate={isInView ? { clipPath: clipPaths.visible } : { clipPath: clipPaths.hidden }}
        transition={{
          duration,
          delay,
          ease: [0.77, 0, 0.175, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ImageReveal;
