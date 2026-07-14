import React from "react";
import { FolderLock, Zap, Users, ShieldAlert } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          About ConvertFlow
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          We are committed to building secure, modern tools that keep user file privacy at the absolute center of our technology.
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-foreground space-y-6 leading-relaxed font-medium">
        <h2 className="text-xl font-bold border-b border-border/40 pb-2">Our Mission</h2>
        <p>
          ConvertFlow was built to solve a simple problem: most online file conversion tools sell user data, compromise document security, or store files in public, insecure cloud buckets (like S3) where leaks occur. We wanted to build an all-in-one suite that gives users high-quality conversions, combined with a **personal cloud file manager** that stores everything securely in a database.
        </p>

        <h2 className="text-xl font-bold border-b border-border/40 pb-2 pt-6">How We Strive for Security</h2>
        <p>
          Instead of standard disk storage or public URLs, ConvertFlow routes all file data into **MongoDB Atlas using GridFS**. Files are chunked and written directly to the database. File permissions are verified on every request. Guest conversions expire instantly after 1 hour, keeping our servers clean.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          <div className="p-5 border border-border bg-card rounded-2xl space-y-3">
            <FolderLock className="w-8 h-8 text-primary" />
            <h3 className="text-sm font-bold">100% Private Storage</h3>
            <p className="text-xs text-muted-foreground">
              Files are saved as binary chunks inside GridFS buckets and retrieved only after user session verification.
            </p>
          </div>
          <div className="p-5 border border-border bg-card rounded-2xl space-y-3">
            <Zap className="w-8 h-8 text-primary" />
            <h3 className="text-sm font-bold">Modular Conversion Engine</h3>
            <p className="text-xs text-muted-foreground">
              Sharp and pdf-lib handle core image operations and PDF merging instantly right on the server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
