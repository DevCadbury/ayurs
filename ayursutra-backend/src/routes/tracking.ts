import { Router } from "express";
import { Appointment } from "../models/Appointment";
import { verifyAppJwt, requireRoles } from "../middleware/auth";

const router = Router();
router.use(verifyAppJwt);

router.post("/:id/start", requireRoles(["doctor"]), async (req, res) => {
  const appt = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: "in_progress" },
    { new: true }
  );
  res.json(appt);
});

router.post("/:id/end", requireRoles(["doctor"]), async (req, res) => {
  const appt = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: "completed" },
    { new: true }
  );
  res.json(appt);
});

export default router;
