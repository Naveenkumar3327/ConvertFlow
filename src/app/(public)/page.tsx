import React from "react";
import FileUploader from "@/components/upload/FileUploader";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Music,
  Video,
  ShieldCheck,
  Zap,
  FolderLock,
  Cpu,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const tools = [
    { name: "PDF to Word", category: "pdf", icon: FileText, desc: "Convert PDF documents to editable Docx" },
    { name: "Word to PDF", category: "pdf", icon: FileCode, desc: "Fast conversion from Docx/Doc to PDF" },
    { name: "PDF to JPG", category: "pdf", icon: ImageIcon, desc: "Extract images from PDF pages" },
    { name: "JPG to PDF", category: "pdf", icon: FileText, desc: "Convert photo files to a single PDF document" },
    { name: "Merge PDF", category: "pdf", icon: FileText, desc: "Combine multiple PDF pages into one file" },
    { name: "Excel to PDF", category: "pdf", icon: FileText, desc: "Convert spreadsheets to PDF document view" },
    { name: "Image Converter", category: "image", icon: ImageIcon, desc: "Convert between WebP, PNG, JPG, and SVG" },
    { name: "Video to MP3", category: "video", icon: Music, desc: "Extract high-quality audio files from video" },
  ];

  const stats = [
    { val: "1.5M+", label: "Files Converted" },
    { val: "100%", label: "Secure Storage" },
    { val: "250MB+", label: "Max File Limit" },
    { val: "4.9/5", label: "User Rating" },
  ];

  const features = [
    {
      title: "MongoDB Atlas & GridFS Storage",
      desc: "All files are split into chunks and stored directly within MongoDB GridFS. Zero file URLs, zero third-party cloud storage leaks.",
      icon: FolderLock,
    },
    {
      title: "Modular Conversion Engine",
      desc: "Uses Sharp and pdf-lib directly on the server to convert images and manipulate PDFs natively with sub-second speeds.",
      icon: Cpu,
    },
    {
      title: "Bank-Grade Encryption",
      desc: "Encrypt files and protect PDFs with password validation. Control file authorization dynamically on each Next.js API request.",
      icon: ShieldCheck,
    },
    {
      title: "Instant Previews",
      desc: "Preview images, audio, video, and PDFs inline without downloading them to your filesystem. All streamed securely from DB.",
      icon: Zap,
    },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 dark:bg-violet-600/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-28">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 dark:border-blue-500/20 text-xs font-semibold text-primary">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>MongoDB-Powered Platform</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] sm:leading-[1.1]">
            Convert Any File. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Anytime. Anywhere.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            A secure all-in-one platform to convert, organize, save, and access your files from anywhere. Powered strictly by MongoDB GridFS for absolute privacy.
          </p>
        </div>

        {/* Uploader Section */}
        <div className="mt-14 sm:mt-18">
          <FileUploader />
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-card/40 py-12 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{s.val}</p>
                <p className="text-sm font-semibold text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Popular File Conversion Tools
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Convert, edit, compress, and secure your files in just a few clicks with our popular tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((t) => (
            <Link
              key={t.name}
              href={t.category === "pdf" ? "/tools#pdf" : `/tools#${t.category}`}
              className="group p-5 bg-card border border-border/80 hover:border-primary/40 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <t.icon className="w-5 h-5" />
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
              <div className="flex items-center text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-4 space-x-1">
                <span>Try Tool</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Security & MongoDB Storage Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 bg-gradient-to-br from-blue-500/5 to-violet-500/5 border border-border/60 rounded-3xl mb-24 mx-4 sm:mx-8 lg:mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 p-6 sm:p-12 items-center">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              MongoDB Atlas & GridFS Secured
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We never upload files to public S3 buckets. Original and converted files are streamed straight into encrypted database buckets. Free and guest files automatically clean themselves up, and you remain in absolute control.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 text-sm font-bold text-primary hover:underline"
              >
                <span>Create Secure Cloud Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
