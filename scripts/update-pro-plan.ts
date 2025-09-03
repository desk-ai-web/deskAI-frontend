import { config } from "dotenv";
import { db } from "../server/db";
import { subscriptionPlans } from "@shared/schema";
import { eq } from "drizzle-orm";

// Load environment variables
config();

async function updateProPlan() {
  console.log("Updating Pro plan with Stripe price ID...");

  // Replace this with your actual Stripe price ID
  const stripePriceId = "price_1Rz1YC4HVkGXB5qfvSP1z8ye"; // Your Pro plan price ID

  try {
    const result = await db
      .update(subscriptionPlans)
      .set({ stripePriceId })
      .where(eq(subscriptionPlans.name, "Pro"))
      .returning();

    if (result.length > 0) {
      console.log("✅ Pro plan updated successfully!");
      console.log("Updated plan:", result[0]);
    } else {
      console.log("❌ No Pro plan found to update");
    }
  } catch (error) {
    console.error("❌ Error updating Pro plan:", error);
  }
}

// Run the update
updateProPlan()
  .then(() => {
    console.log("Update completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Update failed:", error);
    process.exit(1);
  });
