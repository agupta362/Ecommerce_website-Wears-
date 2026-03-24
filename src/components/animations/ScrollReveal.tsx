import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { useReducedMotion, useIsMobile } from '@/hooks/useReducedMotion';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const ScrollReveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Reduced motion or simpler mobile animations
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Smaller offset on mobile for better performance
  const offset = isMobile ? 20 : 60;

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: offset, x: 0 };
      case 'down':
        return { y: -offset, x: 0 };
      case 'left':
        return { x: offset, y: 0 };
      case 'right':
        return { x: -offset, y: 0 };
      default:
        return { y: offset, x: 0 };
    }
  };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: isMobile ? duration * 0.7 : duration,
        delay: isMobile ? delay * 0.5 : delay,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
