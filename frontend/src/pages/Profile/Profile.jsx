import { motion } from "framer-motion";

import useAuth from "../../auth/useAuth";

function Profile() {
  const { user } = useAuth();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#111827] dark:shadow-slate-950/30">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Profile</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage your identity, password, and active sessions.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Profile information</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm text-slate-500 dark:text-slate-400">Full name</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{user?.full_name || "—"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{user?.email || "—"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm text-slate-500 dark:text-slate-400">Role</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{user?.is_staff ? "Administrator" : "Operator"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{user?.is_active ? "Active" : "Inactive"}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security</h3>
          <div className="mt-4 space-y-3">
            <button className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800">Change password</button>
            <button className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800">Review sessions</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Profile;