// ============================================================================
// SHARED TEMPLATE PRESETS & FONT MAP
// Used by both StoreSetupWizard and AdminTheme
// ============================================================================

export interface TemplatePreset {
  id: string;
  name: string;
  genre: string;
  description: string;
  storeType: string;
  fontStyle: string;
  borderRadius: string;
  heroType: string;
  loaderType: string;
  colors: {
    primary: { h: number; s: number; l: number };
    accent: { h: number; s: number; l: number };
    bg: string;
    fg: string;
    cardBg: string;
    mutedBg: string;
    mutedFg: string;
    borderColor: string;
  };
  googleFonts: string;
  animationStyle: 'snap' | 'silk' | 'stagger' | 'parallax' | 'bounce' | 'glitch' | 'gentle' | 'editorial' | 'newspaper-broadsheet';
  cardStyle: 'raw' | 'borderless' | 'overlay' | 'glass' | 'soft' | 'terminal' | 'elevated' | 'editorial' | 'newspaper-broadsheet';
  navStyle: 'sticky-bold' | 'centered-split' | 'hamburger-only' | 'floating-pill' | 'pill-links' | 'ticker-icons' | 'light-bottom' | 'traditional' | 'newspaper-broadsheet';
  heroLayout: 'fullbleed-overlay' | 'split-zoom' | 'single-word-scroll' | 'floating-showcase' | 'circle-overlap' | 'terminal-type' | 'oversized-type' | 'editorial-banner' | 'newspaper-broadsheet';
  gridLayout: 'asymmetric' | 'single-column' | 'edge-to-edge' | 'offset-float' | 'magazine-mix' | 'dense-neon' | 'airy-alternate' | 'newspaper' | 'newspaper-broadsheet';
}

