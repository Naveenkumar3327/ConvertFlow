"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Music,
  Video,
  Table,
  Upload,
  FolderOpen,
  Settings,
  Eye,
  Download,
  Trash,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  HardDrive,
} from "lucide-react";
import { motion } from "framer-motion";

const categoryMeta: any = {
  pdf: { label: "PDFs", icon: FileText, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  document: { label: "Documents", icon: FileCode, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  image: { label: "Images", icon: ImageIcon, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  spreadsheet: { label: "Spreadsheets", icon: Table, color: "text-green-600 bg-green-600/10 border-green-600/20" },
  presentation: { label: "Slides", icon: FileCode, color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  audio: { label: "Audios", icon: Music, color: "text-amber-500 bg-amber-500/10 border-amber-200/20" },
  video: { label: "Videos", icon: Video, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
};

export default function WorkspaceOverview() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this file? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/files/${id}/permanent`, { method: "DELETE" });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-muted/40 w-1/4 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-muted/40 rounded-2xl" />
          <div className="h-32 bg-muted/40 rounded-2xl" />
          <div className="h-32 bg-muted/40 rounded-2xl" />
        </div>
        <div className="h-64 bg-muted/40 rounded-2xl" />
      </div>
    );
  }

  const stats = data?.statistics;
  const recentFiles = data?.recentFiles || [];
  const activities = data?.recentActivities || [];

  return (
    <div className="space-y-10">
      {/* Welcome & Quick actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">Welcome Back!</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Convert, organize, and access your secured files inside MongoDB.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/convert"
            className="flex items-center space-x-1.5 py-2.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/95 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Quick Convert</span>
          </Link>
          <Link
            href="/dashboard/files"
            className="flex items-center space-x-1.5 py-2.5 px-4 bg-card border border-border text-foreground hover:bg-muted/10 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>My Files Drive</span>
          </Link>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Drive Capacity</span>
            <HardDriveIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground">{stats?.storagePercent}%</p>
            <div className="w-full bg-muted/20 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${stats?.storagePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {((stats?.storageUsed || 0) / 1024 / 1024).toFixed(1)}MB used of{" "}
              {((stats?.storageLimit || 0) / 1024 / 1024).toFixed(0)}MB
            </p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversions</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground">{stats?.totalConverted}</p>
            <p className="text-[10px] text-muted-foreground mt-2">
              Successfully processed and saved to your converted bucket.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Uploads</span>
            <ImageIcon className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground">{stats?.totalFiles}</p>
            <p className="text-[10px] text-muted-foreground mt-2">
              Files currently stored in your originalFiles MongoDB bucket.
            </p>
          </div>
        </div>
      </div>

      {/* Layout Split: Categories & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories (Left) */}
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-foreground">File Category Breakdown</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Distribution of files saved inside ConvertFlow Drive.</p>
          </div>
          <div className="space-y-3.5">
            {data?.categoryDistribution.map((c: any) => {
              const meta = categoryMeta[c.name] || { label: c.name, icon: HelpCircle, color: "text-slate-500" };
              const Icon = meta.icon;
              return (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold">
                      <div className={`p-1.5 rounded-lg border ${meta.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="capitalize">{meta.label}</span>
                    </span>
                    <span className="font-bold text-muted-foreground">{c.value} files</span>
                  </div>
                </div>
              );
            })}
            {data?.categoryDistribution.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No files uploaded to your drive yet.
              </div>
            )}
          </div>
        </div>

        {/* Activity Logs (Right) */}
        <div className="lg:col-span-1 bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Your latest platform interactions.</p>
          </div>
          <div className="space-y-4">
            {activities.map((act: any) => (
              <div key={act._id} className="flex gap-3 text-xs items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-foreground font-semibold leading-relaxed">{act.description}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(act.createdAt).toLocaleDateString()} {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No active logs registered yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Files Table */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-foreground">Recent Files</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Quick access to recently processed files.</p>
          </div>
          <Link href="/dashboard/files" className="text-xs font-bold text-primary hover:underline">
            View All Files
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {recentFiles.map((file: any) => {
                const meta = categoryMeta[file.fileCategory] || { icon: HelpCircle, color: "text-slate-500" };
                const Icon = meta.icon;
                return (
                  <tr key={file._id} className="hover:bg-muted/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground truncate max-w-[200px]">
                      {file.displayFileName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1">
                        <Icon className="w-4.5 h-4.5 text-muted-foreground" />
                        <span className="capitalize text-[10px]">{file.originalFormat} → {file.outputFormat}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {(file.originalFileSize / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-bold capitalize ${
                          file.conversionStatus === "completed"
                            ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10"
                            : file.conversionStatus === "failed"
                            ? "bg-red-500/5 text-red-500 border-red-500/10"
                            : "bg-amber-500/5 text-amber-500 border-amber-500/10"
                        }`}
                      >
                        {file.conversionStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/api/files/${file._id}/preview`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 border border-border hover:bg-muted/10 rounded-lg text-muted-foreground hover:text-foreground transition-all"
                          title="Preview Inline"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={`/api/files/${file._id}/download`}
                          className="p-1.5 border border-border hover:bg-muted/10 rounded-lg text-muted-foreground hover:text-foreground transition-all"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handlePermanentDelete(file._id)}
                          className="p-1.5 border border-red-500/10 hover:bg-red-500/5 rounded-lg text-red-500 transition-all cursor-pointer"
                          title="Delete Permanent"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {recentFiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    No files processed in this workspace yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HardDriveIcon(props: React.SVGProps<SVGSVGElement>) {
  return <HardDrive className={props.className} />;
}
