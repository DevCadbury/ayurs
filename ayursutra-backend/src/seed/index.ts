import dotenv from "dotenv";
import mongoose from "mongoose";
import seedScheduleData from "./schedule-seed";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    await seedScheduleData();

    console.log("✅ All seed data created successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
