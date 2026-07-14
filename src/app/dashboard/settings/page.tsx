"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User as UserIcon, Mail, Shield, HardDrive, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { data: session, update } = useSession();

  // Form states
  const [fullName, setFullName] = useState(session?.user?.name || "");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setUpdating(true);
    setSuccess(false);

    try {
      // Mock update profile call or dynamic profile rename
      setTimeout(async () => {
        await update({ name: fullName });
        setUpdating(false);
        setSuccess(true);
      }, 1000);
    } catch (err) {
      console.error(err);
      setUpdating(false);
    }
  };

  const getTierLimit = (plan: string) => {
    if (plan === "pro") return "5 GB";
    if (plan === "business") return "50 GB";
    return "500 MB";
  };

  const getUploadLimit = (plan: string) => {
    if (plan === "pro") return "250 MB";
    if (plan === "business") return "500 MB";
    return "25 MB";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">Account Settings</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your personal details, monitor storage capacity, and check subscription tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-foreground">Personal Information</h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground">Full Name</label>
              <div className="mt-1.5 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Email Address</label>
              <div className="mt-1.5 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  disabled
                  value={session?.user?.email || ""}
                  className="block w-full pl-10 pr-3 py-2 bg-muted/20 border border-border rounded-xl text-xs font-semibold text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            {success && (
              <div className="text-xs text-emerald-500 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Profile updated successfully</span>
              </div>
            )}

            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto py-2.5 px-5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/95 transition-all cursor-pointer"
            >
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Tier Card */}
        <div className="md:col-span-1 bg-gradient-to-tr from-blue-500/5 to-violet-500/5 border border-primary/10 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Subscription</span>
              </span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
                {session?.user?.subscriptionPlan}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground capitalize">
                {session?.user?.subscriptionPlan} Tier Account
              </h4>
              <p className="text-[10px] text-muted-foreground mt-1">
                Secure, isolated file access built directly on MongoDB Atlas database clusters.
              </p>
            </div>

            <div className="border-t border-border/50 pt-4 space-y-3 text-[11px] font-semibold text-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Quota:</span>
                <span>{getTierLimit(session?.user?.subscriptionPlan || "free")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Upload:</span>
                <span>{getUploadLimit(session?.user?.subscriptionPlan || "free")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Integrations:</span>
                <span className="text-emerald-500">Active</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {session?.user?.subscriptionPlan === "free" ? (
              <Link
                href="/pricing"
                className="block w-full py-2.5 text-center bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/95 transition-all"
              >
                Upgrade Plan
              </Link>
            ) : (
              <div className="text-[10px] text-center text-muted-foreground">
                You are utilizing a premium tier.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
