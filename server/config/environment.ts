import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variable schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5173'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'STRIPE_PUBLISHABLE_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  
  // Frontend Configuration
  FRONTEND_URL: z.string().url('Invalid FRONTEND_URL').optional(),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'VITE_STRIPE_PUBLISHABLE_KEY is required'),
  
  // Security
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').default('your-super-secret-session-key-change-this-in-production'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').default('your-super-secret-jwt-key-change-this-in-production'),
  
  // CORS
  ALLOWED_ORIGINS: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('2097152'), // 2MB in bytes
  UPLOAD_DIR: z.string().default('uploads'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Database Connection
  DB_POOL_SIZE: z.string().transform(Number).default('10'),
  DB_CONNECTION_TIMEOUT: z.string().transform(Number).default('5000'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Environment-specific configurations
export const config = {
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  server: {
    port: env.PORT,
    host: '0.0.0.0',
  },
  
  database: {
    url: env.DATABASE_URL,
    poolSize: env.DB_POOL_SIZE,
    connectionTimeout: env.DB_CONNECTION_TIMEOUT,
  },
  
  auth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    session: {
      secret: env.SESSION_SECRET,
    },
    jwt: {
      secret: env.JWT_SECRET,
    },
  },
  
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },
  
  frontend: {
    url: env.FRONTEND_URL,
    stripeKey: env.VITE_STRIPE_PUBLISHABLE_KEY,
  },
  
  security: {
    cors: {
      allowedOrigins: env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:5173',
        'http://localhost:3000',
        env.FRONTEND_URL,
      ].filter(Boolean),
    },
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
  },
  
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    directory: env.UPLOAD_DIR,
  },
  
  logging: {
    level: env.LOG_LEVEL,
  },
};

// Validate required environment variables for production
export const validateProductionEnv = () => {
  if (env.isProduction) {
    const requiredForProduction = [
      'DATABASE_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'SESSION_SECRET',
      'JWT_SECRET',
      'FRONTEND_URL',
    ];
    
    const missing = requiredForProduction.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables for production:');
      missing.forEach(key => console.error(`  ${key}`));
      process.exit(1);
    }
    
    // Validate session and JWT secrets are not default values
    if (env.SESSION_SECRET === 'your-super-secret-session-key-change-this-in-production') {
      console.error('❌ SESSION_SECRET must be changed from default value in production');
      process.exit(1);
    }
    
    if (env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      console.error('❌ JWT_SECRET must be changed from default value in production');
      process.exit(1);
    }
  }
};

// Call validation for production
validateProductionEnv();
