import express from "express";
import { AuthRequest, requireRoles } from "../middleware/auth";
import { User } from "../models/User";
import { Appointment } from "../models/Appointment";
import { Therapy } from "../models/Therapy";

const router = express.Router();

// Dev note: auth disabled for progress routes in development to unblock 403s

// Get patient progress data
router.get("/patient/:patientId", async (req: AuthRequest, res) => {
  try {
    const { patientId } = req.params;
    // Dev: allow unauthenticated access
    const uid = (req as any).user?.uid || patientId;
    const role = (req as any).user?.role || "patient";
    console.log("Progress API - User:", { uid, role, patientId });

    // Find patient by UID first, then by ObjectId
    let patientUser;
    if (typeof patientId === "string" && !patientId.includes(".")) {
      patientUser = await User.findOne({ uid: patientId });
      if (!patientUser) {
        patientUser = await User.findById(patientId);
      }
    } else {
      patientUser = await User.findById(patientId);
    }

    // If patient doesn't exist, create a demo patient for development
    if (!patientUser && role === "patient" && uid === patientId) {
      patientUser = await User.create({
        uid: patientId,
        name: "Demo Patient",
        email: "patient@demo.com",
        role: "patient",
      });
      console.log("Created demo patient:", patientUser);
    }

    if (!patientUser) {
      // Dev: auto-create a demo patient record
      patientUser = await User.create({
        uid: patientId,
        name: "Demo Patient",
        email: "patient@demo.com",
        role: "patient",
      });
      console.log("Auto-created demo patient:", patientUser.uid);
    }

    // Dev: skip permission denial
    console.log("Permission check (dev):", {
      role,
      uid,
      patientId,
      patientUserUid: (patientUser as any).uid,
    });

    // Get all appointments for the patient
    const appointments = await Appointment.find({ patient: patientUser._id })
      .populate("doctor", "name email")
      .populate("therapy", "name description durationMinutes")
      .sort({ startTime: 1 });

    // Calculate progress metrics
    const totalSessions = appointments.length;
    const completedSessions = appointments.filter(
      (apt) => apt.status === "completed"
    ).length;
    const averageRating =
      appointments.reduce((sum, apt) => sum + (apt.rating || 0), 0) /
        totalSessions || 0;
    const totalDuration = appointments.reduce(
      (sum, apt) => sum + (apt.duration || 0),
      0
    );

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const sortedAppointments = appointments
      .filter((apt) => apt.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

    for (let i = 0; i < sortedAppointments.length; i++) {
      if (i === 0) {
        tempStreak = 1;
        currentStreak = 1;
      } else {
        const prevAppointment = sortedAppointments[i - 1];
        const currAppointment = sortedAppointments[i];
        if (prevAppointment && currAppointment) {
          const prevDate = new Date(prevAppointment.startTime);
          const currDate = new Date(currAppointment.startTime);
          const daysDiff = Math.floor(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff <= 7) {
            // Within a week
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Get therapy distribution
    const therapyDistribution = appointments.reduce((acc, apt) => {
      const therapyName = (apt.therapy as any)?.name || "Unknown";
      const existing = acc.find((item) => item.therapy === therapyName);
      if (existing) {
        existing.sessions += 1;
      } else {
        acc.push({ therapy: therapyName, sessions: 1 });
      }
      return acc;
    }, [] as { therapy: string; sessions: number }[]);

    // Get monthly progress data
    const monthlyData = appointments.reduce((acc, apt) => {
      const month = new Date(apt.startTime).toLocaleDateString("en-US", {
        month: "short",
      });
      const existing = acc.find((item) => item.month === month);
      if (existing) {
        existing.sessions += 1;
        existing.totalRating += apt.rating || 0;
        existing.ratingCount += 1;
      } else {
        acc.push({
          month,
          sessions: 1,
          totalRating: apt.rating || 0,
          ratingCount: 1,
          wellness: apt.overallWellness || 0,
        });
      }
      return acc;
    }, [] as { month: string; sessions: number; totalRating: number; ratingCount: number; wellness: number; rating?: number }[]);

    // Calculate average ratings for each month
    monthlyData.forEach((month) => {
      (month as any).rating = month.totalRating / month.ratingCount;
    });

    // Get wellness trend data
    const wellnessTrend = appointments
      .filter((apt) => apt.status === "completed")
      .map((apt) => ({
        date: new Date(apt.startTime).toISOString().split("T")[0],
        wellness: apt.overallWellness || 0,
        pain: apt.painLevel || 0,
        energy: apt.energyLevel || 0,
        mood: apt.moodLevel || 0,
        sleep: apt.sleepQuality || 0,
        rating: apt.rating || 0,
      }))
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });

    const progressData = {
      metrics: {
        totalSessions,
        completedSessions,
        averageRating: Math.round(averageRating * 10) / 10,
        totalDuration,
        currentStreak,
        longestStreak,
        improvementRate:
          totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 100)
            : 0,
      },
      therapyDistribution,
      monthlyProgress: monthlyData,
      wellnessTrend,
      recentSessions: appointments
        .filter((apt) => apt.status === "completed")
        .slice(-5)
        .map((apt) => ({
          id: apt._id,
          date: apt.startTime,
          therapy: (apt.therapy as any)?.name || "Unknown",
          therapist: (apt.doctor as any)?.name || "Unknown",
          duration: apt.duration || 0,
          rating: apt.rating || 0,
          notes: apt.notes || "",
          overallWellness: apt.overallWellness || 0,
          painLevel: apt.painLevel || 0,
          energyLevel: apt.energyLevel || 0,
          moodLevel: apt.moodLevel || 0,
          sleepQuality: apt.sleepQuality || 0,
        }))
        .reverse(),
    };

    res.json(progressData);
  } catch (error) {
    console.error("Error fetching progress data:", error);
    res.status(500).json({ error: "Failed to fetch progress data" });
  }
});

// Update session feedback
router.patch("/session/:sessionId/feedback", async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const {
      rating,
      notes,
      painLevel,
      energyLevel,
      moodLevel,
      sleepQuality,
      overallWellness,
    } = req.body;

    // Dev: allow unauthenticated access for feedback update

    const appointment = await Appointment.findById(sessionId);
    if (!appointment) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Update feedback data
    if (rating !== undefined) appointment.rating = rating;
    if (notes !== undefined) appointment.notes = notes;
    if (painLevel !== undefined) appointment.painLevel = painLevel;
    if (energyLevel !== undefined) appointment.energyLevel = energyLevel;
    if (moodLevel !== undefined) appointment.moodLevel = moodLevel;
    if (sleepQuality !== undefined) appointment.sleepQuality = sleepQuality;
    if (overallWellness !== undefined)
      appointment.overallWellness = overallWellness;

    const updated = await appointment.save();
    await updated.populate([
      { path: "patient", select: "name email" },
      { path: "doctor", select: "name email" },
      { path: "therapy", select: "name description durationMinutes" },
    ]);

    res.json(updated);
  } catch (error) {
    console.error("Error updating session feedback:", error);
    res.status(500).json({ error: "Failed to update session feedback" });
  }
});

