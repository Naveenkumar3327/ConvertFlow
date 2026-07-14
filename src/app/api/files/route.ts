import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import File from "@/models/File";

export async function GET(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "workspace"; // workspace, favorites, trash
    const sort = searchParams.get("sort") || "newest"; // newest, oldest, name, size

    // Build MongoDB query
    const query: any = {
      userId: session.user.id,
    };

    // Filter by workspace vs trash vs favorites
    if (status === "trash") {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
      if (status === "favorites") {
        query.isFavorite = true;
      }
    }

    // Filter by file name search
    if (search) {
      query.displayFileName = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category !== "all") {
      query.fileCategory = category;
    }

    // Determine Sort Order
    let sortObj: any = { uploadedAt: -1 };
    if (sort === "oldest") {
      sortObj = { uploadedAt: 1 };
    } else if (sort === "name") {
      sortObj = { displayFileName: 1 };
    } else if (sort === "size") {
      sortObj = { originalFileSize: -1 };
    }

    const files = await File.find(query).sort(sortObj).lean();

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("Fetch files error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching files" },
      { status: 500 }
    );
  }
}
