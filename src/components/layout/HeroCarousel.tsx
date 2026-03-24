import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site.config';
import { cn } from '@/lib/utils';

export interface HeroSlide {
  id: string;
  image: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  description?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  pauseOnHover?: boolean;
}

const HeroCarousel = ({
  slides,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  pauseOnHover = true,
}: HeroCarouselProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { hero } = siteConfig;

  const autoplayPlugin = Autoplay({
    delay: autoPlayInterval,
    stopOnInteraction: false,
    stopOnMouseEnter: pauseOnHover,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 50 },
    [autoplayPlugin]
  );

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const currentSlide = slides[selectedIndex];
  const displayTitle1 = currentSlide?.titleLine1 || hero.titleLine1;
  const displayTitle2 = currentSlide?.titleLine2 || hero.titleLine2;
  const displaySubtitle = currentSlide?.subtitle || hero.subtitle;
  const displayDescription = currentSlide?.description || hero.description;

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-end overflow-hidden">
      {/* Carousel Container */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex-[0_0_100%] min-w-0 relative h-full"
              >
                <motion.div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 8, ease: 'easeOut' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      </motion.div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-background/10 backdrop-blur-xl rounded-full hover:bg-background/20 transition-all duration-300 border border-foreground/10 hidden md:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-background/10 backdrop-blur-xl rounded-full hover:bg-background/20 transition-all duration-300 border border-foreground/10 hidden md:flex"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Content */}
      <motion.div 
        className="container-tight relative z-10 pb-16 lg:pb-24"
        style={{ y: textY, opacity }}
      >
        <div className="max-w-2xl">
          {/* Animated line accent */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[2px] bg-primary mb-6"
          />

          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 text-primary text-xs lg:text-sm font-medium uppercase tracking-[0.2em] mb-4"
          >
            <Play className="w-3 h-3 fill-primary" />
            {displaySubtitle}
          </motion.span>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden"
            >
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl uppercase tracking-tight text-white mb-6 leading-[0.95]">
                {displayTitle1}
                <br />
                <span className="text-primary">{displayTitle2}</span>
              </h1>
            </motion.div>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-white/80 text-base lg:text-lg mb-8 max-w-md font-light leading-relaxed"
          >
            {displayDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to={hero.primaryCta.link}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="group w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-sm uppercase tracking-wider font-medium">
                  {hero.primaryCta.text}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </Link>

            <Link to={hero.secondaryCta.link}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 px-8 py-6 text-sm uppercase tracking-wider font-medium backdrop-blur-sm transition-all duration-300"
                >
                  {hero.secondaryCta.text}
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Dot Indicators */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === selectedIndex 
                  ? "bg-primary w-8" 
                  : "bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Bottom decorative line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.8 }}
      />
    </section>
  );
};

export default HeroCarousel;
