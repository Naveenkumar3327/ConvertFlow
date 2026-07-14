import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { deleteFromGridFS } from "@/lib/gridfs/service";
import File from "@/models/File";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.id;
    const fileDoc = await File.findById(fileId);

    if (!fileDoc) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (fileDoc.userId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Delete original file from GridFS bucket
    await deleteFromGridFS("originalFiles", fileDoc.originalGridFSFileId);

    // 2. Delete converted file from GridFS bucket if it exists
    if (fileDoc.convertedGridFSFileId) {
      await deleteFromGridFS("convertedFiles", fileDoc.convertedGridFSFileId);
    }

    // 3. Delete preview file from GridFS bucket if it exists
    if (fileDoc.previewGridFSFileId) {
      await deleteFromGridFS("previewFiles", fileDoc.previewGridFSFileId);
    }

    // 4. Recalculate user storage space
    const user = await User.findById(session.user.id);
    if (user) {
      const fileQuotaUsage = fileDoc.originalFileSize + (fileDoc.convertedFileSize || 0);
      user.storageUsed = Math.max(0, user.storageUsed - fileQuotaUsage);
      await user.save();

      // Log permanent deletion activity
      await Activity.create({
        userId: user._id,
        activityType: "delete",
        description: `Permanently deleted file: ${fileDoc.displayFileName} (Reclaimed ${(fileQuotaUsage / 1024 / 1024).toFixed(2)} MB)`,
      });
    }

    // 5. Delete Mongoose file metadata document
    await File.findByIdAndDelete(fileId);

    return NextResponse.json({ message: "File permanently deleted and storage reclaimed." });
  } catch (error: any) {
    console.error("Permanent delete error:", error);
    return NextResponse.json(
      { error: "Failed to permanently delete file" },
      { status: 500 }
    );
  }
}
