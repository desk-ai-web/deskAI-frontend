import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

// Rate limiting configuration
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// Specific rate limits for different endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const uploadRateLimit = createRateLimit(15 * 60 * 1000, 10); // 10 uploads per 15 minutes

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://yourdomain.com', // Replace with your production domain
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Security headers configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://replit.com"
      ],
      connectSrc: [
        "'self'", 
        "https://api.stripe.com",
        "ws://localhost:*",
        "wss://localhost:*"
      ],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

// Request size limits
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request entity too large',
      maxSize: '10MB',
    });
  }
  
  next();
};

// IP address extraction
export const extractIP = (req: Request, res: Response, next: NextFunction) => {
  // Store IP in a custom property since req.ip is read-only in newer Express versions
  req.realIP = req.headers['x-forwarded-for'] as string || 
               req.headers['x-real-ip'] as string || 
               (req.connection as any).remoteAddress || 
               (req.socket as any).remoteAddress || 
               'unknown';
  next();
};

// Security middleware setup
export const setupSecurity = (app: any) => {
  // Use more permissive CSP in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Development CSP - more permissive for hot reload and debugging
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://replit.com",
            "https://js.stripe.com",
            "https://m.stripe.com"
          ],
          connectSrc: [
            "'self'", 
            "https://api.stripe.com",
            "https://js.stripe.com",
            "https://m.stripe.com",
            "https://hooks.stripe.com",
            "ws://localhost:*",
            "wss://localhost:*"
          ],
          frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
          workerSrc: ["'self'", "blob:"],
        },
      },
      hsts: false, // Disable HSTS in development
    }));
  } else {
    // Production CSP - more restrictive
    app.use(helmet(helmetConfig));
  }
  
  // CORS
  app.use(cors(corsOptions));
  
  // Extract real IP address - temporarily disabled due to Express 4.21+ compatibility
  // app.use(extractIP);
  
  // Request size limits
  app.use(requestSizeLimit);
  
  // Global rate limiting
  app.use('/api/', apiRateLimit);
  
  // Specific rate limits
  app.use('/api/auth/', authRateLimit);
  app.use('/api/upload-profile-picture', uploadRateLimit);
  
  // Additional security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
};
