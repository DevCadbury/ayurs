import { Router } from "express";
import { Therapy } from "../models/Therapy";
import { verifyAppJwt, requireRoles, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(verifyAppJwt);

// Get all therapies
router.get(
  "/",
  requireRoles(["admin", "doctor", "patient"]),
  async (req: AuthRequest, res) => {
    try {
      const therapies = await Therapy.find().select("-__v");
      res.json(therapies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch therapies" });
    }
  }
);

// Get therapy by ID
router.get(
  "/:id",
  requireRoles(["admin", "doctor", "patient"]),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const therapy = await Therapy.findById(id).select("-__v");

      if (!therapy) {
        return res.status(404).json({ error: "Therapy not found" });
      }

      res.json(therapy);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch therapy" });
    }
  }
);

// Create therapy (admin and doctor)
router.post("/", requireRoles(["admin", "doctor"]), async (req, res) => {
  try {
    const {
      name,
      description,
      durationMinutes,
      venueAddress,
      price,
      category,
      status,
      requirements,
    } = req.body;

    // Validate required fields
    if (!name || !durationMinutes) {
      return res.status(400).json({ error: "Name and duration are required" });
    }

    const therapy = new Therapy({
      name,
      description,
      durationMinutes: parseInt(durationMinutes),
      venueAddress,
      price: price !== undefined ? Number(price) : undefined,
      category,
      status,
      requirements,
    });

    const created = await therapy.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create therapy" });
  }
});

// Update therapy (admin and doctor)
router.put("/:id", requireRoles(["admin", "doctor"]), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert duration and price to number if provided
    if (updateData.durationMinutes !== undefined) {
      updateData.durationMinutes = parseInt(updateData.durationMinutes);
    }
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }

    const therapy = await Therapy.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-__v");

    if (!therapy) {
      return res.status(404).json({ error: "Therapy not found" });
    }

    res.json(therapy);
  } catch (error) {
    res.status(500).json({ error: "Failed to update therapy" });
  }
});

// Delete therapy (admin and doctor)
router.delete("/:id", requireRoles(["admin", "doctor"]), async (req, res) => {
  try {
    const { id } = req.params;
    const therapy = await Therapy.findByIdAndDelete(id);

    if (!therapy) {
      return res.status(404).json({ error: "Therapy not found" });
    }

    res.json({ message: "Therapy deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete therapy" });
  }
});

export default router;
