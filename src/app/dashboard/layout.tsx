"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import {
  Folder,
  LayoutDashboard,
  FileCode,
  Star,
  Trash2,
  Settings,
  Menu,
  X,
  Bell,
  Sparkles,
  LogOut,
  HardDrive,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync dashboard stats & notifications
  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.statistics);
      }
      
      const notifRes = await fetch("/api/notifications");
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications);
        setUnreadCount(notifData.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchDashboardStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const markAllNotificationsAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const menuItems = [
    { name: "Workspace Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Quick Convert", href: "/dashboard/convert", icon: FileCode },
    { name: "My Files", href: "/dashboard/files", icon: Folder },
    { name: "Favorites", href: "/dashboard/favorites", icon: Star },
    { name: "Trash", href: "/dashboard/trash", icon: Trash2 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/80 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex flex-col space-y-6 overflow-y-auto grow">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                ConvertFlow
              </span>
            </Link>
            <button className="md:hidden text-muted hover:text-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5 pt-4">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                      : "text-muted hover:bg-muted/10 hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Storage Limit meter in Sidebar bottom */}
        <div className="p-5 border-t border-border/50 space-y-4">
          {stats && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-primary" />
                  <span>Cloud Storage</span>
                </span>
                <span className="text-foreground">{stats.storagePercent}%</span>
              </div>
              <div className="w-full bg-muted/20 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${stats.storagePercent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {(stats.storageUsed / 1024 / 1024).toFixed(1)}MB of {(stats.storageLimit / 1024 / 1024).toFixed(0)}MB used
              </p>
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-semibold text-error hover:bg-red-500/5 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border/80 flex items-center justify-between px-6 bg-card shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-foreground capitalize hidden sm:block">
              {pathname === "/dashboard" ? "Workspace overview" : pathname.split("/").pop()?.replace("-", " ")}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen && unreadCount > 0) {
                    markAllNotificationsAsRead();
                  }
                }}
                className="p-2.5 rounded-xl border border-border/80 hover:bg-muted/10 text-muted-foreground hover:text-foreground transition-all relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl bg-card border border-border shadow-2xl p-2 z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="px-3 py-2 border-b border-border/50 flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] text-primary font-bold">{unreadCount} new</span>
                      )}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`p-3 rounded-xl text-left border border-transparent transition-colors ${
                              notif.read ? "bg-card hover:bg-muted/5" : "bg-primary/5 hover:bg-primary/10 border-primary/10"
                            }`}
                          >
                            <h4 className="text-xs font-bold text-foreground">{notif.title}</h4>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-muted-foreground mt-2 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt={session.user.name || "U"} className="object-cover w-full h-full" />
                ) : (
                  session.user?.name?.charAt(0) || "U"
                )}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-foreground">{session.user?.name}</p>
                <p className="text-[10px] text-muted-foreground font-semibold capitalize mt-0.5">
                  {session.user?.role} Tier
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background relative">
          {children}
        </main>
      </div>
    </div>
  );
}
