import { useEffect } from 'react';
import { siteConfig, HSLColor } from './site.config';
import { useActiveTheme } from '@/hooks/useActiveTheme';
import { useThemePreview } from '@/context/ThemePreviewContext';

/**
 * ThemeInjector
 * 
 * Reads theme colors from DB-stored active theme (if any),
 * falling back to site.config.ts. Injects CSS custom properties at runtime.
 */

const hslToString = (color: HSLColor): string => {
  return `${color.h} ${color.s}% ${color.l}%`;
};

const colorMappings = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  success: '--success',
  successForeground: '--success-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
} as const;

export const ThemeInjector = () => {
  const { data: dbTheme } = useActiveTheme();
  const { previewTheme } = useThemePreview();
  const effectiveTheme = previewTheme ?? dbTheme;

  useEffect(() => {
    const root = document.documentElement;

    // Determine source: preview > DB theme > siteConfig
    const lightColors = effectiveTheme?.colors?.light ?? siteConfig.theme.colors.light;
    const darkColors = effectiveTheme?.colors?.dark ?? siteConfig.theme.colors.dark;
    const fonts = effectiveTheme?.fonts ?? siteConfig.theme.fonts;
    const borderRadius = effectiveTheme?.borderRadius ?? siteConfig.theme.borderRadius;

    // Inject light mode colors
    Object.entries(colorMappings).forEach(([key, cssVar]) => {
      const color = lightColors[key as keyof typeof lightColors];
      if (color) {
        root.style.setProperty(cssVar, hslToString(color as HSLColor));
      }
    });

    // Inject border radius
    root.style.setProperty('--radius', borderRadius);

    // Inject font families
    root.style.setProperty('--font-sans', fonts.body);
    root.style.setProperty('--font-display', fonts.display);

    // Create/update dark mode styles
    const darkStyleId = 'theme-dark-styles';
    let darkStyleSheet = document.getElementById(darkStyleId) as HTMLStyleElement;
    
    if (!darkStyleSheet) {
      darkStyleSheet = document.createElement('style');
      darkStyleSheet.id = darkStyleId;
      document.head.appendChild(darkStyleSheet);
    }

    const darkCss = Object.entries(colorMappings)
      .map(([key, cssVar]) => {
        const color = darkColors[key as keyof typeof darkColors];
        return color ? `  ${cssVar}: ${hslToString(color as HSLColor)};` : '';
      })
      .filter(Boolean)
      .join('\n');

    darkStyleSheet.textContent = `.dark {\n${darkCss}\n}`;

    // Inject sidebar colors (derived from theme)
    const lightPrimary = lightColors.primary as HSLColor;
    const lightPrimaryFg = lightColors.primaryForeground as HSLColor;
    root.style.setProperty('--sidebar-background', hslToString({ h: 0, s: 0, l: 5 }));
    root.style.setProperty('--sidebar-foreground', hslToString({ h: 0, s: 0, l: 98 }));
    root.style.setProperty('--sidebar-primary', hslToString(lightPrimary));
    root.style.setProperty('--sidebar-primary-foreground', hslToString(lightPrimaryFg));
    root.style.setProperty('--sidebar-accent', hslToString({ h: 0, s: 0, l: 15 }));
    root.style.setProperty('--sidebar-accent-foreground', hslToString({ h: 0, s: 0, l: 98 }));
    root.style.setProperty('--sidebar-border', hslToString({ h: 0, s: 0, l: 15 }));
    root.style.setProperty('--sidebar-ring', hslToString(lightPrimary));

    // Inject chart colors
    const lightSuccess = lightColors.success as HSLColor;
    root.style.setProperty('--chart-1', hslToString(lightPrimary));
    root.style.setProperty('--chart-2', hslToString({ h: 0, s: 0, l: 20 }));
    root.style.setProperty('--chart-3', hslToString({ h: 0, s: 0, l: 60 }));
    root.style.setProperty('--chart-4', hslToString(lightSuccess));
    root.style.setProperty('--chart-5', hslToString({ h: lightPrimary.h, s: lightPrimary.s, l: 35 }));

    // Inject Google Fonts dynamically if theme has them
    if (effectiveTheme?.googleFonts) {
      const fontLinkId = 'theme-google-fonts';
      let fontLink = document.getElementById(fontLinkId) as HTMLLinkElement;
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.id = fontLinkId;
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
      }
      fontLink.href = `https://fonts.googleapis.com/css2?family=${effectiveTheme.googleFonts}&display=swap`;
    }
  }, [effectiveTheme]);

  return null;
};

export default ThemeInjector;
