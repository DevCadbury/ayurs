import { Router } from "express";
import { Appointment } from "../models/Appointment";
import { User } from "../models/User";
import { Therapy } from "../models/Therapy";
import { verifyAppJwt, requireRoles, AuthRequest } from "../middleware/auth";
import { emitRealtime } from "../realtime/events";
import {
  buildPreEmail,
  buildPostEmail,
  buildFeedbackEmail,
  sendMail,
} from "../utils/mailer";

const router = Router();
router.use(verifyAppJwt);

// Get all appointments (admin/doctor only)
router.get("/", requireRoles(["admin", "doctor"]), async (_req, res) => {
  try {
    const list = await Appointment.find()
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .populate("therapy", "name description durationMinutes")
      .sort({ startTime: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Get patient's own appointments
router.get(
  "/patient/:patientId",
  requireRoles(["patient", "admin", "doctor"]),
  async (req: AuthRequest, res) => {
    try {
      const { patientId } = req.params;
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const { uid, role } = req.user;

      // Patients can only see their own appointments
      if (role === "patient" && uid !== patientId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Find the user by UID to get their ObjectId
      const user = await User.findOne({ uid: patientId });
      if (!user) {
        return res.status(404).json({ error: "Patient not found" });
      }

      const appointments = await Appointment.find({ patient: user._id })
        .populate("patient", "name email")
        .populate("doctor", "name email specialty avatar")
        .populate("therapy", "name description durationMinutes")
        .sort({ startTime: 1 });

      res.json(appointments);
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      res.status(500).json({ error: "Failed to fetch patient appointments" });
    }
  }
);

// Get doctor's appointments
router.get(
  "/doctor/:doctorId",
  requireRoles(["doctor", "admin"]),
  async (req: AuthRequest, res) => {
    try {
      const { doctorId } = req.params;
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const { uid, role } = req.user;

      // Doctors can only see their own appointments unless they're admin
      if (role === "doctor" && uid !== doctorId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const appointments = await Appointment.find({ doctor: doctorId })
        .populate("patient", "name email")
        .populate("doctor", "name email")
        .populate("therapy", "name description durationMinutes")
        .sort({ startTime: 1 });

      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doctor appointments" });
    }
  }
);

// Get member's sessions (admin only) - supports both patients and doctors
router.get(
  "/member/:memberId",
  requireRoles(["admin"]),
  async (req: AuthRequest, res) => {
    try {
      const { memberId } = req.params;
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Find the user by UID first, then by ObjectId
      let memberUser;
      if (typeof memberId === "string" && !memberId.includes(".")) {
        // This looks like a UID (Firebase UID or simple UID)
        memberUser = await User.findOne({ uid: memberId });
        if (!memberUser) {
          // Try as ObjectId if UID lookup failed
          memberUser = await User.findById(memberId);
        }
      } else {
        // This looks like an ObjectId
        memberUser = await User.findById(memberId);
      }

      if (!memberUser) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Get all appointments where the member is either patient or doctor
      const appointments = await Appointment.find({
        $or: [
          { patient: memberUser._id },
          { doctor: memberUser._id }
        ]
      })
        .populate("patient", "name email uid")
        .populate("doctor", "name email uid")
        .populate("therapy", "name description durationMinutes venueAddress")
        .sort({ startTime: -1 }); // Most recent first

      res.json(appointments);
    } catch (error) {
      console.error("Error fetching member sessions:", error);
      res.status(500).json({ error: "Failed to fetch member sessions" });
    }
  }
);

// Create new appointment
router.post(
  "/",
  requireRoles(["admin", "doctor", "patient"]),
  async (req: AuthRequest, res) => {
    try {
      const { patient, doctor, therapy, startTime, endTime, notes } = req.body;
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const { uid, role } = req.user;

      // Validate required fields
      if (!patient || !doctor || !therapy || !startTime || !endTime) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Patients can only book appointments for themselves
      if (role === "patient" && uid !== patient) {
        return res
          .status(403)
          .json({ error: "Can only book appointments for yourself" });
      }

      // Find users and therapy by their IDs (could be ObjectId or UID)
      let patientUser, doctorUser, therapyDoc;

      // Try to find patient by UID first, then by ObjectId
      if (typeof patient === "string" && !patient.includes(".")) {
        // This looks like a UID (Firebase UID or simple UID)
        patientUser = await User.findOne({ uid: patient });
        if (!patientUser) {
          // Try as ObjectId if UID lookup failed
          patientUser = await User.findById(patient);
        }
      } else {
        // This looks like an ObjectId
        patientUser = await User.findById(patient);
      }

      // Try to find doctor by UID first, then by ObjectId
      if (typeof doctor === "string" && !doctor.includes(".")) {
        // This looks like a UID (Firebase UID or simple UID)
        doctorUser = await User.findOne({ uid: doctor });
        if (!doctorUser) {
          // Try as ObjectId if UID lookup failed
          doctorUser = await User.findById(doctor);
        }
      } else {
        // This looks like an ObjectId
        doctorUser = await User.findById(doctor);
      }

      // Try to find therapy by ObjectId
      therapyDoc = await Therapy.findById(therapy);

      if (!patientUser || !doctorUser || !therapyDoc) {
        return res
          .status(400)
          .json({ error: "Invalid patient, doctor, or therapy" });
      }

      // Check for scheduling conflicts
      const conflictingAppointment = await Appointment.findOne({
        $or: [
          {
            doctor: doctorUser._id,
            startTime: { $lt: new Date(endTime) },
            endTime: { $gt: new Date(startTime) },
          },
          {
            patient: patientUser._id,
            startTime: { $lt: new Date(endTime) },
            endTime: { $gt: new Date(startTime) },
          },
        ],
        status: { $ne: "cancelled" },
      });

      if (conflictingAppointment) {
        return res.status(400).json({ error: "Scheduling conflict detected" });
      }

      const appointment = new Appointment({
        patient: patientUser._id,
        doctor: doctorUser._id,
        therapy: therapyDoc._id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
        status: "scheduled",
      });

      const created = await appointment.save();
      await created.populate([
        { path: "patient", select: "name email" },
        { path: "doctor", select: "name email" },
        { path: "therapy", select: "name description durationMinutes" },
      ]);
      emitRealtime({
        type: "appointment.created",
        payload: {
          id: String(created._id),
          status: created.status,
          patient: created.patient,
          doctor: created.doctor,
          therapy: created.therapy,
        },
      });
      // Fire pre-session email to patient (best-effort)
      try {
        const to = (created.patient as any)?.email as string | undefined;
        if (to) {
          const payload = buildPreEmail({
            patientName: (created.patient as any)?.name,
            therapyName: (created.therapy as any)?.name,
            therapistName: (created.doctor as any)?.name,
            startTimeISO: created.startTime.toISOString(),
            durationMinutes: (created.therapy as any)?.durationMinutes,
          });
          await sendMail({ to, ...payload });
        }
      } catch {}
      res.status(201).json(created);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Failed to create appointment" });
    }
  }
);

// Update appointment status
router.patch(
  "/:id/status",
  requireRoles(["admin", "doctor", "patient"]),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const { uid, role } = req.user;

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Disallow changing status of a cancelled appointment back to another status
      if (appointment.status === "cancelled" && status !== "cancelled") {
        return res.status(400).json({
          error: "Cancelled sessions cannot be marked to another status",
        });
      }

      // Check permissions - need to find users by UID first
      let isPatient = false,
        isDoctor = false,
        isAdmin = false;

      if (role === "patient") {
        const patientUser = await User.findOne({ uid });
        isPatient = !!(
          patientUser &&
          appointment.patient.toString() === (patientUser._id as any).toString()
        );
      }

      if (role === "doctor") {
        const doctorUser = await User.findOne({ uid });
        isDoctor = !!(
          doctorUser &&
          appointment.doctor.toString() === (doctorUser._id as any).toString()
        );
      }

      isAdmin = role === "admin";

      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Patients can only cancel their own appointments
      if (isPatient && status !== "cancelled") {
        return res
          .status(403)
          .json({ error: "Patients can only cancel appointments" });
      }

      appointment.status = status;
      const updated = await appointment.save();
      await updated.populate([
        { path: "patient", select: "name email" },
        { path: "doctor", select: "name email" },
        { path: "therapy", select: "name description durationMinutes" },
      ]);
      // If completed, send post-session and feedback emails (best-effort)
      try {
        if (updated.status === "completed") {
          const to = (updated.patient as any)?.email as string | undefined;
          if (to) {
            const payload = buildPostEmail({
              patientName: (updated.patient as any)?.name,
              therapyName: (updated.therapy as any)?.name,
            });
            await sendMail({ to, ...payload });

            const webBase = process.env.WEB_BASE_URL || "http://localhost:3001";
            const fbLink = `${webBase}/dashboard/patient/feedback?appointment=${String(
              updated._id
            )}`;
            const feedback = buildFeedbackEmail({
              patientName: (updated.patient as any)?.name,
              doctorName: (updated.doctor as any)?.name,
              feedbackLink: fbLink,
            });
            await sendMail({ to, ...feedback });
          }
        }
      } catch {}
      emitRealtime({
        type: "appointment.updated",
        payload: {
          id: String(updated._id),
          status: updated.status,
          patient: updated.patient,
          doctor: updated.doctor,
        },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update appointment status" });
    }
  }
);

// Update appointment details
router.patch(
  "/:id",
  requireRoles(["admin", "doctor"]),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const { uid, role } = req.user;
      const updateData = req.body;

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Doctors can only update their own appointments unless they're admin
      if (role === "doctor" && appointment.doctor.toString() !== uid) {
        return res
          .status(403)
          .json({ error: "Can only update your own appointments" });
      }

      // If updating time, check for conflicts
      if (updateData.startTime || updateData.endTime) {
        const startTime = updateData.startTime
          ? new Date(updateData.startTime)
          : appointment.startTime;
        const endTime = updateData.endTime
          ? new Date(updateData.endTime)
          : appointment.endTime;

        const conflictingAppointment = await Appointment.findOne({
          _id: { $ne: id },
          $or: [
            {
              doctor: appointment.doctor,
              startTime: { $lt: endTime },
              endTime: { $gt: startTime },
            },
            {
              patient: appointment.patient,
              startTime: { $lt: endTime },
              endTime: { $gt: startTime },
            },
          ],
          status: { $ne: "cancelled" },
        });

        if (conflictingAppointment) {
          return res
            .status(400)
            .json({ error: "Scheduling conflict detected" });
        }
      }

      const updated = await Appointment.findByIdAndUpdate(id, updateData, {
        new: true,
      })
        .populate("patient", "name email")
        .populate("doctor", "name email")
        .populate("therapy", "name description durationMinutes");

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update appointment" });
    }
  }
);

// Delete appointment
router.delete(
  "/:id",
  requireRoles(["admin", "doctor"]),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const { uid, role } = req.user;

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Doctors can only delete their own appointments unless they're admin
      if (role === "doctor" && appointment.doctor.toString() !== uid) {
        return res
          .status(403)
          .json({ error: "Can only delete your own appointments" });
      }

      await Appointment.findByIdAndDelete(id);
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  }
);

// Get available time slots for a doctor on a specific date
router.get(
  "/availability/:doctorId/:date",
  requireRoles(["admin", "doctor", "patient"]),
  async (req: AuthRequest, res) => {
    try {
      const { doctorId, date } = req.params;

      // Validate required parameters
      if (!doctorId || !date) {
        return res
          .status(400)
          .json({ error: "Doctor ID and date are required" });
      }

      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      // Get existing appointments for the doctor on this date
      const existingAppointments = await Appointment.find({
        doctor: doctorId,
        startTime: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: "cancelled" },
      }).sort({ startTime: 1 });

      // Generate available time slots (9 AM to 6 PM, 1-hour slots)
      const availableSlots: Array<{
        startTime: string;
        endTime: string;
        displayTime: string;
      }> = [];
      const startHour = 9;
      const endHour = 18;

      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = new Date(targetDate.setHours(hour, 0, 0, 0));
        const slotEnd = new Date(targetDate.setHours(hour + 1, 0, 0, 0));

        // Check if this slot conflicts with existing appointments
        const hasConflict = existingAppointments.some((apt) => {
          return apt.startTime < slotEnd && apt.endTime > slotStart;
        });

        if (!hasConflict) {
          availableSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            displayTime: `${hour}:00 - ${hour + 1}:00`,
          });
        }
      }

      res.json(availableSlots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available slots" });
    }
  }
);

export default router;
