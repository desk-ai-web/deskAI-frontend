import { config } from "dotenv";
import { db } from "../server/db";
import { subscriptionPlans } from "@shared/schema";
import { eq } from "drizzle-orm";

// Load environment variables
config();

async function deactivateTeamPlan() {
  console.log("Deactivating Team plan...");

  try {
    const result = await db
      .update(subscriptionPlans)
      .set({ isActive: false })
      .where(eq(subscriptionPlans.name, "Team"))
      .returning();

    if (result.length > 0) {
      console.log("✅ Team plan deactivated successfully!");
      console.log("Updated plan:", result[0]);
    } else {
      console.log("❌ No Team plan found to deactivate");
    }
  } catch (error) {
    console.error("❌ Error deactivating Team plan:", error);
  }
}

// Run the deactivation
deactivateTeamPlan()
  .then(() => {
    console.log("Deactivation completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deactivation failed:", error);
    process.exit(1);
  });
