"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users as UsersIcon,
  Activity,
  AlertTriangle,
  HardDrive,
  Cpu,
  Database,
  Terminal,
  ShieldAlert,
  Loader2,
  Lock,
  Unlock,
  CheckCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  // States
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin");
      if (!res.ok) {
        if (res.status === 403) {
          router.push("/dashboard");
        }
        return;
      }
      const payload = await res.json();
      setData(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const toggleUserStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus: nextStatus }),
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update user status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const metrics = data.metrics;
  const health = data.systemHealth;
  const users = data.users || [];
  const conversions = data.conversions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-primary" />
          <span>ConvertFlow Admin Console</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Monitor system health, manage user accounts, check GridFS capacities, and audit conversion logs.
        </p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
            <UsersIcon className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">Registered Users</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{metrics.usersCount}</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/10">
            <Activity className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">Queue Backlog</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{metrics.activeConversions}</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/10">
            <AlertTriangle className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">Job Failures</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{metrics.failedConversions}</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/10">
            <HardDrive className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">Global GridFS Storage</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">
              {(metrics.globalStorageUsed / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </div>
      </div>

      {/* Grid: System Health & Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health */}
        <div className="lg:col-span-1 bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-primary" />
            <span>System Health Diagnostics</span>
          </h3>
          <div className="space-y-4 text-xs font-medium text-foreground">
            <div className="flex justify-between border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground">MongoDB Atlas:</span>
              <span className="text-emerald-500 font-bold">{health.database}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground">Node Environment:</span>
              <span className="font-bold">{health.nodeVersion}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground">Server Host OS:</span>
              <span className="font-bold capitalize">{health.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Heap Allocation:</span>
              <span className="font-bold">{health.memoryUsage}</span>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-foreground">Registered User Workspace Permissions</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Quota</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-muted/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">{u.fullName}</td>
                    <td className="py-3 px-3 text-muted-foreground truncate max-w-[150px]">{u.email}</td>
                    <td className="py-3 px-3 capitalize font-bold text-primary">{u.subscriptionPlan}</td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {((u.storageUsed || 0) / 1024 / 1024).toFixed(1)}MB / {(u.storageLimit / 1024 / 1024).toFixed(0)}MB
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold capitalize ${
                        u.accountStatus === "active"
                          ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10"
                          : "bg-red-500/5 text-red-500 border-red-500/10"
                      }`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {actionLoadingId === u._id ? (
                        <Loader2 className="w-4 h-4 animate-spin ml-auto text-primary" />
                      ) : (
                        <button
                          onClick={() => toggleUserStatus(u._id, u.accountStatus)}
                          disabled={session?.user?.id === u._id}
                          className={`p-1 rounded-lg border transition-all cursor-pointer ${
                            u.accountStatus === "active"
                              ? "border-red-500/10 text-red-500 hover:bg-red-500/5"
                              : "border-emerald-500/10 text-emerald-500 hover:bg-emerald-500/5"
                          } disabled:opacity-50`}
                          title={u.accountStatus === "active" ? "Suspend user" : "Unsuspend user"}
                        >
                          {u.accountStatus === "active" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Conversion Jobs Logs */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Terminal className="w-4.5 h-4.5 text-primary" />
          <span>Active & Failed Conversion Queue Logs</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Job ID</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Path</th>
                <th className="py-2.5 px-3">Engine</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {conversions.map((job: any) => (
                <tr key={job._id} className="hover:bg-muted/5 transition-colors">
                  <td className="py-3 px-3 font-mono text-[10px] text-muted-foreground shrink-0">{job._id.substring(12)}</td>
                  <td className="py-3 px-3">{job.userId?.fullName || "Guest User"}</td>
                  <td className="py-3 px-3 capitalize font-semibold text-foreground">
                    {job.sourceFormat} → {job.targetFormat}
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-muted-foreground">{job.conversionEngine}</td>
                  <td className="py-3 px-3 text-muted-foreground">
                    {job.processingDuration ? `${job.processingDuration.toFixed(2)}s` : "Pending"}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold capitalize ${
                      job.status === "completed"
                        ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10"
                        : job.status === "failed"
                        ? "bg-red-500/5 text-red-500 border-red-500/10"
                        : "bg-amber-500/5 text-amber-500 border-amber-500/10"
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground truncate max-w-[200px]" title={job.errorMessage}>
                    {job.errorMessage || <span className="text-emerald-500 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Successful</span>}
                  </td>
                </tr>
              ))}
              {conversions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    No conversion logs found.
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
