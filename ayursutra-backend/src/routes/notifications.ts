import express from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Appointment } from "../models/Appointment";

const router = express.Router();

router.get("/patient/:patientId", async (req: AuthRequest, res) => {
  try {
    const { patientId } = req.params;
    // Allow UID fallback in dev
    let patientUser = await User.findOne({ uid: patientId });
    if (!patientUser) patientUser = await User.findById(patientId);
    if (!patientUser) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const now = new Date();
    const appointments = await Appointment.find({ patient: patientUser._id })
      .populate("doctor", "name")
      .populate("therapy", "name durationMinutes")
      .sort({ startTime: 1 });

    const pre: any[] = [];
    const post: any[] = [];

    appointments.forEach((apt) => {
      const start = new Date(apt.startTime);
      const isFuture = start.getTime() > now.getTime();
      const therapyName = (apt as any).therapy?.name || "Therapy";
      const duration = (apt as any).therapy?.durationMinutes || 60;
      const therapist = (apt as any).doctor?.name || "Therapist";

      if (isFuture) {
        pre.push(
          {
            type: "reminder",
            title: "Appointment Reminder",
            message: `You have ${therapyName} on ${start.toLocaleString()}. Therapist: ${therapist}, Duration: ${duration} mins.`,
          },
          {
            type: "preparation",
            title: "Preparation Instructions",
            message:
              "Have a light meal 2 hours before. Avoid caffeine/alcohol. Wear loose clothing and carry a towel.",
          },
          {
            type: "lifestyle",
            title: "Lifestyle Reminder",
            message:
              "Sleep early and avoid heavy exercise before your session.",
          },
          {
            type: "travel",
            title: "Travel / Check-in",
            message:
              "Arrive 15 mins early for registration. Parking available near entrance.",
          }
        );
      } else if (apt.status === "completed") {
        post.push(
          {
            type: "care",
            title: "Immediate Care",
            message:
              "Rest 2–3 hours, hydrate with warm water, avoid cold drinks.",
          },
          {
            type: "diet",
            title: "Dietary Advice",
            message: "Eat light food and avoid oily/spicy items for 24 hours.",
          },
          {
            type: "followup",
            title: "Follow-Up Reminder",
            message: "Schedule your next session and update your progress.",
          },
          {
            type: "wellness",
            title: "Wellness Tips",
            message:
              "Try gentle yoga, breathing, or meditation if recommended.",
          },
          {
            type: "feedback",
            title: "Share Feedback",
            message: `How was your ${therapyName} session? Share feedback to help us improve.`,
          }
        );
      }
    });

    res.json({ pre, post });
  } catch (error) {
    console.error("Error building notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

export default router;
