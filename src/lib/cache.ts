import { createComponentLogger } from './logger';

const logger = createComponentLogger('Cache');

// Cache Configuration
interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  checkInterval: number; // Cleanup interval
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

// Advanced Memory Cache with LRU eviction
class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      checkInterval: 60 * 1000, // 1 minute
      ...config
    };

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), this.config.checkInterval);
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl || this.config.defaultTTL;

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: entryTTL,
      accessCount: 0,
      lastAccessed: now
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;

    logger.debug('Cache set', { key, ttl: entryTTL, size: this.cache.size });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      this.stats.misses++;
      logger.debug('Cache miss', { key });
      return null;
    }

    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      logger.debug('Cache expired', { key });
      return null;
    }

    // Update access information
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;

    logger.debug('Cache hit', { key, accessCount: entry.accessCount });
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
      logger.debug('Cache delete', { key });
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    logger.info('Cache cleared');
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
      logger.debug('Cache LRU eviction', { key: oldestKey });
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.size = this.cache.size;
      logger.debug('Cache cleanup', { entriesRemoved: cleaned });
    }
  }

  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Specialized caches for different data types
export const propertyCache = new AdvancedCache<any>({
  defaultTTL: 10 * 60 * 1000, // 10 minutes for property data
  maxSize: 500,
  checkInterval: 5 * 60 * 1000
});

export const userCache = new AdvancedCache<any>({
  defaultTTL: 15 * 60 * 1000, // 15 minutes for user data
  maxSize: 200,
  checkInterval: 5 * 60 * 1000
});

export const exchangeRateCache = new AdvancedCache<any>({
  defaultTTL: 2 * 60 * 1000, // 2 minutes for exchange rates
  maxSize: 50,
  checkInterval: 30 * 1000
});

export const analyticsCache = new AdvancedCache<any>({
  defaultTTL: 5 * 60 * 1000, // 5 minutes for analytics
  maxSize: 100,
  checkInterval: 2 * 60 * 1000
});

// Query cache wrapper for Supabase
export function createQueryCache<T>(
  cacheInstance: AdvancedCache<T>,
  keyPrefix: string
) {
  return {
    async cached<TResult>(
      queryKey: string | string[],
      queryFn: () => Promise<TResult>,
      ttl?: number
    ): Promise<TResult> {
      const key = Array.isArray(queryKey) 
        ? `${keyPrefix}:${queryKey.join(':')}`
        : `${keyPrefix}:${queryKey}`;

      // Try to get from cache first
      const cached = cacheInstance.get(key);
      if (cached !== null) {
        return cached as TResult;
      }

      // Execute query and cache result
      try {
        const result = await queryFn();
        cacheInstance.set(key, result as T, ttl);
        return result;
      } catch (error) {
        logger.error('Query cache error', error, { key });
        throw error;
      }
    },

    invalidate(pattern: string): void {
      const keys = Array.from((cacheInstance as any).cache.keys());
      const patternKey = `${keyPrefix}:${pattern}`;
      
      keys.forEach(key => {
        if (key.includes(patternKey)) {
          cacheInstance.delete(key);
        }
      });
      
      logger.info('Cache invalidated', { pattern: patternKey });
    },

    clear(): void {
      cacheInstance.clear();
    }
  };
}

// Property queries cache
export const propertyQueryCache = createQueryCache(propertyCache, 'property');

// User queries cache
export const userQueryCache = createQueryCache(userCache, 'user');

// Exchange rate cache
export const exchangeQueryCache = createQueryCache(exchangeRateCache, 'exchange');

// Analytics cache
export const analyticsQueryCache = createQueryCache(analyticsCache, 'analytics');

// Browser storage cache for persistence
class PersistentCache {
  private storageKey: string;
  private storage: Storage;

  constructor(storageKey: string, useSessionStorage = false) {
    this.storageKey = storageKey;
    this.storage = useSessionStorage ? sessionStorage : localStorage;
  }

  set(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): void {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl
    };

