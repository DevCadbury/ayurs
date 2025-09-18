import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { signAppJwt } from "../middleware/auth";

export async function exchangeUidForJwt(req: Request, res: Response) {
  try {
    const { uid, email, name, role } = req.body as {
      uid: string;
      email?: string;
      name?: string;
      role?: string;
    };

    if (!uid) return res.status(400).json({ message: "uid required" });

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.warn("MongoDB not connected, using demo mode");
      // Return demo token without database operations
      const userRole = role || "patient";
      const token = signAppJwt(uid, userRole);
      return res.json({
        token,
        role: userRole,
        isApproved: userRole === "patient" ? true : false,
        message: "Demo mode - database not connected",
      });
    }

    let user = await User.findOne({ uid });
    if (!user) {
      // New user - create with provided role or default to patient
      const userRole = role || "patient";
      user = await User.create({
        uid,
        email: email ?? "",
        name: name ?? "User",
        role: userRole,
        // Approval requirements: only patient is auto-approved
        isApproved: userRole === "patient" ? true : false,
      });
      console.log(
        `✅ New user created: ${user.name} (${user.uid}) with role: ${userRole}`
      );
    } else {
      console.log(
        `✅ Existing user found: ${user.name} (${user.uid}) with role: ${user.role}`
      );
    }

    // Enforce approval for doctor/admin: token is still issued for API access,
    // UI must gate via isApproved; include it in response so frontend can gate dashboards
    const token = signAppJwt(user.uid, user.role);
    return res.json({ token, role: user.role, isApproved: user.isApproved });
  } catch (e) {
    console.error("Auth controller error:", e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function selectRole(req: Request, res: Response) {
  try {
    const { uid, role, email, name } = req.body as {
      uid: string;
      role: string;
      email?: string;
      name?: string;
    };

    if (!uid || !role) {
      return res.status(400).json({ message: "uid and role required" });
    }

    // Validate role
    const validRoles = ["patient", "doctor", "admin"];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be patient, doctor, or admin" });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.warn("MongoDB not connected, using demo mode");
      const token = signAppJwt(uid, role);
      return res.json({
        token,
        role,
        isApproved: role === "patient" ? true : false,
        message: "Demo mode - role selected",
      });
    }

    // Make creation/update explicit to avoid edge-case validator issues
    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({
        uid,
        email: email ?? "",
        name: name ?? "User",
        role,
        isApproved: role === "doctor" || role === "admin" ? false : true,
      });
    } else {
      if (typeof role === "string" && role)
        user.role = role as "patient" | "doctor" | "admin";
      // If elevating to doctor/admin and isApproved is not explicitly set, default to false
      if (
        (role === "doctor" || role === "admin") &&
        typeof user.isApproved === "undefined"
      ) {
        user.isApproved = false;
      }
      if (!user.name && typeof name === "string") user.name = name || "User";
      if (!user.email && typeof email === "string") user.email = email || "";
      await user.save();
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ User role updated: ${user.name} (${user.uid}) -> ${role}`);

    const token = signAppJwt(user.uid, user.role);
    return res.json({ token, role: user.role, isApproved: user.isApproved });
  } catch (e) {
    console.error("Role selection error:", e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function checkUser(req: Request, res: Response) {
  try {
    const { uid } = req.body as { uid: string };

    if (!uid) {
      return res.status(400).json({ message: "uid required" });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.warn("MongoDB not connected, assuming new user");
      return res.json({ exists: false });
    }

    const user = await User.findOne({ uid });
    return res.json({ exists: !!user });
  } catch (e) {
    console.error("Check user error:", e);
    return res.status(500).json({ message: "Server error" });
  }
}
