import React from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const toolLinks = [
    { name: "PDF Converter", href: "/tools#pdf" },
    { name: "Image Converter", href: "/tools#image" },
    { name: "Doc Converter", href: "/tools#document" },
    { name: "Audio Tools", href: "/tools#audio" },
    { name: "Video Tools", href: "/tools#video" },
  ];

  const resourceLinks = [
    { name: "Pricing Plans", href: "/pricing" },
    { name: "FAQ", href: "/faq" },
    { name: "File Security", href: "/security" },
  ];

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ];

  return (
    <footer className="w-full bg-card border-t border-border/40 py-12 transition-all mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Intro */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                ConvertFlow
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              A private, secure, and lightning-fast web platform to convert, preview, download, and organize files in a MongoDB-powered personal cloud.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Tools</h3>
            <ul className="space-y-2.5">
              {toolLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Company</h3>
            <ul className="space-y-2.5 mb-6">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} ConvertFlow. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Built securely using MongoDB Atlas & GridFS.
          </p>
        </div>
      </div>
    </footer>
  );
}
