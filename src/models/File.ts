import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFile extends Document {
  userId?: mongoose.Types.ObjectId; // Optional for Guest users
  originalFileName: string;
  displayFileName: string;
  originalGridFSFileId: mongoose.Types.ObjectId;
  convertedGridFSFileId?: mongoose.Types.ObjectId;
  previewGridFSFileId?: mongoose.Types.ObjectId;
  originalFormat: string;
  outputFormat: string;
  mimeType: string;
  convertedMimeType?: string;
  fileCategory: "pdf" | "document" | "image" | "spreadsheet" | "presentation" | "audio" | "video";
  originalFileSize: number; // in bytes
  convertedFileSize?: number; // in bytes
  conversionStatus:
    | "pending"
    | "uploading"
    | "uploaded"
    | "queued"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "expired";
  conversionProgress: number; // 0 to 100
  storageType: "mongodb-gridfs";
  isFavorite: boolean;
  isDeleted: boolean; // True means in trash
  isTemporary: boolean; // True for Guest files or transient conversions
  downloadCount: number;
  lastDownloadedAt?: Date;
  uploadedAt: Date;
  convertedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema: Schema<IFile> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    originalFileName: { type: String, required: true },
    displayFileName: { type: String, required: true },
    originalGridFSFileId: { type: Schema.Types.ObjectId, required: true },
    convertedGridFSFileId: { type: Schema.Types.ObjectId },
    previewGridFSFileId: { type: Schema.Types.ObjectId },
    originalFormat: { type: String, required: true },
    outputFormat: { type: String, required: true },
    mimeType: { type: String, required: true },
    convertedMimeType: { type: String },
    fileCategory: {
      type: String,
      enum: ["pdf", "document", "image", "spreadsheet", "presentation", "audio", "video"],
      required: true,
      index: true,
    },
    originalFileSize: { type: Number, required: true },
    convertedFileSize: { type: Number },
    conversionStatus: {
      type: String,
      enum: [
        "pending",
        "uploading",
        "uploaded",
        "queued",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "expired",
      ],
      default: "pending",
      index: true,
    },
    conversionProgress: { type: Number, default: 0 },
    storageType: { type: String, default: "mongodb-gridfs" },
    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
    isTemporary: { type: Boolean, default: false, index: true },
    downloadCount: { type: Number, default: 0 },
    lastDownloadedAt: { type: Date },
    uploadedAt: { type: Date, default: Date.now, index: true },
    convertedAt: { type: Date },
    expiresAt: { type: Date, index: true }, // Index for TTL / cron cleanup
  },
  { timestamps: true }
);

// Compound index for user query performance (listing user files in order)
FileSchema.index({ userId: 1, isDeleted: 1, uploadedAt: -1 });

const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>("File", FileSchema);

export default File;
