const mongoose = require("mongoose");
require("dotenv").config();

// User schema (simplified)
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true, enum: ["patient", "doctor", "admin"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

async function createPatient() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ayursutra"
    );
    console.log("Connected to MongoDB");

    // Create the patient user
    const patient = new User({
      uid: "K7kYhnU3rbO7ybDetzlybSfHd5M2",
      name: "Demo Patient",
      email: "patient@demo.com",
      role: "patient",
    });

    await patient.save();
    console.log("Patient created successfully:", patient);

    // Close connection
    await mongoose.connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error creating patient:", error);
    process.exit(1);
  }
}

createPatient();

