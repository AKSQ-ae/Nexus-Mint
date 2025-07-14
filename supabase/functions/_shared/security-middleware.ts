/**
 * Security Middleware for Edge Functions
 * Implements rate limiting, security headers, and request validation
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }
}

const rateLimiter = new RateLimiter();

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

export function getClientIdentifier(req: Request): string {
  // Try to get real IP from headers (for rate limiting)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const remoteAddr = req.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || realIp || remoteAddr || 'unknown';
}

export function validateRequest(req: Request): { valid: boolean; error?: string } {
  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { valid: false, error: 'Invalid Content-Type. Expected application/json' };
    }
  }

  // Validate request size (prevent DoS)
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
    return { valid: false, error: 'Request too large' };
  }

  return { valid: true };
}

export function applyRateLimit(req: Request): { allowed: boolean; remaining: number } {
  const identifier = getClientIdentifier(req);
  const allowed = rateLimiter.isAllowed(identifier);
  const remaining = rateLimiter.getRemainingRequests(identifier);
  
  return { allowed, remaining };
}

export function createSecureResponse(
  data: any, 
  status = 200, 
  additionalHeaders: Record<string, string> = {}
): Response {
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...securityHeaders,
    ...additionalHeaders
  };

  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}