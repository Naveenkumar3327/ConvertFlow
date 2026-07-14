import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash?: string;
  profileImage?: string;
  authenticationProvider: "credentials" | "google";
  role: "user" | "premium" | "admin";
  subscriptionPlan: "free" | "pro" | "business";
  storageLimit: number; // in bytes
  storageUsed: number;  // in bytes
  emailVerified: boolean;
  accountStatus: "active" | "suspended" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    profileImage: { type: String },
    authenticationProvider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    role: {
      type: String,
      enum: ["user", "premium", "admin"],
      default: "user",
    },
    subscriptionPlan: {
      type: String,
      enum: ["free", "pro", "business"],
      default: "free",
    },
    storageLimit: { type: Number, default: 524288000 }, // 500 MB in bytes
    storageUsed: { type: Number, default: 0 },
    emailVerified: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Prevent compiling model multiple times in Next.js development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
