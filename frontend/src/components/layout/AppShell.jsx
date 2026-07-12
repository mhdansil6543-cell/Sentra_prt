import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Search, Bell, LogOut, LayoutDashboard, Users, Shield, History, UserCircle, SunMedium, MoonStar } from "lucide-react";
import useAuth from "../../auth/useAuth";
import { useTheme } from "../../theme/ThemeProvider";
import { hasPermission } from "../../auth/permissions";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, permission: null },
  { name: "Users", path: "/users", icon: Users, permission: "users.view" },
  { name: "Roles & Permissions", path: "/roles", icon: Shield, permission: "roles.view" },
  { name: "Audit Logs", path: "/audit", icon: History, permission: "audit.view" },
  { name: "Profile", path: "/profile", icon: UserCircle, permission: null },
];

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const title = navigation.find((item) => item.path === location.pathname)?.name ?? "Sentra";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0E1420] dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/90 px-5 py-6 shadow-sm shadow-slate-200/70 lg:flex dark:border-slate-800 dark:bg-[#111827]/95 dark:shadow-slate-950/30">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 font-semibold text-white">S</div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Sentra</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Admin Console</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navigation
              .filter((item) => {
                if (!item.permission) return true;
                return hasPermission(user, item.permission);
              })
              .map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${isActive || active ? "bg-teal-600/20 text-slate-900 dark:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/20 text-sm font-semibold text-teal-600 dark:text-teal-300">
                {user?.full_name?.[0] || user?.email?.[0] || "U"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.full_name || user?.email || "Operator"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.is_staff ? "Administrator" : "Operator"}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-[#111827]/90 lg:px-7">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button className="rounded-2xl border border-slate-200 p-2 text-slate-600 lg:hidden dark:border-slate-700 dark:text-slate-300" onClick={() => setMobileOpen(true)}>
                  <Menu size={18} />
                </button>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Overview</p>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                  <Search size={16} />
                  <input className="w-40 bg-transparent outline-none" placeholder="Search" />
                </label>
                <button className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
                </button>
                <button className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                  <Bell size={16} />
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-5 lg:px-7 lg:py-7">
            <motion.div
  key={location.pathname}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
  className="opacity-100"
  style={{
    opacity: 1,
    filter: "none",
  }}
>
  <Outlet />
</motion.div>
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/80 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-72 border-r border-slate-800 bg-white p-5 dark:bg-[#111827]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 font-semibold text-white">S</div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Sentra</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Admin Console</p>
                </div>
              </div>
              <button className="rounded-2xl border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300" onClick={() => setMobileOpen(false)}>
                ✕
              </button>
            </div>
            <nav className="space-y-1.5">
              {navigation
                .filter((item) => {
                  if (!item.permission) return true;
                  return hasPermission(user, item.permission);
                })
                .map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      end={item.path === "/"}
                      className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${isActive || active ? "bg-teal-600/20 text-slate-900 dark:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AppShell;
