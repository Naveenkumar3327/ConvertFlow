import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import User from "@/models/User";
import File from "@/models/File";
import ConversionJob from "@/models/ConversionJob";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    // Enforce administrator-only access
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Administrators only" }, { status: 403 });
    }

    // 1. Gather count metrics
    const usersCount = await User.countDocuments();
    const activeConversions = await ConversionJob.countDocuments({
      status: { $in: ["pending", "queued", "processing"] },
    });
    const failedConversions = await ConversionJob.countDocuments({ status: "failed" });
    const completedConversions = await ConversionJob.countDocuments({ status: "completed" });

    // 2. Global storage aggregation
    const storageAggregation = await User.aggregate([
      { $group: { _id: null, totalUsed: { $sum: "$storageUsed" } } },
    ]);
    const globalStorageUsed = storageAggregation[0]?.totalUsed || 0;

    // 3. System health parameters
    const systemHealth = {
      database: "Connected",
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
    };

    // 4. Fetch lists for admin view panels
    const users = await User.find().sort({ createdAt: -1 }).limit(30).lean();
    const conversions = await ConversionJob.find()
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      metrics: {
        usersCount,
        activeConversions,
        failedConversions,
        completedConversions,
        globalStorageUsed,
      },
      systemHealth,
      users,
      conversions,
    });
  } catch (error: any) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load administrative panel details" },
      { status: 500 }
    );
  }
}
