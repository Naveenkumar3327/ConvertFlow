import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "./db/connection";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (user.accountStatus === "suspended") {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        if (user.accountStatus === "deleted") {
          throw new Error("This account no longer exists.");
        }

        // For Google signed-up users who try credentials login
        if (user.authenticationProvider === "google" && !user.passwordHash) {
          throw new Error("Please log in using Google OAuth.");
        }

        if (!user.passwordHash) {
          throw new Error("Authentication failed");
        }

        const isPasswordCorrect = bcrypt.compareSync(credentials.password, user.passwordHash);

        if (!isPasswordCorrect) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          image: user.profileImage,
          role: user.role,
          subscriptionPlan: user.subscriptionPlan,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          // Auto-register new Google user
          await User.create({
            fullName: user.name || "Google User",
            email,
            profileImage: user.image || undefined,
            authenticationProvider: "google",
            role: "user",
            subscriptionPlan: "free",
            storageLimit: 524288000, // 500 MB
            storageUsed: 0,
            emailVerified: true,
            accountStatus: "active",
          });
        } else if (existingUser.accountStatus === "suspended") {
          return false; // Reject Google login for suspended users
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Pass details from user to token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.subscriptionPlan = (user as any).subscriptionPlan || "free";
      }

      // Handle profile update trigger
      if (trigger === "update" && session) {
        token.name = session.name || token.name;
        token.image = session.image || token.image;
        if (session.role) token.role = session.role;
        if (session.subscriptionPlan) token.subscriptionPlan = session.subscriptionPlan;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).subscriptionPlan = token.subscriptionPlan as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || "fallback-secret-string-at-least-32-chars",
};
