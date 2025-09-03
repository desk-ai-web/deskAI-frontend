import {
  pgTable,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
  integer,
  uuid,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with custom authentication
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // For email/password auth
  googleId: varchar("google_id").unique(), // For Google OAuth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isEmailVerified: boolean("is_email_verified").default(false),
  stripeCustomerId: varchar("stripe_customer_id").unique(), // Stripe customer ID
  
  // Enhanced security fields
  twoFactorSecret: varchar("two_factor_secret"), // For optional 2FA
  lastLoginAt: timestamp("last_login_at"),
  loginAttempts: integer("login_attempts").default(0),
  isLocked: boolean("is_locked").default(false),
  lockExpiresAt: timestamp("lock_expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Performance indexes for common queries
  index("IDX_users_email_verified").on(table.email, table.isEmailVerified),
  index("IDX_users_google_id").on(table.googleId),
]);

// Subscription plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  price: integer("price").notNull(), // in cents
  stripePriceId: varchar("stripe_price_id").unique(), // Stripe price ID
  features: jsonb("features").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User subscriptions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  planId: uuid("plan_id").references(() => subscriptionPlans.id).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(), // Stripe subscription ID
  status: varchar("status").notNull(), // active, cancelled, expired, past_due, trialing
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  trialEnd: timestamp("trial_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false), // Handles end-of-period cancellation
  lastPaymentDate: timestamp("last_payment_date"),
  nextBillingDate: timestamp("next_billing_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Performance indexes for subscription queries
  index("IDX_user_subscriptions_status").on(table.userId, table.status, table.endDate),
  index("IDX_user_subscriptions_period").on(table.currentPeriodStart, table.currentPeriodEnd),
]);

// Stripe webhook events (for tracking webhook calls)
export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  stripeEventId: varchar("stripe_event_id").unique().notNull(),
  eventType: varchar("event_type").notNull(),
  eventData: jsonb("event_data").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_webhook_events_type").on(table.eventType, table.processed),
]);

// Download tracking
export const downloads = pgTable("downloads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  platform: varchar("platform").notNull(), // mac, windows, linux
  version: varchar("version").notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  ipAddress: varchar("ip_address"),
}, (table) => [
  index("IDX_downloads_platform_date").on(table.platform, table.downloadedAt),
]);

// Enhanced usage statistics with additional health metrics
export const usageStats = pgTable("usage_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow(),
  
  // Basic session metrics
  sessionDuration: integer("session_duration"), // in minutes
  focusSessions: integer("focus_sessions"),
  
  // Health metrics
  blinkCount: integer("blink_count"),
  postureAlerts: integer("posture_alerts"),
  screenTime: integer("screen_time"), // Total screen time in minutes
  restBreaksTaken: integer("rest_breaks_taken"),
  ergonomicScore: real("ergonomic_score"), // Calculated ergonomic health score (0-100)
  
  // AI and productivity metrics
  aiInteractions: integer("ai_interactions"), // Number of AI assistant interactions
  productivityScore: real("productivity_score"), // Calculated productivity score (0-100)
  
  // Additional health data
  eyeStrainLevel: integer("eye_strain_level"), // 1-10 scale
  postureQuality: integer("posture_quality"), // 1-10 scale
  stressLevel: integer("stress_level"), // 1-10 scale
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Performance indexes for analytics queries
  index("IDX_usage_stats_user_date").on(table.userId, table.date),
  index("IDX_usage_stats_health").on(table.ergonomicScore, table.productivityScore),
]);

// Audit trail for critical actions
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id), // Nullable for system actions
  action: varchar("action").notNull(), // 'login', 'subscription_changed', 'profile_updated', 'password_changed', etc.
  details: jsonb("details"), // Additional context about the action
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  success: boolean("success").default(true), // Whether the action was successful
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Performance indexes for audit queries
  index("IDX_audit_logs_user_action").on(table.userId, table.action, table.createdAt),
  index("IDX_audit_logs_action_date").on(table.action, table.createdAt),
]);

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type StripeWebhookEvent = typeof stripeWebhookEvents.$inferSelect;
export type Download = typeof downloads.$inferSelect;
export type UsageStats = typeof usageStats.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  platform: true,
  version: true,
});

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
