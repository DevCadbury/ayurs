import { Router } from "express";
import { Feedback } from "../models/Feedback";
import { verifyAppJwt } from "../middleware/auth";

const router = Router();
router.use(verifyAppJwt);

router.post("/", async (req, res) => {
  const created = await Feedback.create(req.body);
  res.json(created);
});

router.get("/", async (_req, res) => {
  const list = await Feedback.find().populate("by aboutAppointment");
  res.json(list);
});

export default router;