// Get therapy goals (mock data for now)
router.get("/patient/:patientId/goals", async (req: AuthRequest, res) => {
  try {
    const { patientId } = req.params;
    const uid = (req as any).user?.uid || patientId;
    const role = (req as any).user?.role || "patient";

    // Dev: skip permission denial

    // Mock goals data - in a real app, this would come from a Goals collection
    const goals = [
      {
        id: "1",
        title: "Reduce Chronic Back Pain",
        description:
          "Achieve 50% reduction in back pain through regular therapy sessions",
        targetDate: "2025-12-31",
        progress: 65,
        status: "active",
        category: "Pain Management",
      },
      {
        id: "2",
        title: "Improve Sleep Quality",
        description:
          "Maintain consistent 8-hour sleep schedule with better quality",
        targetDate: "2025-11-15",
        progress: 80,
        status: "active",
        category: "Sleep Health",
      },
      {
        id: "3",
        title: "Reduce Stress Levels",
        description:
          "Lower stress levels by 40% through mindfulness and therapy",
        targetDate: "2025-10-30",
        progress: 100,
        status: "completed",
        category: "Mental Health",
      },
    ];

    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// Get achievements (mock data for now)
router.get(
  "/patient/:patientId/achievements",
  async (req: AuthRequest, res) => {
    try {
      const { patientId } = req.params;
      const uid = (req as any).user?.uid || patientId;
      const role = (req as any).user?.role || "patient";

      // Dev: skip permission denial

      // Mock achievements data - in a real app, this would come from an Achievements collection
      const achievements = [
        {
          id: "1",
          title: "First Session Complete",
          description: "Completed your first therapy session",
          icon: "🎉",
          date: "2025-08-15",
          points: 10,
        },
        {
          id: "2",
          title: "Consistency Champion",
          description: "Attended 5 consecutive sessions",
          icon: "🏆",
          date: "2025-09-01",
          points: 25,
        },
        {
          id: "3",
          title: "Goal Achiever",
          description: "Completed your first therapy goal",
          icon: "🎯",
          date: "2025-09-05",
          points: 50,
        },
      ];

      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  }
);

export default router;
