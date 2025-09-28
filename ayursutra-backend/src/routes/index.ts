import { Router } from "express";
import users from "./users";
import schedule from "./schedule";
import tracking from "./tracking";
import feedback from "./feedback";
import reports from "./reports";
import therapies from "./therapies";
import progress from "./progress";
import auth from "./public";
import notifications from "./notifications";
import messages from "./messages";
import { realtimeBus, RealtimeEvent } from "../realtime/events";
import { ensureDbConnection } from "../middleware/dbConnection";

const router = Router();

// Apply database connection middleware to all API routes
router.use(ensureDbConnection);

router.use("/users", users);
router.use("/schedule", schedule);
router.use("/tracking", tracking);
router.use("/feedback", feedback);
router.use("/reports", reports);
router.use("/notifications", notifications);
router.use("/messages", messages);

// Server-Sent Events stream for realtime updates
router.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (event: RealtimeEvent) => {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const onEvent = (event: RealtimeEvent) => send(event);
  realtimeBus.on("event", onEvent);

  // keepalive
  const keepalive = setInterval(() => {
    res.write(": ping\n\n");
  }, 20000);

  req.on("close", () => {
    clearInterval(keepalive);
    realtimeBus.off("event", onEvent);
    res.end();
  });
});
router.use("/therapies", therapies);
router.use("/progress", progress);
router.use("/auth", auth);

export default router;
