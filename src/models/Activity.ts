import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  activityType: "upload" | "conversion" | "download" | "delete" | "restore" | "favorite";
  fileId?: mongoose.Types.ObjectId;
  description: string;
  createdAt: Date;
}

const ActivitySchema: Schema<IActivity> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    activityType: {
      type: String,
      enum: ["upload", "conversion", "download", "delete", "restore", "favorite"],
      required: true,
      index: true,
    },
    fileId: { type: Schema.Types.ObjectId, ref: "File" },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
