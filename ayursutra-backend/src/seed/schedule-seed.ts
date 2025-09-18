import { User } from "../models/User";
import { Therapy } from "../models/Therapy";
import { Appointment } from "../models/Appointment";
import mongoose from "mongoose";

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Therapy.deleteMany({});
    await Appointment.deleteMany({});

    // Create sample users
    const patients = await User.create([
      {
        uid: "patient1",
        name: "John Doe",
        email: "john.doe@example.com",
        role: "patient",
      },
      {
        uid: "patient2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "patient",
      },
    ]);

    const doctors = await User.create([
      {
        uid: "doctor1",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@ayursutra.com",
        role: "doctor",
      },
      {
        uid: "doctor2",
        name: "Dr. Michael Chen",
        email: "michael.chen@ayursutra.com",
        role: "doctor",
      },
      {
        uid: "doctor3",
        name: "Dr. Priya Sharma",
        email: "priya.sharma@ayursutra.com",
        role: "doctor",
      },
    ]);

    const admin = await User.create({
      uid: "admin1",
      name: "Admin User",
      email: "admin@ayursutra.com",
      role: "admin",
    });

    // Create sample therapies
    const therapies = await Therapy.create([
      {
        name: "Abhyanga (Oil Massage)",
        description:
          "Traditional Ayurvedic full-body oil massage for relaxation and detoxification",
        durationMinutes: 60,
      },
      {
        name: "Shirodhara",
        description:
          "Continuous oil flow on forehead treatment for mental clarity and stress relief",
        durationMinutes: 90,
      },
      {
        name: "Follow-up Consultation",
        description: "Progress review and therapy adjustment session",
        durationMinutes: 60,
      },
      {
        name: "Basti (Enema Therapy)",
        description: "Medicated enema for detoxification and digestive health",
        durationMinutes: 45,
      },
      {
        name: "Nasya (Nasal Therapy)",
        description: "Medicated oil drops for sinus and respiratory health",
        durationMinutes: 30,
      },
    ]);

    // Create sample appointments
    if (
      patients.length === 0 ||
      doctors.length === 0 ||
      therapies.length === 0
    ) {
      console.log("❌ Cannot create appointments: missing users or therapies");
      return;
    }

    const now = new Date();
    const appointments = await Appointment.create([
      {
        patient: patients[0]!._id,
        doctor: doctors[0]!._id,
        therapy: therapies[0]!._id,
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
        status: "scheduled",
        notes: "Please arrive 15 minutes early",
      },
      {
        patient: patients[0]!._id,
        doctor: doctors[1]!._id,
        therapy: therapies[1]!._id,
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        endTime: new Date(
          now.getTime() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000
        ), // Day after tomorrow + 1.5 hours
        status: "scheduled",
      },
      {
        patient: patients[0]!._id,
        doctor: doctors[2]!._id,
        therapy: therapies[2]!._id,
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        endTime: new Date(
          now.getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
        ), // 5 days from now + 1 hour
        status: "scheduled",
      },
      {
        patient: patients[1]!._id,
        doctor: doctors[0]!._id,
        therapy: therapies[0]!._id,
        startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday (completed)
        endTime: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Yesterday + 1 hour
        status: "completed",
      },
    ]);

    console.log("✅ Seed data created successfully!");
    console.log(
      `👥 Created ${patients.length} patients, ${doctors.length} doctors, 1 admin`
    );
    console.log(`🏥 Created ${therapies.length} therapies`);
    console.log(`📅 Created ${appointments.length} appointments`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
};

export default seedData;
