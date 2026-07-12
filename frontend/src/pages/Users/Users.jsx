import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Plus, Search, RefreshCcw } from "lucide-react";

import { getUsers, exportUsers } from "../../api/users";
import UserTable from "../../components/users/UserTable";
import AddUserDialog from "../../components/users/AddUserDialog";
import useAuth from "../../auth/useAuth";
import { canCreateUsers, canExportUsers, canViewUsers } from "../../auth/permissions";
const PAGE_SIZE = 6;

function Users() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadUsers() {
      try {
        setLoading(true);
        const response = await getUsers({
          search: search || undefined,
          role: role || undefined,
          is_active: status || undefined,
          page: currentPage,
          page_size: PAGE_SIZE,
        });
        if (!mounted) {
          return;
        }
        const results = response.results || response || [];
        setUsers(results);
        setTotalUsers(response.count ?? results.length);
      } catch (error) {
        console.error("Failed to load users:", error);
        if (mounted) {
          setUsers([]);
          setTotalUsers(0);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();
    return () => {
      mounted = false;
    };
  }, [currentPage, refreshKey, role, search, status]);

  async function handleExport() {
    try {
      const blob = await exportUsers({ search: search || undefined, role: role || undefined, is_active: status || undefined });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "users.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export users:", error);
    }
  }

  const canCreate = canCreateUsers(currentUser);
  const canExport = canExportUsers(currentUser);
  const canList = canViewUsers(currentUser);

  if (!canList) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-8 text-center shadow-xl text-slate-900">
        <h3 className="text-xl font-semibold">Users unavailable</h3>
        <p className="mt-2 text-sm text-slate-500">You do not have permission to view users.</p>
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#111827] dark:shadow-slate-950/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-500 dark:text-teal-400">User administration</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Users</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Search, filter, and manage access across the Sentra workspace.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setRefreshKey((value) => value + 1)} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800">
                <RefreshCcw size={16} />
                Refresh
              </button>
              {canExport ? (
                <button onClick={handleExport} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800">
                  <Download size={16} />
                  Export Excel
                </button>
              ) : null}
              {canCreate ? (
                <button onClick={() => setOpenAdd(true)} className="flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">
                  <Plus size={16} />
                  Create User
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
              <Search size={16} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" className="w-full bg-transparent outline-none sm:w-72" />
            </label>
            <div className="flex flex-wrap gap-3">
              <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                <option value="">All roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Viewer">Viewer</option>
              </select>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
          {loading ? (
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />)}
            </div>
          ) : (
            <UserTable users={users} onActionSuccess={() => setRefreshKey((value) => value + 1)} />
          )}
        </div>
      </motion.div>

      {canCreate ? <AddUserDialog open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={() => setRefreshKey((value) => value + 1)} /> : null}
    </>
  );
}

export default Users;
