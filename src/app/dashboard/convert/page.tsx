"use client";

import React from "react";
import FileUploader from "@/components/upload/FileUploader";

export default function QuickConvertPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">Quick Conversion</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Select files from your device, choose the target format, adjust parameters, and execute.
        </p>
      </div>

      <div className="bg-gradient-to-tr from-blue-500/5 via-transparent to-violet-500/5 p-4 rounded-3xl border border-border/40">
        <FileUploader />
      </div>
    </div>
  );
}
