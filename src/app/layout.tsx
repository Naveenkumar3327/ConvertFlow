import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/shared/Providers";

export const metadata: Metadata = {
  title: "ConvertFlow — All-in-One Online File Converter and Personal File Manager",
  description:
    "Securely upload, convert, preview, and download files of any format. Manage your documents, images, sheets, presentations, and audio/video files in a private personal cloud built on MongoDB GridFS.",
  keywords: [
    "file converter",
    "pdf tools",
    "image converter",
    "convert docx to pdf",
    "compress pdf",
    "audio converter",
    "video converter",
    "cloud file manager",
    "secure file storage",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
