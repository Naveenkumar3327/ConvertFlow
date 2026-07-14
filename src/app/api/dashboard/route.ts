import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import File from "@/models/File";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Fetch User details for Storage stats
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Aggregate count metrics
    const totalFiles = await File.countDocuments({ userId: userId as any, isDeleted: false });
    const totalConverted = await File.countDocuments({ userId: userId as any, isDeleted: false, conversionStatus: "completed" });
    const failedConversions = await File.countDocuments({ userId: userId as any, isDeleted: false, conversionStatus: "failed" });

    // 3. Category distribution aggregations
    const categoriesList = ["pdf", "document", "image", "spreadsheet", "presentation", "audio", "video"];
    const categoryDistribution = await Promise.all(
      categoriesList.map(async (cat) => {
        const count = await File.countDocuments({ userId: userId as any, fileCategory: cat as any, isDeleted: false });
        return { name: cat, value: count };
      })
    );

    // 4. Fetch last 5 files
    const recentFiles = await File.find({ userId: userId as any, isDeleted: false })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .lean();

    // 5. Fetch last 5 user activities
    const recentActivities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      statistics: {
        totalFiles,
        totalConverted,
        failedConversions,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        storagePercent: Number(((user.storageUsed / user.storageLimit) * 100).toFixed(1)) || 0,
      },
      categoryDistribution: categoryDistribution.filter((c) => c.value > 0),
      recentFiles,
      recentActivities,
    });
  } catch (error: any) {
    console.error("Dashboard stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
