import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ShieldCheck, KeyRound, Activity, ArrowUpRight } from "lucide-react";

import { getAuditLogs } from "../../api/audit";
import { getPermissions } from "../../api/permissions";
import { getRoles } from "../../api/roles";
import { getUsers } from "../../api/users";
import useAuth from "../../auth/useAuth";

const emptyStats = {
  totalUsers: 0,
  activeUsers: 0,
  roles: 0,
  permissions: 0,
  auditEvents: 0,
};

function getCount(payload) {
  if (typeof payload?.count === "number") {
    return payload.count;
  }
  if (Array.isArray(payload)) {
    return payload.length;
  }
  return 0;
}

function getResults(payload) {
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(emptyStats);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      const [users, activeUsers, roles, permissions, audit] = await Promise.allSettled([
        getUsers({ page_size: 1 }),
        getUsers({ is_active: true, page_size: 1 }),
        getRoles({ page_size: 1 }),
        getPermissions({ page_size: 1 }),
        getAuditLogs({ page_size: 5, ordering: "-created_at" }),
      ]);

      if (!mounted) {
        return;
      }

      setStats({
        totalUsers: users.status === "fulfilled" ? getCount(users.value) : 0,
        activeUsers: activeUsers.status === "fulfilled" ? getCount(activeUsers.value) : 0,
        roles: roles.status === "fulfilled" ? getCount(roles.value) : 0,
        permissions: permissions.status === "fulfilled" ? getCount(permissions.value) : 0,
        auditEvents: audit.status === "fulfilled" ? getCount(audit.value) : 0,
      });
      setActivity(audit.status === "fulfilled" ? getResults(audit.value) : []);
      setLoading(false);
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, accent: "from-teal-500/20 to-teal-600/10" },
    { label: "Active Sessions", value: stats.activeUsers, icon: Activity, accent: "from-emerald-500/20 to-emerald-600/10" },
    { label: "Roles", value: stats.roles, icon: ShieldCheck, accent: "from-violet-500/20 to-violet-600/10" },
    { label: "Audit Logs", value: stats.auditEvents, icon: KeyRound, accent: "from-sky-500/20 to-sky-600/10" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#111827] dark:shadow-slate-950/30">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-500 dark:text-teal-400">Operations Center</p>
           <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
  Welcome to the Admin Console
</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Monitor access, governance, and audit health from a single control room.</p>
          </div>
          <Link to="/audit" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800">
            View audit trail <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
              <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${card.accent} p-3`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
              <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{loading ? "—" : card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent activity</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">Live updates</span>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />)
            ) : activity.length ? (
              activity.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{entry.action || "Audit event"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(entry.created_at)}</p>
                  </div>
                  <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-300">{entry.ip || "secure"}</span>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No recent activity to display yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security posture</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm text-slate-500 dark:text-slate-400">Access reviews</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">2 pending</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm text-slate-500 dark:text-slate-400">Policy coverage</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">94%</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
