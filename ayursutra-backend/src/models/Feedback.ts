import { Schema, model, Document, Types } from "mongoose";

export interface IFeedback extends Document {
  by: Types.ObjectId;
  aboutAppointment: Types.ObjectId;
  rating: number;
  comment?: string;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    aboutAppointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
  },
  { timestamps: true }
);

export const Feedback = model<IFeedback>("Feedback", FeedbackSchema);
