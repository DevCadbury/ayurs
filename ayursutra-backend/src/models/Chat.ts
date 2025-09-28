import { Schema, model, Document, Types } from "mongoose";

export interface IChatMessage {
  sender: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IChat extends Document {
  participants: Types.ObjectId[]; // patient and doctor
  messages: IChatMessage[];
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Chat = model<IChat>("Chat", ChatSchema);
