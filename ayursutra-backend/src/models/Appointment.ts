import { Schema, model, Document, Types } from "mongoose";

export interface IAppointment extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  therapy: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "delayed";
  notes?: string;
  rating?: number;
  duration?: number;
  painLevel?: number;
  energyLevel?: number;
  moodLevel?: number;
  sleepQuality?: number;
  overallWellness?: number;
  symptoms?: string[];
  improvements?: string[];
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    therapy: { type: Schema.Types.ObjectId, ref: "Therapy", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled", "delayed"],
      default: "scheduled",
    },
    notes: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    duration: { type: Number },
    painLevel: { type: Number, min: 0, max: 10 },
    energyLevel: { type: Number, min: 0, max: 10 },
    moodLevel: { type: Number, min: 0, max: 10 },
    sleepQuality: { type: Number, min: 0, max: 10 },
    overallWellness: { type: Number, min: 0, max: 10 },
    symptoms: [{ type: String }],
    improvements: [{ type: String }],
  },
  { timestamps: true }
);

export const Appointment = model<IAppointment>(
  "Appointment",
  AppointmentSchema
);
