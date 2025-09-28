// Approve or create an admin user by email
// Usage: node scripts/approve-admin.js "Admin Name" "admin@example.com"

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
    },
    specialty: { type: String },
    avatar: { type: String },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const User = model("User", UserSchema);

async function main() {
  const name = process.argv[2] || "Admin";
  const email = process.argv[3];
  if (!email) {
    console.error(
      'Provide email: node scripts/approve-admin.js "Name" "email@example.com"'
    );
    process.exit(1);
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }
  await mongoose.connect(uri);

  try {
    // Use email as uid fallback if missing
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        uid: `uid_${Buffer.from(email).toString("hex").slice(0, 24)}`,
        name,
        email,
        role: "admin",
        isApproved: true,
      });
      console.log("Created admin:", { id: user._id, email: user.email });
    } else {
      user.role = "admin";
      user.isApproved = true;
      await user.save();
      console.log("Updated admin:", { id: user._id, email: user.email });
    }
  } catch (e) {
    console.error("Failed to approve admin:", e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
