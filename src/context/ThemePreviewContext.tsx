import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ActiveThemeConfig } from '@/hooks/useActiveTheme';

interface ThemePreviewContextValue {
  previewTheme: ActiveThemeConfig | null;
  setPreviewTheme: (theme: ActiveThemeConfig | null) => void;
}

const ThemePreviewContext = createContext<ThemePreviewContextValue>({
  previewTheme: null,
  setPreviewTheme: () => {},
});

export const useThemePreview = () => useContext(ThemePreviewContext);

export const ThemePreviewProvider = ({ children }: { children: ReactNode }) => {
  const [previewTheme, setPreviewTheme] = useState<ActiveThemeConfig | null>(null);

  return (
    <ThemePreviewContext.Provider value={{ previewTheme, setPreviewTheme }}>
      {children}
    </ThemePreviewContext.Provider>
  );
};
