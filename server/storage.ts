import {
  users,
  subscriptionPlans,
  userSubscriptions,
  downloads,
  usageStats,
  type User,
  type UpsertUser,
  type SubscriptionPlan,
  type UserSubscription,
  type Download,
  type UsageStats,
  type InsertDownload,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations for custom auth
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  
  // Subscription operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getUserSubscription(userId: number): Promise<UserSubscription | undefined>;
  
  // Download operations
  trackDownload(download: InsertDownload & { userId?: number; ipAddress?: string }): Promise<Download>;
  getDownloadStats(): Promise<{ platform: string; count: number }[]>;
  
  // Usage statistics
  getUserUsageStats(userId: number, limit?: number): Promise<UsageStats[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true));
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active")
        )
      )
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async trackDownload(downloadData: InsertDownload & { userId?: string; ipAddress?: string }): Promise<Download> {
    const [download] = await db
      .insert(downloads)
      .values(downloadData)
      .returning();
    return download;
  }

  async getDownloadStats(): Promise<{ platform: string; count: number }[]> {
    const stats = await db
      .select({
        platform: downloads.platform,
        count: downloads.id,
      })
      .from(downloads);
    
    // Group by platform and count
    const platformCounts: { [key: string]: number } = {};
    stats.forEach(stat => {
      platformCounts[stat.platform] = (platformCounts[stat.platform] || 0) + 1;
    });
    
    return Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count,
    }));
  }

  async getUserUsageStats(userId: string, limit = 30): Promise<UsageStats[]> {
    return await db
      .select()
      .from(usageStats)
      .where(eq(usageStats.userId, userId))
      .orderBy(desc(usageStats.date))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
