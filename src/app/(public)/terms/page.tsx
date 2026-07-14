import React from "react";

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-foreground">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated: July 14, 2026</p>
      </div>

      <div className="prose prose-slate dark:prose-invert text-sm text-foreground space-y-6 leading-relaxed font-medium">
        <p>
          Welcome to ConvertFlow. By accessing our website, uploading files, or using our file conversion engine, you agree to comply with and be bound by the following Terms of Service.
        </p>

        <h2 className="text-lg font-bold border-b border-border/40 pb-2">1. Account Storage & Fair Usage</h2>
        <p>
          ConvertFlow provides cloud-based storage allocations:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Free Plan:</strong> Accounts receive 500 MB storage quota with a 25 MB max upload limit per file. Daily conversion rates are monitored.
          </li>
          <li>
            <strong>Pro Plan:</strong> Accounts receive 5 GB storage quota with a 250 MB max upload limit.
          </li>
          <li>
            <strong>Guest Mode:</strong> Guests receive temporary storage of up to 10 MB per file, which expires in 1 hour.
          </li>
        </ul>

        <h2 className="text-lg font-bold border-b border-border/40 pb-2">2. Prohibited Content</h2>
        <p>
          You are solely responsible for all content uploaded to our MongoDB servers. You may not upload files that contain malicious code, scripts, or viruses designed to disrupt or exploit the conversion environment.
        </p>

        <h2 className="text-lg font-bold border-b border-border/40 pb-2">3. Limitation of Liability</h2>
        <p>
          We do not guarantee error-free conversions for corrupt files. If a conversion fails, temporary files are immediately cleaned up. In no event shall ConvertFlow be liable for lost data resulting from user-triggered permanent deletions.
        </p>
      </div>
    </div>
  );
}
