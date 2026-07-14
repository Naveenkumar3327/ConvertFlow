"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, ArrowRight, User as UserIcon, LogOut, ChevronDown, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const categories = [
    { name: "PDF Tools", href: "/tools#pdf", desc: "Merge, split, compress & convert PDFs" },
    { name: "Image Tools", href: "/tools#image", desc: "Convert, resize & compress images" },
    { name: "Document Tools", href: "/tools#document", desc: "Word to PDF, Markdown to HTML" },
    { name: "Audio Tools", href: "/tools#audio", desc: "MP3, WAV, M4A conversion" },
    { name: "Video Tools", href: "/tools#video", desc: "MP4, WebM compress & convert" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass shadow-xs border-b border-border/40 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                ConvertFlow
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 items-center">
            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                onBlur={() => setTimeout(() => setToolsDropdownOpen(false), 200)}
                className="flex items-center space-x-1 text-sm font-medium text-muted hover:text-foreground transition-colors cursor-pointer py-2"
              >
                <span>All Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {toolsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-72 rounded-2xl bg-card border border-border shadow-xl p-3 z-50"
                  >
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          className="block p-3 rounded-xl hover:bg-muted/10 transition-colors"
                        >
                          <div className="text-sm font-semibold text-foreground">{cat.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{cat.desc}</div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/pricing" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          {/* Action Buttons & Session Control */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:bg-muted/15 p-1.5 rounded-full border border-border transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                    {session.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.user.image} alt={session.user.name || "User"} className="object-cover w-full h-full" />
                    ) : (
                      session.user?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <span className="max-w-[100px] truncate">{session.user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground pr-1" />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-xl p-2 z-50"
                    >
                      <div className="px-3 py-2 border-b border-border/50">
                        <div className="text-xs text-muted-foreground font-medium">Logged in as</div>
                        <div className="text-sm font-semibold truncate text-foreground">{session.user?.email}</div>
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted/10 transition-colors"
                        >
                          <UserIcon className="w-4.5 h-4.5 text-muted-foreground" />
                          <span>My Workspace</span>
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-error hover:bg-red-500/5 transition-colors text-left"
                        >
                          <LogOut className="w-4.5 h-4.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/50 bg-card overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              <div className="space-y-1">
                <span className="block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  File Tools
                </span>
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium text-foreground hover:bg-muted/10 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <div className="border-t border-border/50 my-2 pt-2 space-y-1">
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-foreground hover:bg-muted/10 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-foreground hover:bg-muted/10 transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-foreground hover:bg-muted/10 transition-colors"
                >
                  Contact
                </Link>
              </div>

              <div className="border-t border-border/50 pt-4 flex flex-col space-y-2">
                {session ? (
                  <>
                    <div className="px-3 text-sm text-muted-foreground truncate">
                      Signed in as <strong>{session.user?.email}</strong>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted/10 text-base font-semibold transition-colors"
                    >
                      <span>Go to Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 text-error hover:bg-red-500/15 text-base font-semibold transition-colors text-left"
                    >
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted/10 text-base font-semibold transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold shadow-md hover:bg-primary/90 transition-all"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