    try {
      const stored = this.getAll();
      stored[key] = entry;
      this.storage.setItem(this.storageKey, JSON.stringify(stored));
    } catch (error) {
      logger.error('Persistent cache set error', error, { key });
    }
  }

  get(key: string): any | null {
    try {
      const stored = this.getAll();
      const entry = stored[key];

      if (!entry) return null;

      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        delete stored[key];
        this.storage.setItem(this.storageKey, JSON.stringify(stored));
        return null;
      }

      return entry.data;
    } catch (error) {
      logger.error('Persistent cache get error', error, { key });
      return null;
    }
  }

  delete(key: string): void {
    try {
      const stored = this.getAll();
      delete stored[key];
      this.storage.setItem(this.storageKey, JSON.stringify(stored));
    } catch (error) {
      logger.error('Persistent cache delete error', error, { key });
    }
  }

  clear(): void {
    try {
      this.storage.removeItem(this.storageKey);
    } catch (error) {
      logger.error('Persistent cache clear error', error);
    }
  }

  private getAll(): Record<string, any> {
    try {
      const stored = this.storage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error('Persistent cache getAll error', error);
      return {};
    }
  }
}

// Persistent caches for different use cases
export const userPreferencesCache = new PersistentCache('nexus_user_prefs');
export const walletDataCache = new PersistentCache('nexus_wallet_data', true); // Session storage
export const propertyFavoritesCache = new PersistentCache('nexus_property_favorites');

// React hook for cache management
export function useCache<T>(
  cacheInstance: AdvancedCache<T>,
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; enabled?: boolean } = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const { ttl, enabled = true } = options;

  const fetchData = React.useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = cacheInstance.get(key);
      if (cached !== null) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Fetch from source
      const result = await fetcher();
      cacheInstance.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = React.useCallback(() => {
    cacheInstance.delete(key);
    fetchData();
  }, [key, fetchData]);

  const updateCache = React.useCallback((newData: T) => {
    cacheInstance.set(key, newData, ttl);
    setData(newData);
  }, [key, ttl]);

  return {
    data,
    loading,
    error,
    refetch,
    updateCache
  };
}

// Cache warming strategies
export async function warmPropertyCache() {
  logger.info('Starting property cache warming');
  
  try {
    // Pre-load featured properties
    const featuredProperties = await fetch('/api/properties/featured').then(r => r.json());
    propertyCache.set('featured_properties', featuredProperties, 15 * 60 * 1000);

    // Pre-load property categories
    const categories = await fetch('/api/properties/categories').then(r => r.json());
    propertyCache.set('property_categories', categories, 30 * 60 * 1000);

    logger.info('Property cache warming completed');
  } catch (error) {
    logger.error('Property cache warming failed', error);
  }
}

export async function warmExchangeRateCache() {
  logger.info('Starting exchange rate cache warming');
  
  try {
    const rates = await fetch('/api/exchange-rates').then(r => r.json());
    exchangeRateCache.set('current_rates', rates, 60 * 1000); // 1 minute TTL

    logger.info('Exchange rate cache warming completed');
  } catch (error) {
    logger.error('Exchange rate cache warming failed', error);
  }
}

// Cache performance monitoring
export function getCachePerformanceReport() {
  return {
    property: propertyCache.getStats(),
    user: userCache.getStats(),
    exchangeRate: exchangeRateCache.getStats(),
    analytics: analyticsCache.getStats()
  };
}

// Initialize cache warming on app start
export function initializeCache() {
  // Warm critical caches
  if (typeof window !== 'undefined') {
    // Wait a bit for app to initialize
    setTimeout(() => {
      warmPropertyCache();
      warmExchangeRateCache();
    }, 2000);

    // Set up periodic cache warming
    setInterval(() => {
      warmExchangeRateCache();
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}

// Cleanup on app unmount
export function destroyCaches() {
  propertyCache.destroy();
  userCache.destroy();
  exchangeRateCache.destroy();
  analyticsCache.destroy();
}

// Auto-initialize
initializeCache();