"use client";

import { useTheme } from "@/components/shared/Providers";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-border/80 hover:bg-muted/10 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-primary/40 relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="light"
            initial={{ y: 15, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -15, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.15 }}
          >
            <Moon className="w-5 h-5 text-slate-700" />
          </motion.div>
        ) : (
          <motion.div
            key="dark"
            initial={{ y: 15, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -15, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.15 }}
          >
            <Sun className="w-5 h-5 text-amber-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
