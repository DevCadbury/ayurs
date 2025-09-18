const mongoose = require("mongoose");
require("dotenv").config();

// Import models using ts-node
const { User } = require("./dist/models/User");

const addMorePatients = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Generate more fake patients
    const fakePatients = [
      {
        uid: "patient_fake_1",
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        role: "patient",
      },
      {
        uid: "patient_fake_2",
        name: "Bob Wilson",
        email: "bob.wilson@example.com",
        role: "patient",
      },
      {
        uid: "patient_fake_3",
        name: "Carol Davis",
        email: "carol.davis@example.com",
        role: "patient",
      },
      {
        uid: "patient_fake_4",
        name: "David Brown",
        email: "david.brown@example.com",
        role: "patient",
      },
      {
        uid: "patient_fake_5",
        name: "Emma Garcia",
        email: "emma.garcia@example.com",
        role: "patient",
      },
    ];

    // Create patients
    console.log("Creating more fake patients...");
    const createdPatients = await User.insertMany(fakePatients);
    console.log(`✅ Created ${createdPatients.length} patients`);

    console.log("\n🎉 Additional patients created successfully!");
    console.log("\n📋 Summary:");
    console.log(`👥 Patients: ${createdPatients.length}`);

    console.log("\n👥 Created Patients:");
    createdPatients.forEach((patient) => {
      console.log(`  - ${patient.name} (${patient.email})`);
    });
  } catch (error) {
    console.error("❌ Error creating patients:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
};

// Run the script
addMorePatients();

