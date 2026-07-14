import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { uploadBufferToGridFS } from "@/lib/gridfs/service";
import File from "@/models/File";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    await connectDB();

    // Check user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetFormat = formData.get("targetFormat") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!targetFormat) {
      return NextResponse.json({ error: "Target format is required" }, { status: 400 });
    }

    // Determine upload limits based on user role
    let maxUploadSize = 10485760; // 10MB default for Guest
    let userDoc: any = null;

    if (userId) {
      userDoc = await User.findById(userId);
      if (!userDoc) {
        return NextResponse.json({ error: "Authenticated user not found" }, { status: 404 });
      }

      if (userDoc.accountStatus === "suspended") {
        return NextResponse.json({ error: "Account suspended" }, { status: 403 });
      }

      maxUploadSize = userDoc.role === "premium" ? 262144000 : 26214400; // 250MB vs 25MB
    }

    if (file.size > maxUploadSize) {
      const limitMB = maxUploadSize / 1024 / 1024;
      return NextResponse.json(
        { error: `File size exceeds the limit of ${limitMB}MB for your account tier` },
        { status: 400 }
      );
    }

    // Storage capacity check
    if (userDoc) {
      const remainingStorage = userDoc.storageLimit - userDoc.storageUsed;
      if (file.size > remainingStorage) {
        return NextResponse.json(
          { error: "Insufficient storage space in your ConvertFlow drive. Please free up space or upgrade." },
          { status: 400 }
        );
      }
    }

    // Parse extension and category
    const filename = file.name;
    const ext = filename.split(".").pop() || "";
    
    const getFileCategory = (extension: string): "pdf" | "document" | "image" | "spreadsheet" | "presentation" | "audio" | "video" => {
      const e = extension.toLowerCase();
      if (e === "pdf") return "pdf";
      if (["doc", "docx", "txt", "rtf", "md", "html"].includes(e)) return "document";
      if (["jpg", "jpeg", "png", "webp", "svg", "heic"].includes(e)) return "image";
      if (["xls", "xlsx", "csv"].includes(e)) return "spreadsheet";
      if (["ppt", "pptx"].includes(e)) return "presentation";
      if (["mp3", "wav", "m4a", "aac", "ogg"].includes(e)) return "audio";
      return "video";
    };

    const category = getFileCategory(ext);

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Stream file to GridFS originalFiles bucket
    const gridFSId = await uploadBufferToGridFS("originalFiles", buffer, filename, file.type);

    // Calculate guest expiry (1 hour)
    const expiresAt = userId ? undefined : new Date(Date.now() + 60 * 60 * 1000);

    // Create file metadata document
    const fileDoc = await File.create({
      userId: userId || undefined,
      originalFileName: filename,
      displayFileName: filename,
      originalGridFSFileId: gridFSId,
      originalFormat: ext.toLowerCase(),
      outputFormat: targetFormat.toLowerCase(),
      mimeType: file.type,
      fileCategory: category,
      originalFileSize: file.size,
      conversionStatus: "pending",
      conversionProgress: 0,
      storageType: "mongodb-gridfs",
      isFavorite: false,
      isDeleted: false,
      isTemporary: !userId, // true for guests
      downloadCount: 0,
      uploadedAt: new Date(),
      expiresAt: expiresAt,
    });

    // Update user storage
    if (userDoc) {
      userDoc.storageUsed += file.size;
      await userDoc.save();

      // Log activity
      await Activity.create({
        userId: userDoc._id,
        activityType: "upload",
        fileId: fileDoc._id,
        description: `Uploaded file ${filename} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    }

    return NextResponse.json({
      message: "File uploaded successfully",
      fileId: fileDoc._id.toString(),
      originalFileName: fileDoc.originalFileName,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during upload" },
      { status: 500 }
    );
  }
}
