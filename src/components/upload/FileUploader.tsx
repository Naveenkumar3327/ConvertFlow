"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Upload,
  File as FileIcon,
  Check,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  RefreshCw,
  X,
  Settings,
  Shield,
  FileCode,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to map extensions to category
const getFileCategory = (ext: string): string => {
  const e = ext.toLowerCase();
  if (e === "pdf") return "pdf";
  if (["doc", "docx", "txt", "rtf", "md", "html"].includes(e)) return "document";
  if (["jpg", "jpeg", "png", "webp", "svg", "heic"].includes(e)) return "image";
  if (["xls", "xlsx", "csv"].includes(e)) return "spreadsheet";
  if (["ppt", "pptx"].includes(e)) return "presentation";
  if (["mp3", "wav", "m4a", "aac", "ogg"].includes(e)) return "audio";
  if (["mp4", "avi", "mov", "mkv", "webm"].includes(e)) return "video";
  return "document";
};

// Map input formats to compatible outputs
const getCompatibleOutputs = (ext: string): string[] => {
  const e = ext.toLowerCase();
  switch (e) {
    case "pdf":
      return ["docx", "xlsx", "pptx", "jpg", "png", "txt"];
    case "docx":
    case "doc":
      return ["pdf", "txt", "html", "doc", "docx"];
    case "txt":
      return ["pdf", "docx"];
    case "md":
      return ["pdf", "html"];
    case "html":
      return ["pdf", "docx"];
    case "rtf":
      return ["docx"];
    case "jpg":
    case "jpeg":
      return ["png", "webp", "pdf"];
    case "png":
      return ["jpg", "webp", "pdf"];
    case "webp":
      return ["jpg", "png"];
    case "svg":
      return ["png", "jpg"];
    case "heic":
      return ["jpg"];
    case "xlsx":
    case "xls":
      return ["csv", "pdf", "xlsx", "xls"];
    case "csv":
      return ["xlsx", "pdf"];
    case "pptx":
    case "ppt":
      return ["pdf", "pptx", "ppt"];
    case "mp3":
      return ["wav", "ogg"];
    case "wav":
      return ["mp3", "ogg"];
    case "m4a":
    case "aac":
    case "ogg":
      return ["mp3"];
    case "mp4":
      return ["avi", "mov", "mkv", "webm", "mp3"];
    case "avi":
    case "mov":
    case "mkv":
    case "webm":
      return ["mp4", "mp3"];
    default:
      return ["pdf"];
  }
};

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case "pdf":
      return "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";
    case "document":
      return "text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20";
    case "image":
      return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
    case "spreadsheet":
      return "text-green-600 bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-600/20";
    case "presentation":
      return "text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20";
    case "audio":
      return "text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
    case "video":
      return "text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20";
    default:
      return "text-slate-500 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20";
  }
};

