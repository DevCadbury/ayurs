import { Router } from "express";
import { Appointment } from "../models/Appointment";
import { verifyAppJwt, requireRoles } from "../middleware/auth";

const router = Router();
router.use(verifyAppJwt, requireRoles(["admin"]));

router.get("/revenue", async (_req, res) => {
  const count = await Appointment.countDocuments({ status: "completed" });
  const revenue = count * 100; // dummy
  res.json({ completed: count, revenue });
});

export default router;
