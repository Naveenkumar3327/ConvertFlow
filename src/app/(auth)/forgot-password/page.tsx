"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
            ConvertFlow
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-foreground">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email and we'll send you a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card py-8 px-6 border border-border/80 shadow-xl rounded-3xl sm:px-10"
        >
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-success/15 border border-success/20 text-success flex items-center justify-center mx-auto">
                <Check className="w-6.5 h-6.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Check your inbox</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.
                </p>
              </div>
              <Link
                href="/login"
                className="block text-xs font-bold text-primary hover:underline pt-4"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-bold text-foreground">Email Address</label>
                <div className="mt-1.5 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/95 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all cursor-pointer"
              >
                Send Reset Link
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-muted hover:text-foreground transition-colors"
                >
                  Cancel and return to login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
