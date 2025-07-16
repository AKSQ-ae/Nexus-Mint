import { createComponentLogger } from './logger';

const logger = createComponentLogger('SEO');

// SEO Configuration Types
interface SEOConfig {
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  siteUrl: string;
  siteName: string;
  twitterHandle: string;
  locale: string;
  defaultImage: string;
}

interface PageSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  robots?: string;
  openGraph?: OpenGraphData;
  twitter?: TwitterData;
  structuredData?: StructuredData[];
}

interface OpenGraphData {
  type?: 'website' | 'article' | 'product' | 'profile';
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  locale?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  product?: {
    price?: string;
    currency?: string;
    availability?: string;
    condition?: string;
  };
}

interface TwitterData {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  title?: string;
  description?: string;
  image?: string;
  creator?: string;
  site?: string;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// Default SEO Configuration
const defaultSEOConfig: SEOConfig = {
  defaultTitle: 'Nexus Mint - Real Estate Tokenization Platform',
  titleTemplate: '%s | Nexus Mint',
  defaultDescription: 'Invest in premium Dubai real estate through Sharia-compliant tokenization. Start with just $100 and earn competitive yields.',
  defaultKeywords: [
    'real estate tokenization',
    'Dubai property investment',
    'Sharia compliant investment',
    'property tokens',
    'blockchain real estate',
    'fractional ownership',
    'halal investment'
  ],
  siteUrl: 'https://nexusmint.com',
  siteName: 'Nexus Mint',
  twitterHandle: '@nexusmint',
  locale: 'en_US',
  defaultImage: 'https://nexusmint.com/images/og-default.jpg'
};

// SEO Manager Class
class SEOManager {
  private config: SEOConfig;
  private currentPageData: PageSEO = {};

  constructor(config: Partial<SEOConfig> = {}) {
    this.config = { ...defaultSEOConfig, ...config };
  }

  // Set page-specific SEO data
  setPageSEO(data: PageSEO): void {
    this.currentPageData = data;
    this.updateMetaTags();
    this.updateStructuredData();
    logger.debug('Page SEO updated', { title: data.title, description: data.description });
  }

  // Update meta tags in document head
  private updateMetaTags(): void {
    if (typeof document === 'undefined') return;

    const { title, description, keywords, image, canonical, robots } = this.currentPageData;

    // Update title
    const finalTitle = title 
      ? this.config.titleTemplate.replace('%s', title)
      : this.config.defaultTitle;
    document.title = finalTitle;

    // Update or create meta tags
    this.updateMetaTag('description', description || this.config.defaultDescription);
    this.updateMetaTag('keywords', (keywords || this.config.defaultKeywords).join(', '));
    this.updateMetaTag('robots', robots || 'index, follow');

    // Open Graph tags
    const ogData = this.currentPageData.openGraph || {};
    this.updateMetaTag('og:title', ogData.title || finalTitle, 'property');
    this.updateMetaTag('og:description', ogData.description || description || this.config.defaultDescription, 'property');
    this.updateMetaTag('og:image', ogData.image || image || this.config.defaultImage, 'property');
    this.updateMetaTag('og:url', ogData.url || window.location.href, 'property');
    this.updateMetaTag('og:type', ogData.type || 'website', 'property');
    this.updateMetaTag('og:site_name', ogData.siteName || this.config.siteName, 'property');
    this.updateMetaTag('og:locale', ogData.locale || this.config.locale, 'property');

    // Twitter tags
    const twitterData = this.currentPageData.twitter || {};
    this.updateMetaTag('twitter:card', twitterData.card || 'summary_large_image', 'name');
    this.updateMetaTag('twitter:title', twitterData.title || finalTitle, 'name');
    this.updateMetaTag('twitter:description', twitterData.description || description || this.config.defaultDescription, 'name');
    this.updateMetaTag('twitter:image', twitterData.image || image || this.config.defaultImage, 'name');
    this.updateMetaTag('twitter:creator', twitterData.creator || this.config.twitterHandle, 'name');
    this.updateMetaTag('twitter:site', twitterData.site || this.config.twitterHandle, 'name');

    // Canonical URL
    this.updateCanonicalLink(canonical || window.location.href);
  }

  private updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
    let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  }

  private updateCanonicalLink(url: string): void {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    
    canonical.setAttribute('href', url);
  }

  // Update structured data
  private updateStructuredData(): void {
    if (typeof document === 'undefined') return;

    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      if (script.getAttribute('data-seo-managed') === 'true') {
        script.remove();
      }
    });

    // Add new structured data
    if (this.currentPageData.structuredData) {
      this.currentPageData.structuredData.forEach(data => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-managed', 'true');
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }
  }

  // Generate property-specific structured data
  generatePropertyStructuredData(property: any): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'RealEstate',
      name: property.title,
      description: property.description,
      image: property.images?.[0],
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.location?.city || 'Dubai',
        addressCountry: 'UAE'
      },
      offers: {
        '@type': 'Offer',
        price: property.minimumInvestment,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      investmentOpportunity: {
        '@type': 'Investment',
        expectedReturn: property.expectedReturn,
        minimumInvestment: property.minimumInvestment
      }
    };
  }

  // Generate organization structured data
  generateOrganizationStructuredData(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.config.siteName,
      url: this.config.siteUrl,
      logo: `${this.config.siteUrl}/images/logo.png`,
      description: this.config.defaultDescription,
      sameAs: [
        'https://twitter.com/nexusmint',
        'https://linkedin.com/company/nexusmint'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+971-xxx-xxxx',
        contactType: 'customer service',
        availableLanguage: ['English', 'Arabic']
      }
    };
  }

  // Generate breadcrumb structured data
  generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    };
  }
}

