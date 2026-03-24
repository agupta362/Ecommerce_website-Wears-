import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode, Children, useState, useEffect } from 'react';
import { useReducedMotion, useIsMobile } from '@/hooks/useReducedMotion';

interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const StaggerChildren = ({
  children,
  staggerDelay = 0.1,
  duration = 0.5,
  className = '',
  direction = 'up',
}: StaggerChildrenProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [forceVisible, setForceVisible] = useState(false);

  // Safety timeout: force visibility after 1.5 seconds on mobile if animation hasn't triggered
  useEffect(() => {
    if (isMobile) {
      const timeout = setTimeout(() => {
        setForceVisible(true);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isMobile]);

  // Reduced motion or force visible on mobile - render static
  if (prefersReducedMotion || forceVisible) {
    return <div className={className}>{children}</div>;
  }

  // Smaller offset and faster animations on mobile
  const offset = isMobile ? 15 : 40;
  const effectiveStaggerDelay = isMobile ? Math.min(staggerDelay, 0.05) : staggerDelay;
  const effectiveDuration = isMobile ? duration * 0.6 : duration;

  const getInitialOffset = () => {
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

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: effectiveStaggerDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      ...getInitialOffset(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: effectiveDuration,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

export default StaggerChildren;
