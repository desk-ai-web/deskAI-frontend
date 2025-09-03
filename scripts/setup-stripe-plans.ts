import { config } from "dotenv";
import { db } from "../server/db";
import { subscriptionPlans } from "@shared/schema";

// Load environment variables
config();

async function setupStripePlans() {
  console.log("Setting up subscription plans...");

  try {
    // Check if plans already exist
    const existingPlans = await db.select().from(subscriptionPlans);
    
    if (existingPlans.length > 0) {
      console.log("Subscription plans already exist. Skipping setup.");
      return;
    }

    // Create Pro plan
    const proPlan = await db.insert(subscriptionPlans).values({
      name: "Pro",
      price: 299, // €2.99 in cents
      features: [
        "Everything in trial",
        "Unlimited usage",
        "Detailed analytics",
        "Custom reminder settings",
        "Priority support",
        "Export data"
      ],
      isActive: true,
      // Note: stripePriceId will need to be updated manually after creating the price in Stripe
    }).returning();

    // Create Team plan
    const teamPlan = await db.insert(subscriptionPlans).values({
      name: "Team",
      price: 999, // €9.99 in cents
      features: [
        "Everything in Pro",
        "Team dashboard",
        "Usage insights",
        "Admin controls",
        "Priority support",
        "Custom integrations"
      ],
      isActive: true,
      // Note: stripePriceId will need to be updated manually after creating the price in Stripe
    }).returning();

    console.log("✅ Subscription plans created successfully!");
    console.log("Pro Plan ID:", proPlan[0].id);
    console.log("Team Plan ID:", teamPlan[0].id);
    console.log("\n⚠️  IMPORTANT: You need to:");
    console.log("1. Create products and prices in your Stripe dashboard");
    console.log("2. Update the stripe_price_id fields in the database with the actual Stripe price IDs");
    console.log("3. Run the following SQL commands:");
    console.log(`
      UPDATE subscription_plans 
      SET stripe_price_id = 'price_your_pro_plan_price_id' 
      WHERE name = 'Pro';
      
      UPDATE subscription_plans 
      SET stripe_price_id = 'price_your_team_plan_price_id' 
      WHERE name = 'Team';
    `);

  } catch (error) {
    console.error("❌ Error setting up subscription plans:", error);
    process.exit(1);
  }
}

// Run the setup
setupStripePlans()
  .then(() => {
    console.log("Setup completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
