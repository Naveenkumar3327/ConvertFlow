import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-foreground">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: July 14, 2026</p>
      </div>

      <div className="prose prose-slate dark:prose-invert text-sm text-foreground space-y-6 leading-relaxed font-medium">
        <p>
          At ConvertFlow, we prioritize the privacy and security of your files above all else. This Privacy Policy documents what information we collect, how it is stored, and our file retention rules.
        </p>

        <h2 className="text-lg font-bold border-b border-border/40 pb-2">1. Data Storage Architecture</h2>
        <p>
          We do not store your raw files on disk or public content delivery networks. Original, converted, and preview files are stored as binary chunks inside private, secured database buckets within our MongoDB Atlas cluster (MongoDB GridFS). Access to these files is strictly authenticated and validated.
        </p>

        <h2 className="text-lg font-bold border-b border-border/40 pb-2">2. Retention & Expiration Policy</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Guest Files:</strong> Files uploaded by guests automatically expire and are permanently deleted from the `originalFiles`, `convertedFiles`, and `previewFiles` buckets exactly **1 hour** after creation.
          </li>
          <li>
            <strong>Deleted Files:</strong> When a registered user moves a file to the Trash, the file metadata is updated. Registered users have 30 days to restore the file, after which it is permanently purged.
          </li>
          <li>
            <strong>Permanent Deletions:</strong> When you delete a file permanently, all associated documents, previews, and chunks are purged immediately and cannot be recovered.
          </li>
        </ul>

        <h2 className="text-lg font-bold border-b border-border/40 pb-2">3. Information We Collect</h2>
        <p>
          For registered users, we collect your name, email, profile image (if OAuth is used), password hashes, and user roles to manage your cloud storage quota.
        </p>
      </div>
    </div>
  );
}
