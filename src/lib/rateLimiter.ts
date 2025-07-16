import { createComponentLogger } from './logger';

const logger = createComponentLogger('RateLimiter');

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  blockDuration?: number; // How long to block after limit exceeded
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private store = new Map<string, RateLimitEntry>();
  private configs = new Map<string, RateLimitConfig>();

  private constructor() {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  // Configure rate limits for different endpoints/actions
  configure(key: string, config: RateLimitConfig): void {
    this.configs.set(key, config);
    logger.debug('Rate limit configured', { key, config });
  }

  // Check if request is allowed
  isAllowed(key: string, identifier: string): { allowed: boolean; resetTime?: number; retryAfter?: number } {
    const config = this.configs.get(key);
    if (!config) {
      logger.warn('No rate limit config found', { key });
      return { allowed: true };
    }

    const storeKey = `${key}:${identifier}`;
    const now = Date.now();
    const entry = this.store.get(storeKey);

    // Check if currently blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      logger.securityEvent('Rate limit block active', { key, identifier, blockedUntil: entry.blockedUntil });
      return { 
        allowed: false, 
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) 
      };
    }

    // Initialize or reset if window expired
    if (!entry || now >= entry.resetTime) {
      this.store.set(storeKey, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { allowed: true, resetTime: now + config.windowMs };
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      const blockDuration = config.blockDuration || config.windowMs;
      entry.blockedUntil = now + blockDuration;
      
      logger.securityEvent('Rate limit exceeded', { 
        key, 
        identifier, 
        count: entry.count, 
        limit: config.maxRequests,
        blockedUntil: entry.blockedUntil
      });

      return { 
        allowed: false, 
        retryAfter: Math.ceil(blockDuration / 1000) 
      };
    }

    return { allowed: true, resetTime: entry.resetTime };
  }

  // Record successful request (for skipSuccessfulRequests option)
  recordSuccess(key: string, identifier: string): void {
    const config = this.configs.get(key);
    if (config?.skipSuccessfulRequests) {
      const storeKey = `${key}:${identifier}`;
      const entry = this.store.get(storeKey);
      if (entry && entry.count > 0) {
        entry.count--;
      }
    }
  }

  // Record failed request (for skipFailedRequests option)
  recordFailure(key: string, identifier: string): void {
    const config = this.configs.get(key);
    if (config?.skipFailedRequests) {
      const storeKey = `${key}:${identifier}`;
      const entry = this.store.get(storeKey);
      if (entry && entry.count > 0) {
        entry.count--;
      }
    }
  }

  // Get current status for identifier
  getStatus(key: string, identifier: string): { count: number; limit: number; resetTime: number; blocked: boolean } {
    const config = this.configs.get(key);
    if (!config) {
      return { count: 0, limit: 0, resetTime: 0, blocked: false };
    }

    const storeKey = `${key}:${identifier}`;
    const entry = this.store.get(storeKey);
    const now = Date.now();

    return {
      count: entry?.count || 0,
      limit: config.maxRequests,
      resetTime: entry?.resetTime || 0,
      blocked: Boolean(entry?.blockedUntil && now < entry.blockedUntil)
    };
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime && (!entry.blockedUntil || now >= entry.blockedUntil)) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Rate limiter cleanup completed', { entriesRemoved: cleaned });
    }
  }

  // Reset limits for identifier (admin function)
  reset(key: string, identifier: string): void {
    const storeKey = `${key}:${identifier}`;
    this.store.delete(storeKey);
    logger.info('Rate limit reset', { key, identifier });
  }

  // Get statistics
  getStats(): { totalEntries: number; activeBlocks: number } {
    const now = Date.now();
    let activeBlocks = 0;

    for (const entry of this.store.values()) {
      if (entry.blockedUntil && now < entry.blockedUntil) {
        activeBlocks++;
      }
    }

    return {
      totalEntries: this.store.size,
      activeBlocks
    };
  }
}

export const rateLimiter = RateLimiter.getInstance();

// Pre-configure common rate limits
rateLimiter.configure('api:general', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  blockDuration: 5 * 60 * 1000 // 5 minutes
});

rateLimiter.configure('api:auth', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  blockDuration: 15 * 60 * 1000 // 15 minutes
});

rateLimiter.configure('api:investment', {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10,
  blockDuration: 10 * 60 * 1000 // 10 minutes
});

rateLimiter.configure('api:property', {
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 50,
  blockDuration: 5 * 60 * 1000 // 5 minutes
});

rateLimiter.configure('api:kyc', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  blockDuration: 30 * 60 * 1000 // 30 minutes
});

// React hook for rate limiting
export function useRateLimit(key: string, identifier?: string) {
  const getUserIdentifier = () => {
    if (identifier) return identifier;
    
    // Try to get user ID from various sources
    const userId = localStorage.getItem('userId') || 
                  sessionStorage.getItem('userId') || 
                  'anonymous';
    
    // Fallback to IP-based identification (simplified for frontend)
    return `${userId}:${navigator.userAgent.slice(0, 50)}`;
  };

  const checkLimit = () => {
    return rateLimiter.isAllowed(key, getUserIdentifier());
  };

  const recordSuccess = () => {
    rateLimiter.recordSuccess(key, getUserIdentifier());
  };

  const recordFailure = () => {
    rateLimiter.recordFailure(key, getUserIdentifier());
  };

  const getStatus = () => {
    return rateLimiter.getStatus(key, getUserIdentifier());
  };

  return {
    checkLimit,
    recordSuccess,
    recordFailure,
    getStatus
  };
}

// Decorator for API functions
export function withRateLimit(key: string, identifier?: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;

    descriptor.value = (async function (this: any, ...args: any[]) {
      const id = identifier || 'default';
      const { allowed, retryAfter } = rateLimiter.isAllowed(key, id);

      if (!allowed) {
        const error = new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
        logger.securityEvent('Rate limit blocked API call', { key, identifier: id, retryAfter });
        throw error;
      }

      try {
        const result = await method.apply(this, args);
        rateLimiter.recordSuccess(key, id);
        return result;
      } catch (error) {
        rateLimiter.recordFailure(key, id);
        throw error;
      }
    }) as T;

    return descriptor;
  };
}

// Utility function for manual rate limiting in components
export async function withRateLimitCheck<T>(
  key: string,
  operation: () => Promise<T>,
  identifier?: string
): Promise<T> {
  const id = identifier || 'default';
  const { allowed, retryAfter } = rateLimiter.isAllowed(key, id);

  if (!allowed) {
    const error = new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
    logger.securityEvent('Rate limit blocked operation', { key, identifier: id, retryAfter });
    throw error;
  }

  try {
    const result = await operation();
    rateLimiter.recordSuccess(key, id);
    return result;
  } catch (error) {
    rateLimiter.recordFailure(key, id);
    throw error;
  }
}