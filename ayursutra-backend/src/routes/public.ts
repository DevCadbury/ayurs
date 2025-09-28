import { Router } from "express";
import { verifyFirebaseUid } from "../middleware/auth";
import {
  exchangeUidForJwt,
  selectRole,
  checkUser,
} from "../controllers/authController";

const router = Router();

router.post("/exchange", verifyFirebaseUid, exchangeUidForJwt);
router.post("/select-role", selectRole);
router.post("/check-user", checkUser);

export default router;
