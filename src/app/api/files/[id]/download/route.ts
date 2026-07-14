import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { getGridFSStream } from "@/lib/gridfs/service";
import File from "@/models/File";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { Readable } from "stream";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const fileId = params.id;

    // Fetch file metadata
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check expiration for temporary files
    if (fileDoc.isTemporary && fileDoc.expiresAt && new Date() > fileDoc.expiresAt) {
      return NextResponse.json({ error: "This temporary guest file has expired" }, { status: 410 });
    }

    // Verify ownership for registered files
    if (fileDoc.userId) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.id !== fileDoc.userId.toString()) {
        return NextResponse.json({ error: "Unauthorized access to this file" }, { status: 403 });
      }
    }

    // Determine target download file (Download converted if complete, else original)
    const isConverted = fileDoc.conversionStatus === "completed" && fileDoc.convertedGridFSFileId;
    const bucketName = isConverted ? "convertedFiles" : "originalFiles";
    const gridFSId = isConverted ? fileDoc.convertedGridFSFileId! : fileDoc.originalGridFSFileId;
    const mimeType = isConverted ? fileDoc.convertedMimeType || fileDoc.mimeType : fileDoc.mimeType;
    const size = isConverted ? fileDoc.convertedFileSize || fileDoc.originalFileSize : fileDoc.originalFileSize;

    // Prepare filename
    let downloadName = fileDoc.displayFileName;
    if (isConverted) {
      // Append target format if not already in filename
      const targetExt = fileDoc.outputFormat.toLowerCase();
      const currentExt = downloadName.split(".").pop()?.toLowerCase();
      if (currentExt !== targetExt) {
        const baseName = downloadName.substring(0, downloadName.lastIndexOf("."));
        downloadName = `${baseName || downloadName}.${targetExt}`;
      }
    }

    // Get GridFS bucket download stream
    const nodeStream = await getGridFSStream(bucketName, gridFSId);
    const webStream = Readable.toWeb(nodeStream);

    // Increment download counter
    fileDoc.downloadCount += 1;
    fileDoc.lastDownloadedAt = new Date();
    await fileDoc.save();

    // Log Activity for authenticated users
    if (fileDoc.userId) {
      await Activity.create({
        userId: fileDoc.userId,
        activityType: "download",
        fileId: fileDoc._id,
        description: `Downloaded file: ${downloadName}`,
      });
    }

    // Set headers and stream response
    return new Response(webStream as any, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadName)}"`,
        "Content-Length": String(size),
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during download processing" },
      { status: 500 }
    );
  }
}
