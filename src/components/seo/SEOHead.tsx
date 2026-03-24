import { useEffect } from 'react';
import { siteConfig } from '@/config/site.config';

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  product?: {
    price: number;
    currency?: string;
    availability?: 'in_stock' | 'out_of_stock';
  };
}

const SEOHead = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  product,
}: SEOHeadProps) => {
  // Use config values as defaults
  const siteName = siteConfig.name;
  const fullTitle = `${title} | ${siteName}`;
  const metaDescription = description || siteConfig.seo.description;
  const metaKeywords = keywords || siteConfig.seo.keywords.join(', ');
  const canonicalUrl = url ? `${window.location.origin}${url}` : window.location.href;
  const imageUrl = image || `${window.location.origin}${siteConfig.seo.ogImage}`;

  useEffect(() => {
    // Set document title
    document.title = fullTitle;

    // Helper to set meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Basic meta tags
    setMeta('description', metaDescription);
    setMeta('keywords', metaKeywords);

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', metaDescription, true);
    setMeta('og:image', imageUrl, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', type === 'product' ? 'product' : 'website', true);
    setMeta('og:site_name', siteName, true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', metaDescription);
    setMeta('twitter:image', imageUrl);
    if (siteConfig.seo.twitterHandle) {
      setMeta('twitter:site', siteConfig.seo.twitterHandle);
    }

    // Product specific tags
    if (product) {
      setMeta('product:price:amount', product.price.toString(), true);
      setMeta('product:price:currency', product.currency || siteConfig.products.currency, true);
      setMeta('product:availability', product.availability || 'in_stock', true);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

  }, [fullTitle, metaDescription, metaKeywords, imageUrl, canonicalUrl, type, product]);

  return null;
};

export default SEOHead;
