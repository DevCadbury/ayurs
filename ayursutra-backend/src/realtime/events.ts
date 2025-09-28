import { EventEmitter } from "events";

export type RealtimeEvent = {
  type:
    | "message.created"
    | "user.approved"
    | "user.approval_requested"
    | "appointment.created"
    | "appointment.updated";
  payload: any;
  timestamp?: string;
};

// Shared in-memory event bus (per-process)
export const realtimeBus = new EventEmitter();
realtimeBus.setMaxListeners(0);

export function emitRealtime(event: RealtimeEvent) {
  const enriched = { ...event, timestamp: new Date().toISOString() };
  realtimeBus.emit("event", enriched);
}
