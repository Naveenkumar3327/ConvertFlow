"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Music,
  Video,
  Table,
  Search,
  Grid,
  List,
  Eye,
  Download,
  Star,
  Trash,
  Edit3,
  HelpCircle,
  TrendingDown,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categoryMeta: any = {
  pdf: { label: "PDFs", icon: FileText, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  document: { label: "Documents", icon: FileCode, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  image: { label: "Images", icon: ImageIcon, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  spreadsheet: { label: "Spreadsheets", icon: Table, color: "text-green-600 bg-green-600/10 border-green-600/20" },
  presentation: { label: "Slides", icon: FileCode, color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  audio: { label: "Audios", icon: Music, color: "text-amber-500 bg-amber-500/10 border-amber-200/20" },
  video: { label: "Videos", icon: Video, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
};

export default function MyFilesPage() {
  // Query state
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Actions
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const url = `/api/files?search=${encodeURIComponent(searchQuery)}&category=${categoryFilter}&sort=${sortBy}&status=workspace`;
      const res = await fetch(url);
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
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, sortBy]);

  const toggleFavorite = async (id: string, currentFav: boolean) => {
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !currentFav }),
      });
      if (res.ok) {
        setFiles(files.map((f) => (f._id === id ? { ...f, isFavorite: !currentFav } : f)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const softDeleteFile = async (id: string) => {
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFiles(files.filter((f) => f._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renameFile = async (id: string) => {
    if (!newFileName.trim()) return;
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayFileName: newFileName }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFiles(files.map((f) => (f._id === id ? { ...f, displayFileName: updated.file.displayFileName } : f)));
        setEditingFileId(null);
        setNewFileName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Group files helper
  const groupFilesByDate = (fileList: any[]) => {
    const groups: { [key: string]: any[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    fileList.forEach((file) => {
      const uploadDate = new Date(file.uploadedAt);
      if (uploadDate >= today) {
        groups.Today.push(file);
      } else if (uploadDate >= yesterday) {
        groups.Yesterday.push(file);
      } else if (uploadDate >= sevenDaysAgo) {
        groups["Previous 7 Days"].push(file);
      } else {
        groups.Older.push(file);
      }
    });

    return groups;
  };

  const fileGroups = groupFilesByDate(files);
  const categoriesList = [
    { id: "all", label: "All" },
    { id: "pdf", label: "PDF" },
    { id: "image", label: "Images" },
    { id: "document", label: "Documents" },
    { id: "spreadsheet", label: "Spreadsheets" },
    { id: "audio", label: "Audios" },
    { id: "video", label: "Videos" },
  ];

  return (
    <div className="space-y-8">
      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/40 pb-6">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex bg-card border border-border rounded-xl p-1 gap-1">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  categoryFilter === cat.id ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A-Z</option>
            <option value="size">Largest first</option>
          </select>

          {/* Grid/List toggler */}
          <div className="flex border border-border rounded-xl p-0.5 bg-card shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-muted/20 text-foreground" : "text-muted"}`}
            >
              <Grid className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "list" ? "bg-muted/20 text-foreground" : "text-muted"}`}
            >
              <List className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground mt-3 font-semibold">Loading your MongoDB file drive...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-border rounded-2xl">
          <HelpCircle className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-sm font-bold text-foreground mt-3">No Files Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            You don't have any files matching this query. Upload or convert a file to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(fileGroups).map(([groupName, groupList]) => {
            if (groupList.length === 0) return null;
            return (
              <div key={groupName} className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{groupName}</h3>
                
                {viewMode === "grid" ? (
                  /* GRID VIEW */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupList.map((file) => {
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
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => toggleFavorite(file._id, file.isFavorite)}
                                  className="p-1.5 hover:bg-muted/10 rounded-lg cursor-pointer"
                                >
                                  <Star className={`w-4 h-4 ${file.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingFileId(file._id);
                                    setNewFileName(file.displayFileName);
                                  }}
                                  className="p-1.5 hover:bg-muted/10 rounded-lg cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4 text-muted hover:text-foreground" />
                                </button>
                              </div>
                            </div>

                            <div>
                              {editingFileId === file._id ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    className="px-2 py-1 bg-background border border-border rounded-lg text-xs w-full focus:outline-hidden"
                                    autoFocus
                                  />
                                  <button onClick={() => renameFile(file._id)} className="px-2 py-1 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold">Save</button>
                                  <button onClick={() => setEditingFileId(null)} className="px-2 py-1 bg-muted/10 rounded-lg text-[10px] text-foreground">X</button>
                                </div>
                              ) : (
                                <h4 className="text-xs font-bold text-foreground truncate" title={file.displayFileName}>
                                  {file.displayFileName}
                                </h4>
                              )}
                              <p className="text-[10px] text-muted-foreground mt-1 capitalize font-medium">
                                {file.originalFormat} → {file.outputFormat} • {(file.originalFileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-border/40 mt-5 pt-3.5 flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold capitalize ${
                              file.conversionStatus === "completed"
                                ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10"
                                : file.conversionStatus === "failed"
                                ? "bg-red-500/5 text-red-500 border-red-500/10"
                                : "bg-amber-500/5 text-amber-500 border-amber-500/10"
                            }`}>
                              {file.conversionStatus}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`/api/files/${file._id}/preview`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 border border-border hover:bg-muted/10 rounded-lg text-muted-foreground hover:text-foreground transition-all"
                                title="Preview inline"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`/api/files/${file._id}/download`}
                                className="p-1.5 border border-border hover:bg-muted/10 rounded-lg text-muted-foreground hover:text-foreground transition-all"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => softDeleteFile(file._id)}
                                className="p-1.5 border border-red-500/10 hover:bg-red-500/5 rounded-lg text-red-500 transition-all cursor-pointer"
                                title="Move to Trash"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* LIST VIEW */
                  <div className="bg-card border border-border/80 rounded-2xl shadow-xs divide-y divide-border/40 overflow-hidden font-medium text-xs">
                    {groupList.map((file) => {
                      const meta = categoryMeta[file.fileCategory] || { icon: HelpCircle, color: "text-slate-500" };
                      const Icon = meta.icon;
                      return (
                        <div key={file._id} className="p-4 hover:bg-muted/5 transition-colors flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div className={`p-2 rounded-lg border ${meta.color} flex items-center justify-center shrink-0`}>
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              {editingFileId === file._id ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    className="px-2 py-0.5 bg-background border border-border rounded-lg text-xs"
                                    autoFocus
                                  />
                                  <button onClick={() => renameFile(file._id)} className="px-2 py-0.5 bg-primary text-primary-foreground rounded-lg text-[9px] font-bold">Save</button>
                                  <button onClick={() => setEditingFileId(null)} className="px-2 py-0.5 bg-muted/10 rounded-lg text-[9px]">Cancel</button>
                                </div>
                              ) : (
                                <h4 className="text-xs font-bold text-foreground truncate max-w-[240px]">
                                  {file.displayFileName}
                                </h4>
                              )}
                              <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                                {file.originalFormat} → {file.outputFormat} • {(file.originalFileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold capitalize ${
                              file.conversionStatus === "completed"
                                ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10"
                                : file.conversionStatus === "failed"
                                ? "bg-red-500/5 text-red-500 border-red-500/10"
                                : "bg-amber-500/5 text-amber-500 border-amber-500/10"
                            }`}>
                              {file.conversionStatus}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleFavorite(file._id, file.isFavorite)}
                                className="p-1.5 hover:bg-muted/10 rounded-lg"
                              >
                                <Star className={`w-4 h-4 ${file.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                              </button>
                              <a
                                href={`/api/files/${file._id}/preview`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 hover:bg-muted/10 rounded-lg text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              <a
                                href={`/api/files/${file._id}/download`}
                                className="p-1.5 hover:bg-muted/10 rounded-lg text-muted-foreground hover:text-foreground"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => softDeleteFile(file._id)}
                                className="p-1.5 hover:bg-red-500/5 rounded-lg text-red-500 cursor-pointer"
                              >
                                <Trash className="w-4 h-4" />
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
          })}
        </div>
      )}
    </div>
  );
}
