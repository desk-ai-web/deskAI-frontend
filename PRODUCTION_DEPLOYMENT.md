# Production Deployment Guide

This guide provides comprehensive instructions for deploying deskAI to production environments with security, performance, and reliability best practices.

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables
- [ ] All required environment variables are set
- [ ] `SESSION_SECRET` and `JWT_SECRET` are changed from default values
- [ ] `FRONTEND_URL` is set to your production domain
- [ ] Database connection string is production-ready
- [ ] Stripe keys are production keys (not test keys)

### 2. Security
- [ ] HTTPS is enabled
- [ ] CORS origins are properly configured
- [ ] Rate limiting is configured
- [ ] Security headers are enabled
- [ ] File upload limits are set

### 3. Database
- [ ] Database is production-ready (PostgreSQL recommended)
- [ ] Database connection pooling is configured
- [ ] Database backups are scheduled
- [ ] Database migrations have been run

### 4. Monitoring & Logging
- [ ] Logging is configured for production
- [ ] Health check endpoints are accessible
- [ ] Error monitoring is set up
- [ ] Performance monitoring is configured

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Node Environment
NODE_ENV="production"
PORT="3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Frontend Configuration
FRONTEND_URL="https://yourdomain.com"
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Security (MUST CHANGE FROM DEFAULTS!)
SESSION_SECRET="your-very-long-random-session-secret-here"
JWT_SECRET="your-very-long-random-jwt-secret-here"

# CORS
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Logging
LOG_LEVEL="info"

# File Upload
MAX_FILE_SIZE="2097152"
UPLOAD_DIR="uploads"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"

# Database Connection
DB_POOL_SIZE="20"
DB_CONNECTION_TIMEOUT="5000"
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Create uploads directory
RUN mkdir -p uploads logs && chown -R nodejs:nodejs uploads logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - SESSION_SECRET=${SESSION_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

## 🌐 Nginx Configuration

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=2r/s;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # API routes with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Upload endpoint with stricter rate limiting
        location /api/upload-profile-picture {
            limit_req zone=upload burst=5 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health checks
        location /health {
            proxy_pass http://app;
            access_log off;
        }

        # Static files
        location /uploads/ {
            alias /app/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Frontend
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

## 🔒 Security Best Practices

### 1. SSL/TLS Configuration
- Use Let's Encrypt for free SSL certificates
- Enable HTTP/2 for better performance
- Configure strong cipher suites
- Set proper SSL session parameters

### 2. Rate Limiting
- API endpoints: 10 requests per second
- Upload endpoints: 2 requests per second
- Authentication endpoints: 5 requests per 15 minutes

### 3. Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### 4. File Upload Security
- Validate file types
- Limit file sizes
- Scan for malware
- Store files outside web root

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- `/health` - Application health status
- `/ready` - Readiness probe for Kubernetes

### Logging
- Structured logging with Winston
- Log rotation and compression
- Centralized log aggregation
- Error tracking with Sentry

### Performance Monitoring
- Response time tracking
- Memory usage monitoring
- Database query performance
- Error rate monitoring

## 🚀 Deployment Commands

### 1. Build and Deploy
```bash
# Build the application
npm run build

# Run database migrations
npm run db:push

# Start the application
npm start
```

### 2. Docker Deployment
```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### 3. Environment Setup
```bash
# Copy environment file
cp .example.env .env

# Edit environment variables
nano .env

# Validate environment
npm run check
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to server
      run: |
        # Add your deployment commands here
        # Example: rsync, SSH commands, etc.
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database is running
   - Check firewall settings

2. **Authentication Issues**
   - Verify Google OAuth credentials
   - Check CORS configuration
   - Validate session secrets

3. **File Upload Failures**
   - Check file size limits
   - Verify upload directory permissions
   - Check disk space

4. **Rate Limiting Issues**
   - Adjust rate limit settings
   - Check for proxy configuration
   - Verify IP address extraction

### Debug Commands

```bash
# Check application status
curl http://localhost:3000/health

# View application logs
tail -f logs/combined.log

# Check environment variables
node -e "console.log(process.env.NODE_ENV)"

# Test database connection
node -e "require('./server/db').execute('SELECT 1')"
```

## 📚 Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/runtime-config-query.html)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Security Headers](https://owasp.org/www-project-secure-headers/)

---

**Remember**: Security is an ongoing process. Regularly update dependencies, monitor logs, and stay informed about security best practices.
