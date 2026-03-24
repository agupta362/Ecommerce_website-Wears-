import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { useReducedMotion, useIsMobile } from '@/hooks/useReducedMotion';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

const ParallaxSection = ({
  children,
  speed = 0.5,
  className = '',
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Disable parallax on mobile for better scroll performance
  const effectiveSpeed = (prefersReducedMotion || isMobile) ? 0 : speed;
  const y = useTransform(scrollYProgress, [0, 1], [effectiveSpeed * -100, effectiveSpeed * 100]);

  // If no motion, render static content
  if (prefersReducedMotion || isMobile) {
    return (
      <div ref={ref} className={`relative overflow-hidden ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxSection;
