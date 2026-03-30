import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site.config';
import HeroCarousel from './HeroCarousel';
import { useTemplateLayout, type HeroLayout } from '@/hooks/useTemplateLayout';
import { cn } from '@/lib/utils';

interface VideoHeroProps {
  videoUrl?: string;
  posterImage?: string;
}

/* ─── Style maps by heroLayout ─── */
const sectionStyles: Record<HeroLayout, string> = {
  'fullbleed-overlay': 'min-h-[90vh] lg:min-h-screen flex items-center relative border-b-2 border-foreground',
  'split-zoom': 'min-h-[85vh] flex items-center relative border-b border-border',
  'single-word-scroll': 'min-h-screen flex items-center justify-center relative',
  'floating-showcase': 'min-h-[90vh] flex items-center relative overflow-hidden',
  'circle-overlap': 'min-h-[85vh] flex items-center relative border-b border-border overflow-hidden',
  'terminal-type': 'min-h-screen flex items-center relative bg-foreground text-background',
  'oversized-type': 'min-h-[90vh] flex items-center relative',
  'editorial-banner': 'min-h-[80vh] flex items-center relative border-b border-border',
  'newspaper-broadsheet': 'py-12 lg:py-16 border-b-2 border-foreground',
};

const titleStyles: Record<HeroLayout, string> = {
  'fullbleed-overlay': 'font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl uppercase leading-[0.9] mb-6',
  'split-zoom': 'font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 italic',
  'single-word-scroll': 'font-display text-6xl sm:text-8xl md:text-[10rem] lg:text-[14rem] uppercase leading-[0.85] mb-6 tracking-tighter',
  'floating-showcase': 'font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6',
  'circle-overlap': 'font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6',
  'terminal-type': 'font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-wider mb-6 font-mono',
  'oversized-type': 'font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] mb-6 font-light tracking-tight',
  'editorial-banner': 'font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 italic',
  'newspaper-broadsheet': 'font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-4 tracking-tight',
};

const descStyles: Record<HeroLayout, string> = {
  'fullbleed-overlay': 'text-sm text-muted-foreground mb-8 max-w-md leading-relaxed',
  'split-zoom': 'text-base text-muted-foreground mb-8 max-w-lg leading-relaxed',
  'single-word-scroll': 'text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed mx-auto text-center',
  'floating-showcase': 'text-sm text-muted-foreground mb-8 max-w-md leading-relaxed',
  'circle-overlap': 'text-base text-muted-foreground mb-8 max-w-md leading-relaxed',
  'terminal-type': 'text-sm mb-8 max-w-md leading-relaxed opacity-70 font-mono',
  'oversized-type': 'text-sm text-muted-foreground mb-10 max-w-lg leading-relaxed',
  'editorial-banner': 'text-base text-muted-foreground mb-8 max-w-lg leading-relaxed',
  'newspaper-broadsheet': 'text-base text-muted-foreground mb-6 max-w-xl leading-relaxed columns-2 gap-6',
};

