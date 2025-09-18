import { Schema, model, Document, Types } from "mongoose";

export interface ITherapy extends Document {
  name: string;
  description?: string;
  durationMinutes: number;
  venueAddress?: string;
  price?: number;
  category?: string;
  status?: "active" | "inactive";
  requirements?: string;
}

const TherapySchema = new Schema<ITherapy>(
  {
    name: { type: String, required: true },
    description: String,
    durationMinutes: { type: Number, required: true },
    venueAddress: String,
    price: { type: Number },
    category: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    requirements: String,
  },
  { timestamps: true }
);

export const Therapy = model<ITherapy>("Therapy", TherapySchema);
