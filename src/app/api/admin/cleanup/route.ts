import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { deleteFromGridFS } from "@/lib/gridfs/service";
import File from "@/models/File";
import ConversionJob from "@/models/ConversionJob";

export async function POST() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    // Enforce administrator-only authorization
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Administrators only" }, { status: 403 });
    }

    const now = new Date();
    
    // 1. Fetch all expired temporary (Guest) files
    const expiredFiles = await File.find({
      isTemporary: true,
      expiresAt: { $lt: now },
    });

    let reclaimedBytes = 0;
    let deletedCount = 0;

    for (const file of expiredFiles) {
      try {
        // Delete original file from GridFS
        await deleteFromGridFS("originalFiles", file.originalGridFSFileId);

        // Delete converted file from GridFS
        if (file.convertedGridFSFileId) {
          await deleteFromGridFS("convertedFiles", file.convertedGridFSFileId);
        }

        // Delete preview file from GridFS
        if (file.previewGridFSFileId) {
          await deleteFromGridFS("previewFiles", file.previewGridFSFileId);
        }

        // Delete conversion jobs associated with this file
        await ConversionJob.deleteMany({ fileId: file._id });

        // Sum size for metrics reporting
        reclaimedBytes += file.originalFileSize + (file.convertedFileSize || 0);
        deletedCount++;

        // Delete file document metadata
        await File.findByIdAndDelete(file._id);
      } catch (err) {
        console.error(`Failed to clean up expired file ${file._id}:`, err);
      }
    }

    // 2. Clean up failed or cancelled conversion jobs older than 24 hours
    const ageLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deletedJobsResult = await ConversionJob.deleteMany({
      status: { $in: ["failed", "cancelled"] },
      createdAt: { $lt: ageLimit },
    });

    return NextResponse.json({
      message: "System cleanup completed successfully",
      deletedFiles: deletedCount,
      reclaimedSpaceMB: (reclaimedBytes / 1024 / 1024).toFixed(2),
      deletedOldJobs: deletedJobsResult.deletedCount,
    });
  } catch (error: any) {
    console.error("Cleanup API error:", error);
    return NextResponse.json(
      { error: "Cleanup daemon failed execution" },
      { status: 500 }
    );
  }
}
