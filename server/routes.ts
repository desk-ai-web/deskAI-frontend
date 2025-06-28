import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { insertDownloadSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes are handled in setupAuth() from auth.ts

  // Subscription plans
  app.get('/api/subscription-plans', async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Download tracking
  app.post('/api/downloads', async (req, res) => {
    try {
      const downloadData = insertDownloadSchema.parse(req.body);
      const userId = req.user?.id; // Optional, for logged-in users
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const download = await storage.trackDownload({
        ...downloadData,
        userId,
        ipAddress,
      });
      
      res.json(download);
    } catch (error) {
      console.error("Error tracking download:", error);
      res.status(500).json({ message: "Failed to track download" });
    }
  });

  // Download statistics (public)
  app.get('/api/downloads/stats', async (req, res) => {
    try {
      const stats = await storage.getDownloadStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching download stats:", error);
      res.status(500).json({ message: "Failed to fetch download stats" });
    }
  });

  // User usage statistics (protected)
  app.get('/api/usage-stats', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserUsageStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ message: "Failed to fetch usage stats" });
    }
  });

  // Update user profile (protected)
  app.put('/api/profile', requireAuth, async (req: any, res) => {
    try {
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

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password (protected, only for non-Google users)
  app.put('/api/change-password', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Check if user signed up with Google (no password to change)
      if (req.user.googleId) {
        return res.status(400).json({ message: "Cannot change password for Google OAuth users" });
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
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password || '');
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await storage.updateUser(userId, {
        password: hashedNewPassword,
      });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

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
    
    res.json({ os, userAgent });
  });

  const httpServer = createServer(app);
  return httpServer;
}
