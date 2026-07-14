import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import File from "@/models/File";
import ConversionJob from "@/models/ConversionJob";
import { executeConversion } from "@/lib/conversion/conversion-manager";

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { fileId, targetFormat } = body;

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      return NextResponse.json({ error: "File metadata not found" }, { status: 404 });
    }

    // Verify ownership if authenticated file
    if (fileDoc.userId && (!session || session.user.id !== fileDoc.userId.toString())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Check if job already exists to avoid duplicates
    let job = await ConversionJob.findOne({ fileId, targetFormat: targetFormat.toLowerCase() });

    if (!job) {
      // Map file details to determine default engine
      const ext = fileDoc.originalFormat.toLowerCase();
      let defaultEngine = "cli-fallbacks";
      if (["png", "jpg", "jpeg", "webp"].includes(ext) && ["png", "jpg", "jpeg", "webp"].includes(targetFormat)) {
        defaultEngine = "sharp";
      } else if (ext === "pdf" && targetFormat === "pdf") {
        defaultEngine = "pdf-lib";
      } else if (ext === "docx" && targetFormat === "txt") {
        defaultEngine = "mammoth";
      }

      job = await ConversionJob.create({
        userId: session?.user?.id || undefined,
        fileId: fileDoc._id,
        sourceFormat: ext,
        targetFormat: targetFormat.toLowerCase(),
        conversionEngine: defaultEngine,
        status: "pending",
        progress: 0,
        retryCount: 0,
      });
    }

    // Reset statuses and queue the conversion execution asynchronously
    if (job.status === "failed" || job.status === "cancelled" || job.status === "completed") {
      job.status = "pending";
      job.progress = 0;
      job.errorMessage = undefined;
      await job.save();
    }

    // Trigger conversion asynchronously (does not block HTTP response)
    executeConversion(job._id).catch((err) => {
      console.error(`Background conversion error for job ${job!._id}:`, err);
    });

    return NextResponse.json({
      message: "Conversion queued successfully",
      jobId: job._id.toString(),
    });
  } catch (error: any) {
    console.error("Queue conversion error:", error);
    return NextResponse.json(
      { error: "Failed to queue file conversion" },
      { status: 500 }
    );
  }
}
