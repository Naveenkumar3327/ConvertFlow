import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import File from "@/models/File";
import Activity from "@/models/Activity";

// Rename or Soft-delete file
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { displayFileName, isFavorite, isDeleted } = body;

    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (fileDoc.userId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Process edits
    if (displayFileName !== undefined) {
      if (!displayFileName.trim()) {
        return NextResponse.json({ error: "File name cannot be empty" }, { status: 400 });
      }
      const ext = fileDoc.originalFileName.split(".").pop();
      const newExt = displayFileName.split(".").pop();
      
      // Auto-append original extension if the user omitted it
      let finalName = displayFileName;
      if (ext && newExt !== ext) {
        finalName = `${displayFileName}.${ext}`;
      }
      
      fileDoc.displayFileName = finalName;
      await Activity.create({
        userId: session.user.id,
        activityType: "restore",
        fileId: fileDoc._id,
        description: `Renamed file from ${fileDoc.displayFileName} to ${finalName}`,
      });
    }

    if (isFavorite !== undefined) {
      fileDoc.isFavorite = isFavorite;
      await Activity.create({
        userId: session.user.id,
        activityType: "favorite",
        fileId: fileDoc._id,
        description: isFavorite ? `Starred file: ${fileDoc.displayFileName}` : `Unstarred file: ${fileDoc.displayFileName}`,
      });
    }

    if (isDeleted !== undefined) {
      fileDoc.isDeleted = isDeleted;
      if (isDeleted) {
        await Activity.create({
          userId: session.user.id,
          activityType: "delete",
          fileId: fileDoc._id,
          description: `Moved file ${fileDoc.displayFileName} to Trash`,
        });
      } else {
        await Activity.create({
          userId: session.user.id,
          activityType: "restore",
          fileId: fileDoc._id,
          description: `Restored file ${fileDoc.displayFileName} from Trash`,
        });
      }
    }

    await fileDoc.save();
    return NextResponse.json({ message: "File updated successfully", file: fileDoc });
  } catch (error: any) {
    console.error("Update file error:", error);
    return NextResponse.json({ error: "Failed to update file details" }, { status: 500 });
  }
}

// Move file to Trash
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileDoc = await File.findById(id);
    if (!fileDoc) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (fileDoc.userId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Soft delete
    fileDoc.isDeleted = true;
    await fileDoc.save();

    await Activity.create({
      userId: session.user.id,
      activityType: "delete",
      fileId: fileDoc._id,
      description: `Moved file ${fileDoc.displayFileName} to Trash`,
    });

    return NextResponse.json({ message: "File moved to trash" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to soft delete file" }, { status: 500 });
  }
}