export default function FileUploader() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "processing" | "completed" | "failed"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [convertedFileId, setConvertedFileId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // Custom Options (Image compression / PDF security)
  const [imageQuality, setImageQuality] = useState<number>(85);
  const [pdfPassword, setPdfPassword] = useState<string>("");

  // Storage Limit check sizes (in bytes)
  const maxUploadSize = session
    ? session.user.role === "premium"
      ? 262144000 // 250 MB
      : 26214400 // 25 MB
    : 10485760; // 10 MB Guest limit

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    setError(null);
    const ext = file.name.split(".").pop() || "";
    const category = getFileCategory(ext);

    if (file.size > maxUploadSize) {
      const mbLimit = maxUploadSize / 1024 / 1024;
      setError(`File is too large. Maximum size allowed is ${mbLimit}MB.`);
      return false;
    }

    const compatible = getCompatibleOutputs(ext);
    if (compatible.length === 0) {
      setError("This file format is not supported for conversion.");
      return false;
    }

    setSelectedFile(file);
    setTargetFormat(compatible[0]); // default to first compatible format
    setStatus("idle");
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const resetUploader = () => {
    setSelectedFile(null);
    setTargetFormat("");
    setError(null);
    setStatus("idle");
    setProgress(0);
    setConvertedFileId(null);
    setShowConfig(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerUpload = async () => {
    if (!selectedFile || !targetFormat) return;

    setStatus("uploading");
    setProgress(10);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("targetFormat", targetFormat);
    formData.append("imageQuality", String(imageQuality));
    formData.append("pdfPassword", pdfPassword);

    try {
      // Step 1: Upload File
      setProgress(30);
      const uploadRes = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.error || "File upload failed");
      }

      const fileData = await uploadRes.json();
      const fileId = fileData.fileId;

      setProgress(60);
      setStatus("processing");

      // Step 2: Trigger/Queue Conversion Job
      const convertRes = await fetch("/api/conversions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          targetFormat,
          options: { imageQuality, pdfPassword },
        }),
      });

      if (!convertRes.ok) {
        throw new Error("Failed to start conversion job");
      }

      const jobData = await convertRes.json();
      const jobId = jobData.jobId;

      // Step 3: Poll status
      let pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/conversions/${jobId}/status`);
          if (!statusRes.ok) return;

          const statusData = await statusRes.json();
          setProgress(60 + Math.floor(statusData.progress * 0.4));

          if (statusData.status === "completed") {
            clearInterval(pollInterval);
            setConvertedFileId(fileId);
            setStatus("completed");
            setProgress(100);
            router.refresh();
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval);
            setError(statusData.errorMessage || "Conversion failed");
            setStatus("failed");
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setError("Error monitoring conversion status");
          setStatus("failed");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus("failed");
    }
  };

  const fileExtension = selectedFile?.name.split(".").pop() || "";
  const fileCategory = selectedFile ? getFileCategory(fileExtension) : "";
  const compatibleOutputs = selectedFile ? getCompatibleOutputs(fileExtension) : [];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100 dark:shadow-none">
        <AnimatePresence mode="wait">
          {/* STATE 1: Dropzone */}
          {status === "idle" && !selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className={`relative group border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? "border-primary bg-primary/5 scale-98"
                  : "border-border hover:border-primary/60 hover:bg-muted/5"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="w-14 h-14 rounded-2xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-all mb-4 text-primary shadow-xs">
                <Upload className="w-7 h-7 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h3 className="text-base font-semibold text-foreground text-center">
                Drag and drop your file here
              </h3>
              <p className="text-sm text-muted-foreground text-center mt-1.5">
                or <span className="text-primary font-medium hover:underline">browse files</span> from your device
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
                <span className="px-2 py-1 bg-muted/10 rounded-md border border-border">PDF</span>
                <span className="px-2 py-1 bg-muted/10 rounded-md border border-border">Word</span>
                <span className="px-2 py-1 bg-muted/10 rounded-md border border-border">Images</span>
                <span className="px-2 py-1 bg-muted/10 rounded-md border border-border">Excel</span>
                <span className="px-2 py-1 bg-muted/10 rounded-md border border-border">Audio/Video</span>
              </div>
              {!session && (
                <div className="mt-8 flex items-center gap-1.5 text-[11px] text-muted-foreground bg-amber-500/5 px-3 py-1.5 rounded-full border border-amber-500/10">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>Guest limit: 10MB. Files deleted automatically after 1 hour.</span>
                </div>
              )}
            </motion.div>
          )}

          {/* STATE 2: File Selected / Settings Panel */}
          {selectedFile && (status === "idle" || status === "failed") && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-border/80">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`p-3 border rounded-xl flex items-center justify-center ${getCategoryColor(fileCategory)}`}>
                    <FileIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={resetUploader}
                  className="p-1.5 hover:bg-muted/15 rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Format selection */}
              <div>
                <label className="text-sm font-bold text-foreground">Convert to:</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-2.5">
                  {compatibleOutputs.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setTargetFormat(fmt)}
                      className={`py-2 px-3 border text-sm font-semibold rounded-xl text-center capitalize transition-all cursor-pointer ${
                        targetFormat === fmt
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10"
                          : "bg-card text-foreground hover:bg-muted/10 border-border"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced settings toggler */}
              {["jpg", "png", "webp"].includes(targetFormat.toLowerCase()) && (
                <div className="border-t border-border/40 pt-4">
                  <button
                    onClick={() => setShowConfig(!showConfig)}
                    className="flex items-center space-x-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Settings2 className="w-4.5 h-4.5" />
                    <span>Advanced Options</span>
                  </button>
                  {showConfig && (
                    <div className="mt-4 p-4 bg-muted/5 border border-border rounded-xl space-y-4">
                      <div>
                        <label className="text-xs font-bold text-foreground flex justify-between">
                          <span>Quality</span>
                          <span>{imageQuality}%</span>
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={imageQuality}
                          onChange={(e) => setImageQuality(Number(e.target.value))}
                          className="w-full mt-2 accent-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PDF Output Options */}
              {targetFormat.toLowerCase() === "pdf" && (
                <div className="border-t border-border/40 pt-4">
                  <button
                    onClick={() => setShowConfig(!showConfig)}
                    className="flex items-center space-x-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Settings className="w-4.5 h-4.5" />
                    <span>Security Options</span>
                  </button>
                  {showConfig && (
                    <div className="mt-4 p-4 bg-muted/5 border border-border rounded-xl">
                      <div>
                        <label className="text-xs font-bold text-foreground">Password Protect Converted PDF</label>
                        <input
                          type="password"
                          placeholder="Set PDF Owner Password"
                          value={pdfPassword}
                          onChange={(e) => setPdfPassword(e.target.value)}
                          className="w-full px-3 py-2 mt-2 bg-card border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Box */}
              {error && (
                <div className="flex items-start space-x-2 p-3.5 bg-red-500/5 text-error rounded-xl border border-red-500/10 text-xs">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Convert Button */}
              <button
                onClick={triggerUpload}
                disabled={!targetFormat}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-md hover:bg-primary/95 transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <span>Convert File</span>
              </button>
            </motion.div>
          )}

          {/* STATE 3: Conversion Progress */}
          {(status === "uploading" || status === "processing") && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="py-10 flex flex-col items-center justify-center text-center space-y-5"
            >
              <div className="relative flex items-center justify-center">
                {/* Spinner */}
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <span className="absolute text-xs font-bold text-foreground">{progress}%</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground capitalize">
                  {status} file...
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {status === "uploading"
                    ? "Streaming your file directly into secure MongoDB GridFS storage bucket."
                    : "Processing conversion on the server. This may take a few seconds."}
                </p>
              </div>
              <div className="w-full max-w-xs bg-muted/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* STATE 4: Conversion Completed */}
          {status === "completed" && convertedFileId && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="py-6 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-14 h-14 rounded-full bg-success/15 border border-success/20 flex items-center justify-center text-success">
                <Check className="w-6.5 h-6.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Conversion Successful!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Your file has been converted to <strong>{targetFormat.toUpperCase()}</strong>.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 w-full pt-2">
                <a
                  href={`/api/files/${convertedFileId}/preview`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-1.5 py-2.5 bg-card border border-border text-foreground hover:bg-muted/10 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview File</span>
                </a>
                <a
                  href={`/api/files/${convertedFileId}/download`}
                  className="flex items-center justify-center space-x-1.5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-sm font-semibold transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </a>
              </div>

              <button
                onClick={resetUploader}
                className="flex items-center space-x-1.5 text-xs text-muted hover:text-foreground font-semibold pt-4 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Convert Another File</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
