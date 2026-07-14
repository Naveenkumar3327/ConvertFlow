import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { getGridFSStream } from "@/lib/gridfs/service";
import File from "@/models/File";
import { Readable } from "stream";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;
    await connectDB();

    // Fetch file metadata
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check expiration for temporary files
    if (fileDoc.isTemporary && fileDoc.expiresAt && new Date() > fileDoc.expiresAt) {
      return NextResponse.json({ error: "This temporary guest preview has expired" }, { status: 410 });
    }

    // Verify ownership for registered files
    if (fileDoc.userId) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.id !== fileDoc.userId.toString()) {
        return NextResponse.json({ error: "Unauthorized access to this file" }, { status: 403 });
      }
    }

    // Determine bucket: preview files bucket first, then converted, then original
    let bucketName: "previewFiles" | "convertedFiles" | "originalFiles" = "originalFiles";
    let gridFSId = fileDoc.originalGridFSFileId;
    let mimeType = fileDoc.mimeType;
    let size = fileDoc.originalFileSize;

    if (fileDoc.previewGridFSFileId) {
      bucketName = "previewFiles";
      gridFSId = fileDoc.previewGridFSFileId;
      mimeType = "image/png"; // Previews are generally scaled down PNG/JPGs
    } else if (fileDoc.conversionStatus === "completed" && fileDoc.convertedGridFSFileId) {
      bucketName = "convertedFiles";
      gridFSId = fileDoc.convertedGridFSFileId;
      mimeType = fileDoc.convertedMimeType || fileDoc.mimeType;
      size = fileDoc.convertedFileSize || fileDoc.originalFileSize;
    }

    // Get download stream
    const nodeStream = await getGridFSStream(bucketName, gridFSId);
    const webStream = Readable.toWeb(nodeStream);

    // Stream inline response
    return new Response(webStream as any, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": "inline",
        "Content-Length": String(size),
        "Cache-Control": "public, max-age=86400", // cache previews for 24h
      },
    });
  } catch (error: any) {
    console.error("Preview error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during preview generation" },
      { status: 500 }
    );
  }
}
