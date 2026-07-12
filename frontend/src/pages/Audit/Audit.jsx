import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Search, ShieldAlert } from "lucide-react";

import { exportAuditLogs, getAuditLogs } from "../../api/audit";
import { getUsers } from "../../api/users";
import useAuth from "../../auth/useAuth";
import AuditFilters from "../../components/audit/AuditFilters";
import AuditTable from "./AuditTable";

const defaultFilters = { search: "", action: "", actor: "", from: "", to: "" };

function formatTimestamp(value) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

function getStatus(event) {
  const action = String(event.action || "").toLowerCase();
  const changes = JSON.stringify(event.changes || {}).toLowerCase();
  return action.includes("fail") || changes.includes("fail") || changes.includes("error") ? "Failed" : "Success";
}

function getTarget(event) {
  const targetType = event.target_type || "Record";
  const oldData = event.changes?.old || {};
  const newData = event.changes?.new || {};
  const name = newData.full_name || oldData.full_name || newData.name || oldData.name;
  const email = newData.email || oldData.email;
  const permission = newData.permission || oldData.permission || newData.codename || oldData.codename;
  if (permission) {
    return `Permission: ${permission}`;
  }
  if (name) {
    return `${targetType}: ${name}`;
  }
  if (email) {
    return `${targetType}: ${email}`;
  }
  if (event.target_id) {
    return `${targetType}: ${event.target_id}`;
  }
  return targetType;
}

function buildAuditParams(filters, paginationModel, sortModel, users) {
  const params = { page: paginationModel.page + 1, page_size: paginationModel.pageSize };
  const search = filters.search.trim();
  const matchedUser = search ? users.find((user) => `${user.full_name || ""} ${user.email || ""}`.toLowerCase().includes(search.toLowerCase())) : null;
  if (matchedUser && !filters.actor) {
    params.actor = matchedUser.id;
  } else if (search) {
    params.search = search;
  }
  if (filters.actor) {
    params.actor = filters.actor;
  }
  if (filters.action === "login" || filters.action === "logout") {
    params.action = filters.action;
  } else if (filters.action) {
    params.target_type = filters.action;
  }
  if (filters.from) {
    params.created_at_after = filters.from;
  }
  if (filters.to) {
    params.created_at_before = filters.to;
  }
  const sort = sortModel[0];
  if (sort?.field === "timestamp") {
    params.ordering = sort.sort === "asc" ? "created_at" : "-created_at";
  } else if (sort?.field === "user") {
    params.ordering = sort.sort === "asc" ? "actor" : "-actor";
  } else {
    params.ordering = "-created_at";
  }
  return params;
}

function Audit() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState([{ field: "timestamp", sort: "desc" }]);

  const permissionList = user?.permissions || user?.assigned_permissions || [];
  const canViewAudit = Boolean(user?.is_superuser || user?.is_staff || (Array.isArray(permissionList) && permissionList.includes("audit.view")));

  useEffect(() => {
    let mounted = true;
    async function loadUsers() {
      try {
        const response = await getUsers({ page_size: 100 });
        if (mounted) {
          setUsers(response.results || response || []);
        }
      } catch (loadError) {
        console.error("Failed to load audit user filter:", loadError);
      }
    }
    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadEvents() {
      if (!canViewAudit) {
        return;
      }
      try {
        setLoading(true);
        setError("");
        setForbidden(false);
        const params = buildAuditParams(filters, paginationModel, sortModel, users);
        const response = await getAuditLogs(params);
        if (!mounted) {
          return;
        }
        setEvents(response.results || response || []);
        setRowCount(response.count ?? (response.results || response || []).length);
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        console.error("Failed to load audit logs:", loadError);
        if (loadError?.response?.status === 403) {
          setForbidden(true);
        } else {
          setError("Audit records could not be loaded. Please refresh and try again.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadEvents();
    return () => {
      mounted = false;
    };
  }, [canViewAudit, filters, paginationModel, refreshKey, sortModel, users]);

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
    setPaginationModel((current) => ({ ...current, page: 0 }));
  }

  async function handleExport() {
    try {
      setExporting(true);
      setError("");
      const params = buildAuditParams(filters, { page: 0, pageSize: paginationModel.pageSize }, sortModel, users);
      delete params.page;
      delete params.page_size;
      const blob = await exportAuditLogs(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "audit-logs.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error("Failed to export audit logs:", exportError);
      if (exportError?.response?.status === 403) {
        setForbidden(true);
      } else {
        setError("Audit export could not be completed. Please try again.");
      }
    } finally {
      setExporting(false);
    }
  }

  const rows = useMemo(() => events.map((event) => ({ id: event.id, timestamp: formatTimestamp(event.created_at), user: event.actor || "-", action: event.action, target: getTarget(event), ip: event.ip || "-", status: getStatus(event) })), [events]);

  if (!canViewAudit || forbidden) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-8 text-center shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
        <ShieldAlert className="mx-auto mb-3 text-teal-500 dark:text-teal-400" size={40} />
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Audit log unavailable</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You need the audit.view permission to access these records.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#111827] dark:shadow-slate-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-500 dark:text-teal-400">Audit & compliance</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Audit Log</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Every privileged action is logged for review and accountability.</p>
          </div>
          {canViewAudit ? (
            <button onClick={handleExport} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800">
              <Download size={16} />
              {exporting ? "Exporting..." : "Export Excel"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Search size={16} />
          <span>Filter and review system events.</span>
        </div>
        <AuditFilters filters={filters} users={users} onFilterChange={handleFilterChange} onRefresh={() => setRefreshKey((current) => current + 1)} />
      </div>

      {error ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div> : null}

      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
        <AuditTable rows={rows} rowCount={rowCount} loading={loading} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} sortModel={sortModel} onSortModelChange={setSortModel} />
      </div>
    </motion.div>
  );
}

export default Audit;