export const fontPresets: Record<string, { display: string; body: string }> = {
  brutalist: { display: "'Oswald', sans-serif", body: "'Space Mono', monospace" },
  elegant: { display: "'Playfair Display', serif", body: "'Cormorant Garamond', serif" },
  modern: { display: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  glassmorphism: { display: "'DM Sans', sans-serif", body: "'DM Sans', sans-serif" },
  warmearth: { display: "'Fraunces', serif", body: "'Outfit', sans-serif" },
  neotokyo: { display: "'Bebas Neue', sans-serif", body: "'JetBrains Mono', monospace" },
  scandi: { display: "'Manrope', sans-serif", body: "'Source Sans 3', sans-serif" },
  heritage: { display: "'Libre Baskerville', serif", body: "'Karla', sans-serif" },
  newspaper: { display: "'Lora', serif", body: "'Source Serif 4', serif" },
};

export const templatePresets: TemplatePreset[] = [
  {
    id: 'brutalist-sports',
    name: 'Brutalist Sports',
    genre: 'Sports / Streetwear',
    description: 'Thick borders, uppercase, raw energy. The anti-template template.',
    storeType: 'clothing',
    fontStyle: 'brutalist',
    borderRadius: '0',
    heroType: 'video',
    loaderType: 'football',
    colors: {
      primary: { h: 0, s: 0, l: 5 },
      accent: { h: 68, s: 100, l: 50 },
      bg: '#ffffff', fg: '#0d0d0d', cardBg: '#ffffff',
      mutedBg: '#ededed', mutedFg: '#666666', borderColor: '#0d0d0d',
    },
    googleFonts: 'Oswald:wght@700&family=Space+Mono',
    animationStyle: 'snap', cardStyle: 'raw', navStyle: 'sticky-bold',
    heroLayout: 'fullbleed-overlay', gridLayout: 'asymmetric',
  },
  {
    id: 'elegant-atelier',
    name: 'Elegant Atelier',
    genre: 'Jewelry / Luxury',
    description: 'Serif sophistication, muted gold palette, airy spacing.',
    storeType: 'jewelry',
    fontStyle: 'elegant',
    borderRadius: '0.125rem',
    heroType: 'image',
    loaderType: 'jewelry',
    colors: {
      primary: { h: 38, s: 72, l: 20 },
      accent: { h: 38, s: 55, l: 72 },
      bg: '#faf8f5', fg: '#2a1f0e', cardBg: '#ffffff',
      mutedBg: '#f0ebe3', mutedFg: '#8a7b6b', borderColor: '#d4c5b0',
    },
    googleFonts: 'Playfair+Display:wght@400;700&family=Cormorant+Garamond:wght@400;600',
    animationStyle: 'silk', cardStyle: 'borderless', navStyle: 'centered-split',
    heroLayout: 'split-zoom', gridLayout: 'single-column',
  },
  {
    id: 'noir-minimal',
    name: 'Noir Minimal',
    genre: 'Fashion / Any',
    description: 'Ultra-clean monochrome. Massive whitespace, zero distraction.',
    storeType: 'clothing',
    fontStyle: 'modern',
    borderRadius: '0',
    heroType: 'image',
    loaderType: 'default',
    colors: {
      primary: { h: 0, s: 0, l: 3 },
      accent: { h: 40, s: 10, l: 90 },
      bg: '#ffffff', fg: '#080808', cardBg: '#fafafa',
      mutedBg: '#f5f5f5', mutedFg: '#999999', borderColor: '#e5e5e5',
    },
    googleFonts: 'Inter:wght@300;400;500;600;700',
    animationStyle: 'stagger', cardStyle: 'overlay', navStyle: 'hamburger-only',
    heroLayout: 'single-word-scroll', gridLayout: 'edge-to-edge',
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    genre: 'Tech / Cosmetics',
    description: 'Frosted glass cards, indigo-violet gradients, blur backdrops.',
    storeType: 'cosmetics',
    fontStyle: 'glassmorphism',
    borderRadius: '1rem',
    heroType: 'carousel',
    loaderType: 'cosmetics',
    colors: {
      primary: { h: 230, s: 60, l: 25 },
      accent: { h: 270, s: 85, l: 65 },
      bg: '#0f0a1f', fg: '#f0eeff', cardBg: 'rgba(255,255,255,0.08)',
      mutedBg: 'rgba(255,255,255,0.05)', mutedFg: '#a099c0', borderColor: 'rgba(255,255,255,0.12)',
    },
    googleFonts: 'DM+Sans:wght@400;500;600;700',
    animationStyle: 'parallax', cardStyle: 'glass', navStyle: 'floating-pill',
    heroLayout: 'floating-showcase', gridLayout: 'offset-float',
  },
  {
    id: 'warm-earth',
    name: 'Warm Earth',
    genre: 'Cosmetics / Organic',
    description: 'Organic terracotta warmth, rounded forms, nature-inspired.',
    storeType: 'cosmetics',
    fontStyle: 'warmearth',
    borderRadius: '0.75rem',
    heroType: 'image',
    loaderType: 'cosmetics',
    colors: {
      primary: { h: 16, s: 60, l: 35 },
      accent: { h: 35, s: 45, l: 75 },
      bg: '#fdf8f4', fg: '#3d2416', cardBg: '#ffffff',
      mutedBg: '#f5ece4', mutedFg: '#9b8071', borderColor: '#e8d5c4',
    },
    googleFonts: 'Fraunces:opsz,wght@9..144,400;9..144,700&family=Outfit:wght@300;400;500;600',
    animationStyle: 'bounce', cardStyle: 'soft', navStyle: 'pill-links',
    heroLayout: 'circle-overlap', gridLayout: 'magazine-mix',
  },
  {
    id: 'neo-tokyo',
    name: 'Neo Tokyo',
    genre: 'Streetwear / Electronics',
    description: 'Cyberpunk energy, dark-first, glitch aesthetic with hot pink.',
    storeType: 'electronics',
    fontStyle: 'neotokyo',
    borderRadius: '0.25rem',
    heroType: 'video',
    loaderType: 'default',
    colors: {
      primary: { h: 240, s: 5, l: 10 },
      accent: { h: 330, s: 90, l: 60 },
      bg: '#0a0a0f', fg: '#e8e8f0', cardBg: '#141420',
      mutedBg: '#1a1a2e', mutedFg: '#7a7a9a', borderColor: '#2a2a40',
    },
    googleFonts: 'Bebas+Neue&family=JetBrains+Mono:wght@400;500;700',
    animationStyle: 'glitch', cardStyle: 'terminal', navStyle: 'ticker-icons',
    heroLayout: 'terminal-type', gridLayout: 'dense-neon',
  },
  {
    id: 'scandi-clean',
    name: 'Scandi Clean',
    genre: 'General / Home',
    description: 'Nordic minimalism, sage accents, calm and trustworthy.',
    storeType: 'general',
    fontStyle: 'scandi',
    borderRadius: '0.5rem',
    heroType: 'carousel',
    loaderType: 'default',
    colors: {
      primary: { h: 210, s: 10, l: 25 },
      accent: { h: 150, s: 25, l: 55 },
      bg: '#f8f9fa', fg: '#2d3436', cardBg: '#ffffff',
      mutedBg: '#eef0f2', mutedFg: '#808b94', borderColor: '#dde2e6',
    },
    googleFonts: 'Manrope:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;600',
    animationStyle: 'gentle', cardStyle: 'elevated', navStyle: 'light-bottom',
    heroLayout: 'oversized-type', gridLayout: 'airy-alternate',
  },
  {
    id: 'heritage-classic',
    name: 'Heritage Classic',
    genre: 'Vintage / Any',
    description: 'Navy & burgundy, editorial typography, timeless craft feel.',
    storeType: 'clothing',
    fontStyle: 'heritage',
    borderRadius: '0.25rem',
    heroType: 'image',
    loaderType: 'default',
    colors: {
      primary: { h: 220, s: 50, l: 18 },
      accent: { h: 350, s: 55, l: 35 },
      bg: '#faf9f7', fg: '#1a2744', cardBg: '#ffffff',
      mutedBg: '#f0ede8', mutedFg: '#7b8a9e', borderColor: '#d4cfc5',
    },
    googleFonts: 'Libre+Baskerville:wght@400;700&family=Karla:wght@300;400;500;600',
    animationStyle: 'editorial', cardStyle: 'editorial', navStyle: 'traditional',
    heroLayout: 'editorial-banner', gridLayout: 'newspaper',
  },
  {
    id: 'daily-gazette',
    name: 'Daily Gazette',
    genre: 'News / Editorial / Any',
    description: 'Broadsheet newspaper layout with columns, mastheads, and classified-style grids.',
    storeType: 'general',
    fontStyle: 'newspaper',
    borderRadius: '0',
    heroType: 'image',
    loaderType: 'default',
    colors: {
      primary: { h: 0, s: 0, l: 8 },
      accent: { h: 0, s: 65, l: 40 },
      bg: '#f5f0e8', fg: '#1a1a18', cardBg: '#faf6ef',
      mutedBg: '#ebe5d9', mutedFg: '#7a7568', borderColor: '#c8c0b0',
    },
    googleFonts: 'Lora:wght@400;700&family=Source+Serif+4:wght@400;600;700',
    animationStyle: 'newspaper-broadsheet',
    cardStyle: 'newspaper-broadsheet',
    navStyle: 'newspaper-broadsheet',
    heroLayout: 'newspaper-broadsheet',
    gridLayout: 'newspaper-broadsheet',
  },
];

/**
 * Convert a TemplatePreset into the full light/dark HSL color scheme
 * that ThemeInjector expects for CSS variable injection.
 */
export function templateToThemeConfig(template: TemplatePreset) {
  const { colors, fontStyle, borderRadius, googleFonts, id } = template;
  const fonts = fontPresets[fontStyle] || fontPresets.brutalist;

  return {
    templateId: id,
    googleFonts,
    fonts: {
      display: fonts.display,
      body: fonts.body,
    },
    borderRadius,
    navStyle: template.navStyle,
    heroLayout: template.heroLayout,
    gridLayout: template.gridLayout,
    cardStyle: template.cardStyle,
    animationStyle: template.animationStyle,
    colors: {
      light: {
        background: { h: 0, s: 0, l: 100 },
        foreground: { h: colors.primary.h, s: colors.primary.s, l: colors.primary.l },
        card: { h: 0, s: 0, l: 100 },
        cardForeground: { h: colors.primary.h, s: colors.primary.s, l: colors.primary.l },
        primary: { h: colors.primary.h, s: colors.primary.s, l: colors.primary.l },
        primaryForeground: { h: 0, s: 0, l: colors.primary.l > 50 ? 0 : 100 },
        secondary: { h: colors.primary.h, s: colors.primary.s, l: Math.min(colors.primary.l + 5, 95) },
        secondaryForeground: { h: 0, s: 0, l: 98 },
        muted: { h: 0, s: 0, l: 93 },
        mutedForeground: { h: 0, s: 0, l: 40 },
        accent: { h: colors.accent.h, s: colors.accent.s, l: colors.accent.l },
        accentForeground: { h: 0, s: 0, l: 0 },
        success: { h: 145, s: 65, l: 35 },
        successForeground: { h: 0, s: 0, l: 100 },
        destructive: { h: 0, s: 84, l: 60 },
        destructiveForeground: { h: 0, s: 0, l: 100 },
        border: { h: 0, s: 0, l: 0 },
        input: { h: 0, s: 0, l: 0 },
        ring: { h: colors.accent.h, s: colors.accent.s, l: colors.accent.l },
      },
      dark: {
        background: { h: 0, s: 0, l: 5 },
        foreground: { h: 0, s: 0, l: 98 },
        card: { h: 0, s: 0, l: 8 },
        cardForeground: { h: 0, s: 0, l: 98 },
        primary: { h: 0, s: 0, l: 98 },
        primaryForeground: { h: 0, s: 0, l: 5 },
        secondary: { h: 0, s: 0, l: 15 },
        secondaryForeground: { h: 0, s: 0, l: 98 },
        muted: { h: 0, s: 0, l: 15 },
        mutedForeground: { h: 0, s: 0, l: 65 },
        accent: { h: colors.accent.h, s: colors.accent.s, l: colors.accent.l },
        accentForeground: { h: 0, s: 0, l: 0 },
        success: { h: 145, s: 60, l: 45 },
        successForeground: { h: 0, s: 0, l: 100 },
        destructive: { h: 0, s: 75, l: 55 },
        destructiveForeground: { h: 0, s: 0, l: 100 },
        border: { h: 0, s: 0, l: 30 },
        input: { h: 0, s: 0, l: 30 },
        ring: { h: colors.accent.h, s: colors.accent.s, l: colors.accent.l },
      },
    },
  };
}
