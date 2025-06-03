import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertDownloadSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Also get user's subscription
      const subscription = await storage.getUserSubscription(userId);
      
      res.json({
        ...user,
        subscription
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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
      const userId = req.user?.claims?.sub; // Optional, for logged-in users
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
  app.get('/api/usage-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserUsageStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ message: "Failed to fetch usage stats" });
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
