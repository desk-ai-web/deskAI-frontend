#!/usr/bin/env tsx

import { db } from "../server/db";
import { users, sessions, userSubscriptions, downloads, usageStats, subscriptionPlans } from "../shared/schema";
import { eq, lt, and, isNull } from "drizzle-orm";

/**
 * Database Cleanup Script for deskAI
 * 
 * This script provides various options to clean the database:
 * 1. Remove expired sessions
 * 2. Remove inactive users
 * 3. Remove test data
 * 4. Reset specific tables
 * 5. Complete database reset
 */

async function cleanupExpiredSessions() {
  console.log("🧹 Cleaning up expired sessions...");
  
  const expiredSessions = await db
    .delete(sessions)
    .where(lt(sessions.expire, new Date()))
    .returning();
  
  console.log(`✅ Removed ${expiredSessions.length} expired sessions`);
}

async function cleanupInactiveUsers(daysInactive: number = 30) {
  console.log(`🧹 Cleaning up users inactive for ${daysInactive} days...`);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
  
  // Find inactive users (no recent activity)
  const inactiveUsers = await db
    .select()
    .from(users)
    .where(
      and(
        lt(users.updatedAt, cutoffDate),
        eq(users.isEmailVerified, false) // Only unverified users
      )
    );
  
  if (inactiveUsers.length === 0) {
    console.log("✅ No inactive users found");
    return;
  }
  
  const userIds = inactiveUsers.map(user => user.id);
  
  // Delete related data first (due to foreign key constraints)
  await db.delete(usageStats).where(eq(usageStats.userId, userIds[0])); // This needs to be done per user
  await db.delete(downloads).where(eq(downloads.userId, userIds[0])); // This needs to be done per user
  await db.delete(userSubscriptions).where(eq(userSubscriptions.userId, userIds[0])); // This needs to be done per user
  
  // Delete users
  const deletedUsers = await db
    .delete(users)
    .where(eq(users.id, userIds[0])) // This needs to be done per user
    .returning();
  
  console.log(`✅ Removed ${deletedUsers.length} inactive users`);
}

async function cleanupTestData() {
  console.log("🧹 Cleaning up test data...");
  
  // Remove users with test emails
  const testEmails = [
    'test@example.com',
    'test@test.com',
    'admin@test.com',
    'user@test.com',
    'demo@example.com'
  ];
  
  let totalRemoved = 0;
  
  for (const email of testEmails) {
    const testUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (testUsers.length > 0) {
      const userId = testUsers[0].id;
      
      // Delete related data
      await db.delete(usageStats).where(eq(usageStats.userId, userId));
      await db.delete(downloads).where(eq(downloads.userId, userId));
      await db.delete(userSubscriptions).where(eq(userSubscriptions.userId, userId));
      
      // Delete user
      await db.delete(users).where(eq(users.id, userId));
      totalRemoved++;
    }
  }
  
  console.log(`✅ Removed ${totalRemoved} test users`);
}

async function resetTable(tableName: string) {
  console.log(`🧹 Resetting table: ${tableName}`);
  
  switch (tableName) {
    case 'sessions':
      await db.delete(sessions);
      console.log("✅ Sessions table reset");
      break;
    case 'usage_stats':
      await db.delete(usageStats);
      console.log("✅ Usage stats table reset");
      break;
    case 'downloads':
      await db.delete(downloads);
      console.log("✅ Downloads table reset");
      break;
    case 'user_subscriptions':
      await db.delete(userSubscriptions);
      console.log("✅ User subscriptions table reset");
      break;
    case 'users':
      // Delete related data first
      await db.delete(usageStats);
      await db.delete(downloads);
      await db.delete(userSubscriptions);
      await db.delete(users);
      console.log("✅ Users table reset (and related data)");
      break;
    default:
      console.log(`❌ Unknown table: ${tableName}`);
  }
}

async function completeReset() {
  console.log("🧹 Performing complete database reset...");
  
  // Delete all data in reverse dependency order
  await db.delete(usageStats);
  await db.delete(downloads);
  await db.delete(userSubscriptions);
  await db.delete(users);
  await db.delete(subscriptionPlans);
  await db.delete(sessions);
  
  console.log("✅ Complete database reset completed");
}

async function showDatabaseStats() {
  console.log("📊 Database Statistics:");
  
  const userCount = await db.select().from(users);
  const sessionCount = await db.select().from(sessions);
  const subscriptionCount = await db.select().from(userSubscriptions);
  const downloadCount = await db.select().from(downloads);
  const usageCount = await db.select().from(usageStats);
  const planCount = await db.select().from(subscriptionPlans);
  
  console.log(`👥 Users: ${userCount.length}`);
  console.log(`🔐 Sessions: ${sessionCount.length}`);
  console.log(`💳 Subscriptions: ${subscriptionCount.length}`);
  console.log(`📥 Downloads: ${downloadCount.length}`);
  console.log(`📈 Usage Stats: ${usageCount.length}`);
  console.log(`📋 Plans: ${planCount.length}`);
  
  // Show recent users
  const recentUsers = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
      isEmailVerified: users.isEmailVerified
    })
    .from(users)
    .orderBy(users.createdAt)
    .limit(10);
  
  console.log("\n👥 Recent Users:");
  recentUsers.forEach(user => {
    console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) - Created: ${user.createdAt.toISOString().split('T')[0]} - Verified: ${user.isEmailVerified}`);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
🔧 deskAI Database Cleanup Script

Usage: npm run cleanup <command> [options]

Commands:
  sessions              - Remove expired sessions
  inactive [days]       - Remove inactive users (default: 30 days)
  test                  - Remove test data
  reset <table>         - Reset specific table (sessions, users, downloads, etc.)
  reset-all             - Complete database reset
  stats                 - Show database statistics

Examples:
  npm run cleanup sessions
  npm run cleanup inactive 7
  npm run cleanup test
  npm run cleanup reset users
  npm run cleanup reset-all
  npm run cleanup stats
    `);
    return;
  }
  
  try {
    switch (command) {
      case 'sessions':
        await cleanupExpiredSessions();
        break;
      case 'inactive':
        const days = parseInt(args[1]) || 30;
        await cleanupInactiveUsers(days);
        break;
      case 'test':
        await cleanupTestData();
        break;
      case 'reset':
        const table = args[1];
        if (!table) {
          console.log("❌ Please specify a table name");
          return;
        }
        await resetTable(table);
        break;
      case 'reset-all':
        const confirm = args[1];
        if (confirm !== '--confirm') {
          console.log("⚠️  This will delete ALL data! Use 'npm run cleanup reset-all --confirm' to proceed");
          return;
        }
        await completeReset();
        break;
      case 'stats':
        await showDatabaseStats();
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
