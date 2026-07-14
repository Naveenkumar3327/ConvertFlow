import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversionJob extends Document {
  userId?: mongoose.Types.ObjectId; // Optional for guests
  fileId: mongoose.Types.ObjectId;
  sourceFormat: string;
  targetFormat: string;
  conversionEngine: string; // e.g., "sharp", "pdf-lib", "ffmpeg", "libreoffice"
  status: "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  errorMessage?: string;
  retryCount: number;
  startedAt?: Date;
  completedAt?: Date;
  processingDuration?: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

const ConversionJobSchema: Schema<IConversionJob> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    fileId: { type: Schema.Types.ObjectId, ref: "File", required: true, index: true },
    sourceFormat: { type: String, required: true },
    targetFormat: { type: String, required: true },
    conversionEngine: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "queued", "processing", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    progress: { type: Number, default: 0 },
    errorMessage: { type: String },
    retryCount: { type: Number, default: 0 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    processingDuration: { type: Number },
  },
  { timestamps: true }
);

const ConversionJob: Model<IConversionJob> =
  mongoose.models.ConversionJob || mongoose.model<IConversionJob>("ConversionJob", ConversionJobSchema);

export default ConversionJob;
