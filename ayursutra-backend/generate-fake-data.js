const mongoose = require("mongoose");
require("dotenv").config();

// Import models using ts-node
const { User } = require("./dist/models/User");
const { Therapy } = require("./dist/models/Therapy");

const generateFakeData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Generate fake doctors with unique UIDs
    const fakeDoctors = [
      {
        uid: "doc_fake_6",
        name: "Dr. Rajesh Kumar",
        email: "rajesh.kumar@ayursutra.com",
        role: "doctor",
        specialty: "Panchakarma Specialist",
        avatar: "/avatars/doctor1.jpg",
      },
      {
        uid: "doc_fake_7",
        name: "Dr. Priya Patel",
        email: "priya.patel@ayursutra.com",
        role: "doctor",
        specialty: "Herbal Medicine Expert",
        avatar: "/avatars/doctor2.jpg",
      },
      {
        uid: "doc_fake_8",
        name: "Dr. Amit Singh",
        email: "amit.singh@ayursutra.com",
        role: "doctor",
        specialty: "Yoga Therapy Specialist",
        avatar: "/avatars/doctor3.jpg",
      },
      {
        uid: "doc_fake_9",
        name: "Dr. Sunita Reddy",
        email: "sunita.reddy@ayursutra.com",
        role: "doctor",
        specialty: "Shirodhara Expert",
        avatar: "/avatars/doctor4.jpg",
      },
      {
        uid: "doc_fake_10",
        name: "Dr. Vikram Sharma",
        email: "vikram.sharma@ayursutra.com",
        role: "doctor",
        specialty: "Basti Therapy Specialist",
        avatar: "/avatars/doctor5.jpg",
      },
    ];

    // Generate fake therapies
    const fakeTherapies = [
      {
        name: "Abhyanga (Full Body Oil Massage)",
        description:
          "Traditional Ayurvedic full-body oil massage using medicated oils to promote relaxation and detoxification",
        durationMinutes: 60,
        category: "Panchakarma",
        benefits: [
          "Stress relief",
          "Improved circulation",
          "Detoxification",
          "Better sleep",
        ],
      },
      {
        name: "Shirodhara",
        description:
          "Continuous flow of warm medicated oil on the forehead to calm the mind and nervous system",
        durationMinutes: 45,
        category: "Panchakarma",
        benefits: [
          "Mental relaxation",
          "Improved focus",
          "Better sleep",
          "Stress reduction",
        ],
      },
      {
        name: "Basti (Enema Therapy)",
        description:
          "Medicated enema therapy for deep cleansing and detoxification of the colon",
        durationMinutes: 30,
        category: "Panchakarma",
        benefits: [
          "Colon cleansing",
          "Improved digestion",
          "Detoxification",
          "Better absorption",
        ],
      },
      {
        name: "Nasya (Nasal Therapy)",
        description:
          "Medicated oil or herbal preparations administered through the nasal passages",
        durationMinutes: 20,
        category: "Panchakarma",
        benefits: [
          "Sinus relief",
          "Improved breathing",
          "Mental clarity",
          "Headache relief",
        ],
      },
      {
        name: "Virechana (Purgation Therapy)",
        description:
          "Therapeutic purgation to eliminate toxins and balance Pitta dosha",
        durationMinutes: 90,
        category: "Panchakarma",
        benefits: [
          "Liver cleansing",
          "Improved digestion",
          "Skin health",
          "Pitta balance",
        ],
      },
      {
        name: "Udvartana (Herbal Powder Massage)",
        description:
          "Dry massage using herbal powders to improve circulation and reduce cellulite",
        durationMinutes: 45,
        category: "Body Therapy",
        benefits: [
          "Improved circulation",
          "Cellulite reduction",
          "Skin toning",
          "Weight management",
        ],
      },
      {
        name: "Pizhichil (Oil Bath)",
        description:
          "Continuous pouring of warm medicated oil over the body while lying on a wooden table",
        durationMinutes: 75,
        category: "Panchakarma",
        benefits: [
          "Deep relaxation",
          "Joint mobility",
          "Muscle relaxation",
          "Nervous system balance",
        ],
      },
      {
        name: "Kizhi (Herbal Bundle Massage)",
        description:
          "Massage using warm herbal bundles to provide deep tissue therapy",
        durationMinutes: 50,
        category: "Body Therapy",
        benefits: [
          "Pain relief",
          "Improved flexibility",
          "Muscle relaxation",
          "Joint mobility",
        ],
      },
      {
        name: "Marma Therapy",
        description:
          "Gentle pressure on vital energy points to restore balance and promote healing",
        durationMinutes: 40,
        category: "Energy Therapy",
        benefits: [
          "Energy balance",
          "Pain relief",
          "Stress reduction",
          "Improved vitality",
        ],
      },
      {
        name: "Ayurvedic Consultation",
        description:
          "Comprehensive health assessment and personalized treatment plan development",
        durationMinutes: 60,
        category: "Consultation",
        benefits: [
          "Health assessment",
          "Personalized treatment",
          "Lifestyle guidance",
          "Preventive care",
        ],
      },
    ];

    // Create doctors
    console.log("Creating fake doctors...");
    const createdDoctors = await User.insertMany(fakeDoctors);
    console.log(`✅ Created ${createdDoctors.length} doctors`);

    // Create therapies
    console.log("Creating fake therapies...");
    const createdTherapies = await Therapy.insertMany(fakeTherapies);
    console.log(`✅ Created ${createdTherapies.length} therapies`);

    console.log("\n🎉 Fake data generation completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`👨‍⚕️ Doctors: ${createdDoctors.length}`);
    console.log(`🏥 Therapies: ${createdTherapies.length}`);

    console.log("\n👨‍⚕️ Created Doctors:");
    createdDoctors.forEach((doctor) => {
      console.log(`  - ${doctor.name} (${doctor.specialty})`);
    });

    console.log("\n🏥 Created Therapies:");
    createdTherapies.forEach((therapy) => {
      console.log(`  - ${therapy.name} (${therapy.durationMinutes} min)`);
    });
  } catch (error) {
    console.error("❌ Error generating fake data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
};

// Run the script
generateFakeData();