const VideoHero = ({ videoUrl, posterImage }: VideoHeroProps) => {
  const { hero } = siteConfig;
  const { heroLayout } = useTemplateLayout();

  if (hero.type === 'carousel' && hero.slides && hero.slides.length > 0) {
    return (
      <HeroCarousel
        slides={hero.slides}
        autoPlayInterval={hero.autoPlayInterval}
        showArrows={hero.showArrows}
        showDots={hero.showDots}
        pauseOnHover={hero.pauseOnHover}
      />
    );
  }

  // Terminal-type: typing-style hero
  if (heroLayout === 'terminal-type') {
    return (
      <section className={sectionStyles[heroLayout]}>
        <div className="container-tight w-full">
          <div className="py-20 lg:py-32 max-w-3xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <span className="inline-block text-xs uppercase tracking-[0.3em] opacity-60 mb-6 font-mono">
                {'> '}{hero.subtitle}
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className={titleStyles[heroLayout]}>
              <span className="block">{hero.titleLine1}</span>
              <span className="block text-accent">{hero.titleLine2}</span>
              <span className="animate-pulse">_</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }} className={descStyles[heroLayout]}>
              {hero.description}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.6 }} className="flex gap-3">
              <Link to={hero.primaryCta.link}>
                <Button size="lg" className="px-8">{hero.primaryCta.text}<ArrowRight className="h-4 w-4 ml-2" /></Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Single-word-scroll: massive centered text
  if (heroLayout === 'single-word-scroll') {
    return (
      <section className={sectionStyles[heroLayout]}>
        <div className="container-tight w-full text-center py-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">{hero.subtitle}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className={titleStyles[heroLayout]}>
            {hero.titleLine1}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className={descStyles[heroLayout]}>
            {hero.description}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }} className="flex justify-center gap-3">
            <Link to={hero.primaryCta.link}>
              <Button size="lg" className="px-8">{hero.primaryCta.text}<ArrowRight className="h-4 w-4 ml-2" /></Button>
            </Link>
            <Link to={hero.secondaryCta.link}>
              <Button size="lg" variant="outline" className="px-8">{hero.secondaryCta.text}</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  // Newspaper broadsheet: editorial columns
  if (heroLayout === 'newspaper-broadsheet') {
    return (
      <section className={sectionStyles[heroLayout]}>
        <div className="container-tight">
          <div className="text-center mb-8">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9] mb-2">{hero.titleLine1} {hero.titleLine2}</h1>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>{hero.subtitle}</span>
            </div>
          </div>
          <div className="border-t border-foreground pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <p className="text-base leading-relaxed mb-6">{hero.description}</p>
                <div className="flex gap-3">
                  <Link to={hero.primaryCta.link}><Button size="lg">{hero.primaryCta.text}<ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
                  <Link to={hero.secondaryCta.link}><Button size="lg" variant="outline">{hero.secondaryCta.text}</Button></Link>
                </div>
              </div>
              <div className="hidden md:block border-l border-foreground pl-6">
                <h3 className="font-display text-lg mb-3">Headlines</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="border-b border-border pb-2">New collection available now</li>
                  <li className="border-b border-border pb-2">Free shipping this weekend</li>
                  <li>Exclusive member rewards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default: split layout (used for fullbleed-overlay, split-zoom, oversized-type, editorial-banner, floating-showcase, circle-overlap)
  const showRightPanel = heroLayout === 'fullbleed-overlay';
  const showStats = heroLayout === 'fullbleed-overlay' || heroLayout === 'editorial-banner';

  return (
    <section className={sectionStyles[heroLayout]}>
      <div className="container-tight w-full">
        <div className={cn(
          'grid gap-0 items-stretch',
          showRightPanel ? 'lg:grid-cols-2 min-h-[80vh]' : 'min-h-[70vh]',
        )}>
          {/* Left: Text Content */}
          <div className={cn('flex flex-col justify-center py-12 lg:py-20', showRightPanel && 'lg:pr-12')}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <span className={cn(
                'inline-block text-xs uppercase tracking-[0.2em] px-3 py-1 font-display mb-6',
                heroLayout === 'fullbleed-overlay' ? 'bg-accent text-accent-foreground border-2 border-foreground' : 'text-muted-foreground'
              )}>
                {hero.subtitle}
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className={titleStyles[heroLayout]}>
              <span className="block">{hero.titleLine1}</span>
              <span className={cn('block', heroLayout === 'fullbleed-overlay' && 'text-outline text-foreground')}>
                {hero.titleLine2}
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className={descStyles[heroLayout]}>
              {hero.description}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link to={hero.primaryCta.link}>
                <Button size="lg" className="w-full sm:w-auto px-8">{hero.primaryCta.text}<ArrowRight className="h-4 w-4 ml-2" /></Button>
              </Link>
              <Link to={hero.secondaryCta.link}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">{hero.secondaryCta.text}</Button>
              </Link>
            </motion.div>

            {showStats && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }} className={cn('pt-6', heroLayout === 'fullbleed-overlay' ? 'border-t-2 border-foreground' : 'border-t border-border')}>
                <div className="flex gap-8 text-xs uppercase tracking-wider">
                  <div><span className="font-display text-2xl font-bold block">500+</span><span className="text-muted-foreground">Streetwear Products</span></div>
                  <div><span className="font-display text-2xl font-bold block">2014</span><span className="text-muted-foreground">Since Founding</span></div>
                  <div><span className="font-display text-2xl font-bold block">100%</span><span className="text-muted-foreground">Authentic Look</span></div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Accent Panel (only for fullbleed-overlay) */}
          {showRightPanel && (
            <div className="hidden lg:flex bg-accent border-l-2 border-foreground relative overflow-hidden items-center justify-center">
              <motion.div initial={{ opacity: 0, rotate: -5 }} animate={{ opacity: 1, rotate: -8 }} transition={{ duration: 0.6, delay: 0.3 }} className="absolute top-20 right-12 bg-background border-2 border-foreground p-4 transform shadow-none">
                <span className="font-display text-sm uppercase tracking-wider block font-bold">Stitched Crests</span>
                <span className="text-xs text-muted-foreground uppercase">Premium Detail</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, rotate: 5 }} animate={{ opacity: 1, rotate: 6 }} transition={{ duration: 0.6, delay: 0.5 }} className="absolute bottom-32 left-12 bg-foreground text-background border-2 border-foreground p-4 transform">
                <span className="font-display text-sm uppercase tracking-wider block font-bold">Inter '10</span>
                <span className="text-xs uppercase opacity-80">Champions League</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, rotate: -3 }} animate={{ opacity: 1, rotate: 3 }} transition={{ duration: 0.6, delay: 0.7 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border-2 border-foreground p-6 transform">
                <span className="font-display text-lg uppercase tracking-wider block font-bold">Retro</span>
                <span className="font-display text-lg uppercase tracking-wider block text-outline text-foreground">Glory</span>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      {(
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default VideoHero;
