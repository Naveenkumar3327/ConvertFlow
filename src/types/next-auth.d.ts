import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "premium" | "admin";
      subscriptionPlan: "free" | "pro" | "business";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "user" | "premium" | "admin";
    subscriptionPlan: "free" | "pro" | "business";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "premium" | "admin";
    subscriptionPlan: "free" | "pro" | "business";
  }
}
