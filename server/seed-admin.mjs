import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_EMAIL = "sebasposada7@gmail.com";

async function seedAdmin() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  try {
    // Import schema dynamically
    const { users, profiles } = await import("../drizzle/schema.ts");

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);

    if (!user) {
      console.log(`Admin user with email ${ADMIN_EMAIL} not found yet.`);
      console.log("Admin will be set up automatically when they first sign up.");
      return;
    }

    // Update user role to admin
    await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));

    // Ensure profile exists and is approved
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);

    if (profile) {
      await db.update(profiles).set({ approved: true }).where(eq(profiles.userId, user.id));
    } else {
      await db.insert(profiles).values({
        userId: user.id,
        approved: true,
        displayName: user.name || "Admin",
      });
    }

    console.log(`✅ Admin user ${ADMIN_EMAIL} has been set up successfully!`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Role: admin`);
    console.log(`   Approved: true`);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedAdmin();
