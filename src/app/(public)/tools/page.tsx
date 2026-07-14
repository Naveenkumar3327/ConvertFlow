"use client";

import React, { useState, useEffect } from "react";
import FileUploader from "@/components/upload/FileUploader";
import {
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Table,
  Presentation,
  FileCode,
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Tool {
  name: string;
  category: "pdf" | "document" | "image" | "spreadsheet" | "presentation" | "audio" | "video";
  status: "Available" | "Beta" | "Coming Soon";
  desc: string;
  icon: React.ComponentType<any>;
}

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTabHash, setActiveTabHash] = useState<string>("");

  useEffect(() => {
    // Read category from hash on load
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setSelectedCategory(hash);
      setActiveTabHash(hash);
    }
  }, []);

  const categories = [
    { id: "all", label: "All Tools", icon: HelpCircle },
    { id: "pdf", label: "PDF Tools", icon: FileText },
    { id: "image", label: "Image Tools", icon: ImageIcon },
    { id: "document", label: "Document Tools", icon: FileCode },
    { id: "spreadsheet", label: "Spreadsheet", icon: Table },
    { id: "presentation", label: "Presentation", icon: Presentation },
    { id: "audio", label: "Audio Tools", icon: Music },
    { id: "video", label: "Video Tools", icon: Video },
  ];

  const tools: Tool[] = [
    // PDF
    { name: "PDF to Word", category: "pdf", status: "Available", desc: "Convert PDF documents to editable Docx", icon: FileText },
    { name: "Word to PDF", category: "pdf", status: "Available", desc: "Fast conversion from Docx/Doc to PDF", icon: FileCode },
    { name: "PDF to JPG", category: "pdf", status: "Available", desc: "Extract images from PDF pages", icon: ImageIcon },
    { name: "JPG to PDF", category: "pdf", status: "Available", desc: "Convert photo files to a single PDF document", icon: FileText },
    { name: "Merge PDF", category: "pdf", status: "Available", desc: "Combine multiple PDF pages into one file", icon: FileText },
    { name: "Split PDF", category: "pdf", status: "Available", desc: "Extract specific pages from a PDF document", icon: FileText },
    { name: "Rotate PDF", category: "pdf", status: "Available", desc: "Rotate specific or all pages of a PDF", icon: FileText },
    { name: "Protect PDF", category: "pdf", status: "Available", desc: "Secure your PDF with custom owner password protection", icon: FileText },
    { name: "Compress PDF", category: "pdf", status: "Beta", desc: "Reduce file size of PDFs while maintaining quality", icon: FileText },

    // Image
    { name: "JPG to PNG", category: "image", status: "Available", desc: "Convert JPG images to PNG transparent format", icon: ImageIcon },
    { name: "PNG to JPG", category: "image", status: "Available", desc: "Convert PNG transparent images to JPG", icon: ImageIcon },
    { name: "JPG to WebP", category: "image", status: "Available", desc: "Compress JPG images into next-gen WebP format", icon: ImageIcon },
    { name: "PNG to WebP", category: "image", status: "Available", desc: "Compress PNG images into next-gen WebP format", icon: ImageIcon },
    { name: "WebP to JPG", category: "image", status: "Available", desc: "Convert WebP images to standard JPG format", icon: ImageIcon },
    { name: "SVG to PNG", category: "image", status: "Available", desc: "Convert vector SVG graphics into PNG format", icon: ImageIcon },
    { name: "Image Quality Adjust", category: "image", status: "Beta", desc: "Adjust quality, scaling and output dimensions", icon: ImageIcon },

    // Documents
    { name: "Markdown to HTML", category: "document", status: "Available", desc: "Convert markdown syntax to HTML markup files", icon: FileCode },
    { name: "Markdown to PDF", category: "document", status: "Available", desc: "Convert markdown syntax to readable PDF document", icon: FileText },
    { name: "DOCX to TXT", category: "document", status: "Available", desc: "Extract pure text contents from Docx documents", icon: FileText },
    { name: "TXT to DOCX", category: "document", status: "Coming Soon", desc: "Convert pure text document to standard Docx format", icon: FileCode },

    // Spreadsheets
    { name: "Excel to CSV", category: "spreadsheet", status: "Available", desc: "Convert XLSX/XLS sheets to comma-separated CSV", icon: Table },
    { name: "CSV to Excel", category: "spreadsheet", status: "Available", desc: "Convert CSV records to Excel sheet columns", icon: Table },

    // Presentations
    { name: "PPTX to PDF", category: "presentation", status: "Coming Soon", desc: "Convert PowerPoint slides into PDF document format", icon: Presentation },

    // Audio/Video
    { name: "MP3 to WAV", category: "audio", status: "Coming Soon", desc: "Convert compressed MP3 to high fidelity WAV audio", icon: Music },
    { name: "Video to MP3", category: "video", status: "Coming Soon", desc: "Extract high-quality audio files from video", icon: Music },
    { name: "MP4 to WebM", category: "video", status: "Coming Soon", desc: "Convert MP4 files into WebM video compression", icon: Video },
  ];

  const filteredTools = tools.filter((t) => {
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-emerald-500/5 border-emerald-500/10 text-emerald-500 dark:border-emerald-500/20";
      case "Beta":
        return "bg-blue-500/5 border-blue-500/10 text-blue-500 dark:border-blue-500/20";
      default:
        return "bg-slate-500/5 border-slate-500/10 text-slate-500 dark:border-slate-500/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Quick Convert Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          All Conversion Tools
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Select a category below or search for specific tools. Set your options and convert files securely from your browser.
        </p>
      </div>

      {/* Embedded Uploader */}
      <div className="bg-gradient-to-tr from-blue-500/5 via-transparent to-violet-500/5 p-4 rounded-3xl border border-border/40">
        <FileUploader />
      </div>

      {/* Tool Browser */}
      <div className="space-y-10">
        {/* Toolbar (Filters & Search) */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/40 pb-6">
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  window.history.pushState(null, "", `#${cat.id}`);
                }}
                className={`flex items-center space-x-1.5 py-2 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card border-border hover:bg-muted/10 text-foreground"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {filteredTools.map((t) => (
              <motion.div
                key={t.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="group p-5 bg-card border border-border rounded-2xl flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <t.icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/40 mt-5 pt-3.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t.category} Tool
                  </span>
                  {t.status !== "Coming Soon" ? (
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-primary group-hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Launch</span>
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Queued</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTools.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
              No conversion tools found matching your query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
