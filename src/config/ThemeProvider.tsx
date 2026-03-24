import { createContext, useContext, ReactNode } from 'react';
import { siteConfig, SiteConfig } from './site.config';

// Create context with the site config
const SiteConfigContext = createContext<SiteConfig>(siteConfig);

// Hook to access site config anywhere in the app
export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};

interface SiteConfigProviderProps {
  children: ReactNode;
  config?: Partial<SiteConfig>;
}

/**
 * SiteConfigProvider
 * 
 * Wraps the app to provide access to site configuration throughout.
 * Optionally accepts a partial config to override default values.
 */
export const SiteConfigProvider = ({ children, config }: SiteConfigProviderProps) => {
  // Merge any custom config with defaults
  const mergedConfig = config 
    ? { ...siteConfig, ...config }
    : siteConfig;

  return (
    <SiteConfigContext.Provider value={mergedConfig}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export default SiteConfigProvider;
