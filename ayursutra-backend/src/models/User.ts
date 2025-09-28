import { Schema, model, Document } from "mongoose";

export type UserRole = "patient" | "doctor" | "admin";

export interface IUser extends Document {
  uid: string; // Firebase UID
  name: string;
  email: string;
  role: UserRole;
  specialty?: string; // For doctors
  avatar?: string; // Profile picture
  isApproved?: boolean; // Requires admin approval for doctor/admin
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
    },
    specialty: { type: String }, // For doctors
    avatar: { type: String }, // Profile picture
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
