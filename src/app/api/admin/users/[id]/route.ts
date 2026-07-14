import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import User from "@/models/User";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const session = await getServerSession(authOptions);

    // Enforce administrator-only access
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Administrators only" }, { status: 403 });
    }

    const { accountStatus } = await req.json();

    if (!["active", "suspended", "deleted"].includes(accountStatus)) {
      return NextResponse.json({ error: "Invalid status state" }, { status: 400 });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent suspending self
    if (targetUser._id.toString() === session.user.id) {
      return NextResponse.json({ error: "You cannot suspend your own administrator account" }, { status: 400 });
    }

    targetUser.accountStatus = accountStatus;
    await targetUser.save();

    return NextResponse.json({
      message: `User account is now ${accountStatus}`,
      user: {
        id: targetUser._id.toString(),
        fullName: targetUser.fullName,
        accountStatus: targetUser.accountStatus,
      },
    });
  } catch (error: any) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user account status" },
      { status: 500 }
    );
  }
}