// Global SEO manager instance
export const seoManager = new SEOManager();

// React Hook for SEO
export function useSEO(pageData: PageSEO) {
  React.useEffect(() => {
    seoManager.setPageSEO(pageData);
    
    // Cleanup on unmount
    return () => {
      seoManager.setPageSEO({});
    };
  }, [pageData]);
}

// Property page SEO hook
export function usePropertySEO(property: any) {
  const seoData: PageSEO = React.useMemo(() => {
    if (!property) return {};

    return {
      title: `${property.title} - Investment Opportunity`,
      description: `Invest in ${property.title} starting from $${property.minimumInvestment}. Expected returns: ${property.expectedReturn}%. Sharia-compliant real estate tokenization.`,
      keywords: [
        'property investment',
        property.title,
        property.location?.city || 'Dubai',
        'real estate token',
        'Sharia compliant'
      ],
      image: property.images?.[0],
      openGraph: {
        type: 'product',
        title: property.title,
        description: property.description,
        image: property.images?.[0],
        product: {
          price: property.minimumInvestment?.toString(),
          currency: 'USD',
          availability: 'InStock'
        }
      },
      structuredData: [
        seoManager.generatePropertyStructuredData(property),
        seoManager.generateOrganizationStructuredData()
      ]
    };
  }, [property]);

  useSEO(seoData);
}

// Home page SEO hook
export function useHomeSEO() {
  const seoData: PageSEO = {
    title: 'Real Estate Tokenization Platform',
    description: 'Invest in premium Dubai real estate through Sharia-compliant tokenization. Start with just $100 and earn competitive yields from verified properties.',
    keywords: [
      'real estate tokenization',
      'Dubai property investment',
      'Sharia compliant investment',
      'blockchain real estate',
      'property tokens',
      'halal investment'
    ],
    openGraph: {
      type: 'website',
      title: 'Nexus Mint - Real Estate Tokenization Platform',
      description: 'Invest in premium Dubai real estate through Sharia-compliant tokenization.'
    },
    structuredData: [
      seoManager.generateOrganizationStructuredData(),
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Nexus Mint',
        url: 'https://nexusmint.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://nexusmint.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };

  useSEO(seoData);
}

// Dashboard SEO hook
export function useDashboardSEO(userProfile?: any) {
  const seoData: PageSEO = {
    title: userProfile ? `${userProfile.firstName}'s Portfolio` : 'Investment Dashboard',
    description: 'Manage your real estate token investments, track performance, and discover new opportunities.',
    robots: 'noindex, nofollow', // Private user data
    openGraph: {
      type: 'profile',
      title: 'Investment Dashboard'
    }
  };

  useSEO(seoData);
}

// SEO Performance Monitoring
class SEOAnalytics {
  private metrics: Record<string, any> = {};

  // Track page view with SEO data
  trackPageView(path: string, title: string): void {
    const metric = {
      timestamp: new Date().toISOString(),
      path,
      title,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    this.metrics[path] = metric;
    logger.businessEvent('SEO page view', metric);

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: title,
        page_location: window.location.href
      });
    }
  }

  // Track search engine visits
  trackSearchEngineVisit(): void {
    const referrer = document.referrer;
    const searchEngines = [
      'google.com',
      'bing.com',
      'yahoo.com',
      'duckduckgo.com',
      'baidu.com'
    ];

    const isSearchEngine = searchEngines.some(engine => referrer.includes(engine));
    
    if (isSearchEngine) {
      logger.businessEvent('Search engine visit', { referrer });
    }
  }

  // Monitor Core Web Vitals
  monitorCoreWebVitals(): void {
    if (typeof window !== 'undefined' && 'web-vital' in window) {
      // This would integrate with web-vitals library
      // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
      
      logger.info('Core Web Vitals monitoring initialized');
    }
  }

  getMetrics(): Record<string, any> {
    return this.metrics;
  }
}

export const seoAnalytics = new SEOAnalytics();

// URL Structure Optimization
export function generateOptimizedSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

export function generatePropertyURL(property: any): string {
  const location = property.location?.city?.toLowerCase() || 'dubai';
  const slug = generateOptimizedSlug(property.title);
  return `/properties/${location}/${slug}`;
}

// Sitemap Generation
export function generateSitemap(properties: any[]): string {
  const baseUrl = 'https://nexusmint.com';
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/properties', priority: '0.9', changefreq: 'daily' },
    { url: '/how-it-works', priority: '0.7', changefreq: 'monthly' }
  ];

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  staticPages.forEach(page => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `  </url>\n`;
  });

  // Add property pages
  properties.forEach(property => {
    const url = generatePropertyURL(property);
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}${url}</loc>\n`;
    sitemap += `    <priority>0.8</priority>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    if (property.updatedAt) {
      sitemap += `    <lastmod>${property.updatedAt}</lastmod>\n`;
    }
    sitemap += `  </url>\n`;
  });

  sitemap += '</urlset>';
  return sitemap;
}

// Initialize SEO
export function initializeSEO(): void {
  if (typeof window !== 'undefined') {
    // Track initial page view
    seoAnalytics.trackPageView(window.location.pathname, document.title);
    
    // Track search engine visits
    seoAnalytics.trackSearchEngineVisit();
    
    // Monitor Core Web Vitals
    seoAnalytics.monitorCoreWebVitals();
    
    // Add organization structured data to all pages
    seoManager.setPageSEO({
      structuredData: [seoManager.generateOrganizationStructuredData()]
    });

    logger.info('SEO system initialized');
  }
}

// Auto-initialize
initializeSEO();