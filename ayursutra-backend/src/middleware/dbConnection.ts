import { Request, Response, NextFunction } from "express";
import { ensureConnection } from "../config/mongodb-serverless";

/**
 * Middleware to ensure MongoDB connection is active before processing requests
 * This handles MongoDB Atlas sleep mode by reconnecting when needed
 */
export async function ensureDbConnection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Ensure connection is healthy and active
    await ensureConnection();
    next();
  } catch (error) {
    console.error("❌ Database connection failed in middleware:", error);
    res.status(503).json({
      error: "Database connection failed",
      message: "Unable to connect to database. Please try again.",
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Optional database connection middleware
 * Only tries to connect if not already connected, doesn't fail the request
 */
export async function optionalDbConnection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Only try to connect if not already connected
    if (req.app.locals.mongoose?.connection?.readyState !== 1) {
      await ensureConnection();
    }
  } catch (error) {
    console.warn("⚠️ Optional database connection failed:", error);
    // Don't fail the request, just log the warning
  }
  next();
}
