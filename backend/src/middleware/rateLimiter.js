// Simple in-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map();

const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const limit = rateLimitMap.get(key);
    
    if (now > limit.resetTime) {
      // Reset window
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (limit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((limit.resetTime - now) / 1000)
      });
    }

    limit.count++;
    next();
  };
};

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 60 * 1000);

module.exports = rateLimiter;
