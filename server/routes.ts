import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { StripeService, stripe } from "./stripe";
import { insertDownloadSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { asyncHandler, formatSuccessResponse } from "./utils/errorHandler";
import { validate } from "./middleware/validation";

// Configure multer for file uploads
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'profile-pictures');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.user?.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storageConfig,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes are handled in setupAuth() from auth.ts

  // Subscription plans
  app.get('/api/subscription-plans', asyncHandler(async (req, res) => {
    const plans = await storage.getSubscriptionPlans();
    res.json(formatSuccessResponse(plans, 'Subscription plans fetched successfully'));
  }));

  // Create Stripe checkout session
  app.post('/api/create-checkout-session', requireAuth, asyncHandler(async (req: any, res) => {
    const { planId } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://yourdomain.com'
      : 'http://localhost:5173';

    const session = await StripeService.createCheckoutSession(
      userId,
      planId,
      `${baseUrl}/dashboard?success=true`,
      `${baseUrl}/pricing?canceled=true`
    );

    res.json(formatSuccessResponse({ sessionId: session.id, url: session.url }, 'Checkout session created successfully'));
  }));

  // Create customer portal session
  app.post('/api/create-portal-session', requireAuth, asyncHandler(async (req: any, res) => {
    const userId = req.user.id;
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://yourdomain.com'
      : 'http://localhost:5173';

    const portalUrl = await StripeService.createPortalSession(
      userId,
      `${baseUrl}/dashboard`
    );

    res.json(formatSuccessResponse({ url: portalUrl }, 'Portal session created successfully'));
  }));

  // Get user subscription status
  app.get('/api/subscription', requireAuth, asyncHandler(async (req: any, res) => {
    const userId = req.user.id;
    const subscription = await storage.getUserSubscription(userId);
    
    if (!subscription) {
      return res.json(formatSuccessResponse({ hasSubscription: false }, 'No subscription found'));
    }

    res.json(formatSuccessResponse({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd,
      }
    }, 'Subscription fetched successfully'));
  }));

  // Stripe webhook handler
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      return res.status(400).json({ message: "Missing signature or webhook secret" });
    }

    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    // Store webhook event
    await storage.createWebhookEvent({
      stripeEventId: event.id,
      eventType: event.type,
      eventData: event.data,
    });

    // Handle the event
    await StripeService.handleWebhookEvent(event);

    // Mark as processed
    await storage.markWebhookEventProcessed(event.id);

    res.json(formatSuccessResponse({ received: true }, 'Webhook processed successfully'));
  }));

  // Download tracking
  app.post('/api/downloads', validate(insertDownloadSchema), asyncHandler(async (req, res) => {
    const downloadData = insertDownloadSchema.parse(req.body);
    const userId = req.user?.id; // Optional, for logged-in users
    const ipAddress = req.realIP || (req.connection as any).remoteAddress || 'unknown';
    
    const download = await storage.trackDownload({
      ...downloadData,
      userId: userId?.toString(),
      ipAddress,
    });
    
    res.json(formatSuccessResponse(download, 'Download tracked successfully'));
  }));

  // Download statistics (public)
  app.get('/api/downloads/stats', asyncHandler(async (req, res) => {
    const stats = await storage.getDownloadStats();
    res.json(formatSuccessResponse(stats, 'Download statistics fetched successfully'));
  }));

  // User usage statistics (protected)
  app.get('/api/usage-stats', requireAuth, asyncHandler(async (req: any, res) => {
    const userId = req.user.id;
    const stats = await storage.getUserUsageStats(userId);
    res.json(formatSuccessResponse(stats, 'Usage statistics fetched successfully'));
  }));

  // Update user profile (protected)
  app.put('/api/profile', requireAuth, asyncHandler(async (req: any, res) => {
    const userId = req.user.id;
    const { firstName, lastName, email } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "First name, last name, and email are required" });
    }

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email is already taken" });
      }
    }

    const updatedUser = await storage.updateUser(userId, {
      firstName,
      lastName,
      email,
    });

    res.json(formatSuccessResponse(updatedUser, 'Profile updated successfully'));
  }));

  // Change password (protected, only for users with existing passwords)
  app.put('/api/change-password', requireAuth, asyncHandler(async (req: any, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Check if user has a password to change (OAuth-only users don't have passwords)
    if (!req.user.password) {
      return res.status(400).json({ 
        message: "Cannot change password. This account uses Google Sign-In for authentication." 
      });
    }

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await storage.updateUser(userId, {
      password: hashedNewPassword,
    });

    res.json(formatSuccessResponse({ message: "Password updated successfully" }, 'Password updated successfully'));
  }));

  // Profile picture upload (protected)
  app.post('/api/upload-profile-picture', requireAuth, (req, res, next) => {
    upload.single('profilePicture')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 2MB.' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }, asyncHandler(async (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const filePath = req.file.path;
    
    // Generate public URL for the uploaded file
    const fileName = path.basename(filePath);
    const profileImageUrl = `/uploads/profile-pictures/${fileName}`;
    
    // Update user's profile image URL in database
    const updatedUser = await storage.updateUser(userId, {
      profileImageUrl,
    });

    res.json(formatSuccessResponse(updatedUser, 'Profile picture uploaded successfully'));
  }));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // OS detection helper
  app.get('/api/detect-os', (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    let os = 'unknown';
    
    if (userAgent.includes('Mac OS X')) {
      os = 'mac';
    } else if (userAgent.includes('Windows')) {
      os = 'windows';
    } else if (userAgent.includes('Linux')) {
      os = 'linux';
    }
    
    res.json(formatSuccessResponse({ os, userAgent }, 'OS detected successfully'));
  });

  const httpServer = createServer(app);
  return httpServer;
}
