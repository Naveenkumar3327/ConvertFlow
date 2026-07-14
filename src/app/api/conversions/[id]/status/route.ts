import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import ConversionJob from "@/models/ConversionJob";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const jobId = params.id;

    const job = await ConversionJob.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Conversion job not found" }, { status: 404 });
    }

    // Verify ownership of the conversion job if logged in
    if (job.userId) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.id !== job.userId.toString()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json({
      status: job.status,
      progress: job.progress,
      errorMessage: job.errorMessage,
      completedAt: job.completedAt,
      processingDuration: job.processingDuration,
    });
  } catch (error: any) {
    console.error("Get job status error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve conversion status" },
      { status: 500 }
    );
  }
}
