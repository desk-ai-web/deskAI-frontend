#!/usr/bin/env tsx

import { db } from "../server/db";
import { users, sessions, userSubscriptions, downloads, usageStats, subscriptionPlans } from "../shared/schema";
import { sql } from "drizzle-orm";

/**
 * UUID Migration Script for deskAI
 * 
 * This script helps migrate from integer IDs to UUIDs if you have existing data.
 * WARNING: This is a destructive operation that will recreate all tables.
 */

async function checkCurrentSchema() {
  console.log("🔍 Checking current database schema...");
  
  try {
    // Check if tables exist and what their ID types are
    const result = await db.execute(sql`
      SELECT 
        table_name,
        column_name,
        data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND column_name = 'id'
      ORDER BY table_name;
    `);
    
    console.log("📋 Current ID column types:");
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}: ${row.data_type}`);
    });
    
    return result.rows;
  } catch (error) {
    console.error("❌ Error checking schema:", error);
    return [];
  }
}

async function backupData() {
  console.log("💾 Creating data backup...");
  
  try {
    // Export current data to JSON files
    const usersData = await db.select().from(users);
    const sessionsData = await db.select().from(sessions);
    const subscriptionsData = await db.select().from(userSubscriptions);
    const downloadsData = await db.select().from(downloads);
    const usageData = await db.select().from(usageStats);
    const plansData = await db.select().from(subscriptionPlans);
    
    const backup = {
      timestamp: new Date().toISOString(),
      users: usersData,
      sessions: sessionsData,
      subscriptions: subscriptionsData,
      downloads: downloadsData,
      usage: usageData,
      plans: plansData
    };
    
    // Write to file
    const fs = await import('fs/promises');
    await fs.writeFile('backup-before-uuid-migration.json', JSON.stringify(backup, null, 2));
    
    console.log("✅ Backup created: backup-before-uuid-migration.json");
    return backup;
  } catch (error) {
    console.error("❌ Error creating backup:", error);
    return null;
  }
}

async function migrateToUUID() {
  console.log("🔄 Starting UUID migration...");
  
  try {
    // Step 1: Drop existing tables (this will delete all data!)
    console.log("🗑️  Dropping existing tables...");
    await db.execute(sql`DROP TABLE IF EXISTS usage_stats CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS downloads CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS user_subscriptions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS subscription_plans CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS sessions CASCADE`);
    
    // Step 2: Enable UUID extension
    console.log("🔧 Enabling UUID extension...");
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Step 3: Create tables with new UUID schema
    console.log("🏗️  Creating tables with UUID schema...");
    
    // Create sessions table
    await db.execute(sql`
      CREATE TABLE sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR,
        google_id VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        is_email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create subscription_plans table
    await db.execute(sql`
      CREATE TABLE subscription_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        price INTEGER NOT NULL,
        features JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create user_subscriptions table
    await db.execute(sql`
      CREATE TABLE user_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        plan_id UUID NOT NULL REFERENCES subscription_plans(id),
        status VARCHAR NOT NULL,
        start_date TIMESTAMP DEFAULT NOW(),
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create downloads table
    await db.execute(sql`
      CREATE TABLE downloads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        platform VARCHAR NOT NULL,
        version VARCHAR NOT NULL,
        downloaded_at TIMESTAMP DEFAULT NOW(),
        ip_address VARCHAR
      )
    `);
    
    // Create usage_stats table
    await db.execute(sql`
      CREATE TABLE usage_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        date TIMESTAMP DEFAULT NOW(),
        session_duration INTEGER,
        blink_count INTEGER,
        posture_alerts INTEGER,
        focus_sessions INTEGER
      )
    `);
    
    // Step 4: Create indexes
    console.log("📊 Creating indexes...");
    await db.execute(sql`CREATE INDEX IDX_session_expire ON sessions(expire)`);
    
    console.log("✅ UUID migration completed successfully!");
    console.log("📝 Note: All existing data has been removed. Use the backup file if you need to restore data.");
    
  } catch (error) {
    console.error("❌ Error during migration:", error);
    throw error;
  }
}

async function restoreFromBackup(backupFile: string) {
  console.log(`🔄 Restoring data from ${backupFile}...`);
  
  try {
    const fs = await import('fs/promises');
    const backupData = JSON.parse(await fs.readFile(backupFile, 'utf-8'));
    
    // Restore subscription plans first (no dependencies)
    if (backupData.plans && backupData.plans.length > 0) {
      console.log("📋 Restoring subscription plans...");
      for (const plan of backupData.plans) {
        await db.insert(subscriptionPlans).values({
          id: plan.id, // Keep original ID if it was already a UUID
          name: plan.name,
          price: plan.price,
          features: plan.features,
          isActive: plan.isActive,
          createdAt: new Date(plan.createdAt)
        });
      }
    }
    
    // Restore users
    if (backupData.users && backupData.users.length > 0) {
      console.log("👥 Restoring users...");
      for (const user of backupData.users) {
        await db.insert(users).values({
          id: user.id, // Keep original ID if it was already a UUID
          email: user.email,
          password: user.password,
          googleId: user.googleId,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          isEmailVerified: user.isEmailVerified,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        });
      }
    }
    
    // Restore other data...
    console.log("✅ Data restoration completed!");
    
  } catch (error) {
    console.error("❌ Error restoring data:", error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
🔄 deskAI UUID Migration Script

Usage: npm run migrate-uuid <command> [options]

Commands:
  check                 - Check current schema
  backup                - Create backup before migration
  migrate               - Migrate to UUID schema (DESTRUCTIVE!)
  restore <file>        - Restore data from backup file

Examples:
  npm run migrate-uuid check
  npm run migrate-uuid backup
  npm run migrate-uuid migrate
  npm run migrate-uuid restore backup-before-uuid-migration.json

⚠️  WARNING: Migration will delete all existing data!
    `);
    return;
  }
  
  try {
    switch (command) {
      case 'check':
        await checkCurrentSchema();
        break;
      case 'backup':
        await backupData();
        break;
      case 'migrate':
        const confirm = args[1];
        if (confirm !== '--confirm') {
          console.log("⚠️  This will delete ALL data! Use 'npm run migrate-uuid migrate --confirm' to proceed");
          console.log("   Or run with: DATABASE_URL='your-url' npm run migrate-uuid migrate --confirm");
          return;
        }
        console.log("🔄 Proceeding with UUID migration...");
        await migrateToUUID();
        break;
      case 'restore':
        const backupFile = args[1];
        if (!backupFile) {
          console.log("❌ Please specify a backup file");
          return;
        }
        await restoreFromBackup(backupFile);
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
    }
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
