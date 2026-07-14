"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Music,
  Video,
  Table,
  RotateCcw,
  Trash,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

const categoryMeta: any = {
  pdf: { label: "PDFs", icon: FileText, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  document: { label: "Documents", icon: FileCode, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  image: { label: "Images", icon: ImageIcon, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  spreadsheet: { label: "Spreadsheets", icon: Table, color: "text-green-600 bg-green-600/10 border-green-600/20" },
  presentation: { label: "Slides", icon: FileCode, color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  audio: { label: "Audios", icon: Music, color: "text-amber-500 bg-amber-500/10 border-amber-200/20" },
  video: { label: "Videos", icon: Video, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
};

export default function TrashPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrashFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files?status=trash");
      if (res.ok) {
        const payload = await res.json();
        setFiles(payload.files || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashFiles();
  }, []);

  const restoreFile = async (id: string) => {
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false }),
      });
      if (res.ok) {
        setFiles(files.filter((f) => f._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const permanentDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this file? This action is irreversible.")) return;

    try {
      const res = await fetch(`/api/files/${id}/permanent`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFiles(files.filter((f) => f._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">Trash & Recycling</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Files will remain in the trash for up to 30 days before being automatically cleaned up.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground mt-3 font-semibold">Loading trash items...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-border rounded-2xl">
          <Trash className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-sm font-bold text-foreground mt-3">Trash is Empty</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Files moved to trash from your drive will be listed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => {
            const meta = categoryMeta[file.fileCategory] || { icon: HelpCircle, color: "text-slate-500" };
            const Icon = meta.icon;
            return (
              <div
                key={file._id}
                className="bg-card border border-border/80 rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl border ${meta.color} flex items-center justify-center`}>
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-foreground truncate" title={file.displayFileName}>
                      {file.displayFileName}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1 capitalize font-semibold">
                      {file.originalFormat} → {file.outputFormat} • {(file.originalFileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/40 mt-5 pt-3.5 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Stored in GridFS
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => restoreFile(file._id)}
                      className="p-1.5 border border-border hover:bg-muted/10 rounded-lg text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                      title="Restore file"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => permanentDelete(file._id)}
                      className="p-1.5 border border-red-500/10 hover:bg-red-500/5 rounded-lg text-red-500 transition-all cursor-pointer"
                      title="Delete permanently"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
