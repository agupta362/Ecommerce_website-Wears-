import { useActiveTheme } from './useActiveTheme';
import { useThemePreview } from '@/context/ThemePreviewContext';

export type NavStyle = 'sticky-bold' | 'centered-split' | 'hamburger-only' | 'floating-pill' | 'pill-links' | 'ticker-icons' | 'light-bottom' | 'traditional' | 'newspaper-broadsheet';
export type HeroLayout = 'fullbleed-overlay' | 'split-zoom' | 'single-word-scroll' | 'floating-showcase' | 'circle-overlap' | 'terminal-type' | 'oversized-type' | 'editorial-banner' | 'newspaper-broadsheet';
export type GridLayout = 'asymmetric' | 'single-column' | 'edge-to-edge' | 'offset-float' | 'magazine-mix' | 'dense-neon' | 'airy-alternate' | 'newspaper' | 'newspaper-broadsheet';
export type CardStyle = 'raw' | 'borderless' | 'overlay' | 'glass' | 'soft' | 'terminal' | 'elevated' | 'editorial' | 'newspaper-broadsheet';
export type AnimationStyle = 'snap' | 'silk' | 'stagger' | 'parallax' | 'bounce' | 'glitch' | 'gentle' | 'editorial' | 'newspaper-broadsheet';

export interface TemplateLayout {
  navStyle: NavStyle;
  heroLayout: HeroLayout;
  gridLayout: GridLayout;
  cardStyle: CardStyle;
  animationStyle: AnimationStyle;
}

const defaults: TemplateLayout = {
  navStyle: 'sticky-bold',
  heroLayout: 'fullbleed-overlay',
  gridLayout: 'asymmetric',
  cardStyle: 'raw',
  animationStyle: 'snap',
};

export function useTemplateLayout(): TemplateLayout {
  const { data: dbTheme } = useActiveTheme();
  const { previewTheme } = useThemePreview();
  const theme = previewTheme ?? dbTheme;

  if (!theme) return defaults;

  return {
    navStyle: (theme.navStyle as NavStyle) || defaults.navStyle,
    heroLayout: (theme.heroLayout as HeroLayout) || defaults.heroLayout,
    gridLayout: (theme.gridLayout as GridLayout) || defaults.gridLayout,
    cardStyle: (theme.cardStyle as CardStyle) || defaults.cardStyle,
    animationStyle: (theme.animationStyle as AnimationStyle) || defaults.animationStyle,
  };
}
