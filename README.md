# deskAI - Desktop Application with Health Tracking

A modern desktop application that tracks user health metrics, provides focus session features, and manages subscription-based access with comprehensive analytics and security features.

## 🚀 Features

- **Health Monitoring**: Eye strain, posture, stress level tracking
- **Focus Sessions**: Productivity tracking with AI assistance
- **Subscription Management**: Stripe-integrated billing system
- **Multi-Auth**: Google OAuth and email/password authentication
- **Real-time Analytics**: Comprehensive usage statistics
- **Security**: 2FA, rate limiting, comprehensive audit trails
- **Cross-platform**: macOS, Windows, and Linux support

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with Google OAuth
- **Payments**: Stripe integration
- **File Storage**: Local file system with security validation
- **Logging**: Winston for production-ready logging

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- Git

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/deskai.git
cd deskai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
```bash
cp .example.env .env
# Edit .env with your configuration
```

### 4. Database setup
```bash
# Create PostgreSQL database
createdb deskai_db

# Run migrations
npm run db:push
```

### 5. Start development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Database
npm run db:push      # Push database schema changes
npm run cleanup      # Clean up database

# Stripe Setup
npm run setup-stripe # Setup Stripe plans
npm run update-pro-plan # Update Pro plan
```

### Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks (optional)

### Project Structure

```
deskai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities and configurations
│   │   ├── pages/         # Page components
│   │   └── ui/            # UI components
├── server/                 # Node.js backend
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── shared/                 # Shared schemas and types
├── migrations/             # Database migrations
├── uploads/                # File uploads
└── logs/                   # Application logs
```

## 🚀 Production Deployment

### Quick Start

1. **Environment Configuration**
   ```bash
   cp .example.env .env
   # Configure all required environment variables
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Docker Deployment

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f app
```

## 🔒 Security Features

- **Authentication**: Multi-factor authentication support
- **Rate Limiting**: API and endpoint-specific rate limiting
- **Input Validation**: Zod schema validation
- **File Upload Security**: Type and size validation
- **CORS Protection**: Configurable origin restrictions
- **Security Headers**: Helmet.js security middleware
- **Audit Logging**: Comprehensive action tracking
- **UUID-based IDs**: Prevents enumeration attacks

## 📊 Monitoring & Health

### Health Check Endpoints

- `/health` - Application health status
- `/ready` - Readiness probe for load balancers

### Logging

- Structured logging with Winston
- File and console output
- Log rotation and compression
- Environment-specific log levels

### Performance

- Database connection pooling
- Request/response timing
- Memory usage monitoring
- Error rate tracking

## 🗄️ Database Schema (deployed on Supabase)

The application uses PostgreSQL with the following key tables:

- **users**: User accounts and authentication
- **subscription_plans**: Available subscription tiers
- **user_subscriptions**: User subscription status
- **usage_stats**: Health and productivity metrics
- **audit_logs**: Comprehensive audit trail
- **downloads**: Application download tracking

For detailed schema documentation, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

## 🔌 API Endpoints

### Public Endpoints
- `GET /api/subscription-plans` - Available plans
- `GET /api/downloads/stats` - Download statistics
- `GET /health` - Health check
- `GET /ready` - Readiness check

### Protected Endpoints
- `GET /api/subscription` - User subscription
- `GET /api/usage-stats` - Usage statistics
- `PUT /api/profile` - Update profile
- `POST /api/upload-profile-picture` - Upload profile picture

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - User logout

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```
