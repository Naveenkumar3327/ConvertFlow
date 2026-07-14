import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { fullName, email, password } = validation.data;
    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      authenticationProvider: "credentials",
      role: "user",
      subscriptionPlan: "free",
      storageLimit: 524288000, // 500 MB
      storageUsed: 0,
      emailVerified: false,
      accountStatus: "active",
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: newUser._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
