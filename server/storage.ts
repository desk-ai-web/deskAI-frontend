import {
  users,
  subscriptionPlans,
  userSubscriptions,
  stripeWebhookEvents,
  downloads,
  usageStats,
  type User,
  type InsertUser,
  type SubscriptionPlan,
  type UserSubscription,
  type StripeWebhookEvent,
  type Download,
  type UsageStats,
  type InsertDownload,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations for custom auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // Subscription operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | undefined>;
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  getUserSubscriptionByStripeId(stripeSubscriptionId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(subscriptionData: Partial<UserSubscription>): Promise<UserSubscription>;
  updateUserSubscription(id: string, subscriptionData: Partial<UserSubscription>): Promise<UserSubscription>;
  
  // Stripe webhook operations
  createWebhookEvent(eventData: Partial<StripeWebhookEvent>): Promise<StripeWebhookEvent>;
  markWebhookEventProcessed(stripeEventId: string): Promise<void>;
  
  // Download operations
  trackDownload(download: InsertDownload & { userId?: string; ipAddress?: string }): Promise<Download>;
  getDownloadStats(): Promise<{ platform: string; count: number }[]>;
  
  // Usage statistics
  getUserUsageStats(userId: string, limit?: number): Promise<UsageStats[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
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

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
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

  async getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async getUserSubscriptionByStripeId(stripeSubscriptionId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubscriptionId));
    return subscription;
  }

  async createUserSubscription(subscriptionData: Partial<UserSubscription>): Promise<UserSubscription> {
    const [subscription] = await db
      .insert(userSubscriptions)
      .values(subscriptionData as any)
      .returning();
    return subscription;
  }

  async updateUserSubscription(id: string, subscriptionData: Partial<UserSubscription>): Promise<UserSubscription> {
    const [subscription] = await db
      .update(userSubscriptions)
      .set({ ...subscriptionData, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return subscription;
  }

  async createWebhookEvent(eventData: Partial<StripeWebhookEvent>): Promise<StripeWebhookEvent> {
    const [event] = await db
      .insert(stripeWebhookEvents)
      .values(eventData as any)
      .returning();
    return event;
  }

  async markWebhookEventProcessed(stripeEventId: string): Promise<void> {
    await db
      .update(stripeWebhookEvents)
      .set({ processed: true })
      .where(eq(stripeWebhookEvents.stripeEventId, stripeEventId));
  }

  async trackDownload(downloadData: InsertDownload & { userId?: string; ipAddress?: string }): Promise<Download> {
    const [download] = await db
      .insert(downloads)
      .values({
        platform: downloadData.platform,
        version: downloadData.version,
        userId: downloadData.userId,
        ipAddress: downloadData.ipAddress,
        downloadedAt: new Date()
      })
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
