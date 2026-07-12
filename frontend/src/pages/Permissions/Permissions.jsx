import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck } from "lucide-react";

import { getPermissions } from "../../api/permissions";

function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadPermissions() {
      try {
        const data = await getPermissions({ page_size: 100 });
        if (!mounted) {
          return;
        }
        setPermissions(data.results || data || []);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPermissions();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = permissions.filter((permission) => `${permission.codename} ${permission.description}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-[28px] border border-slate-800 bg-[#111827] p-6 shadow-2xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-400">Permission catalogue</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Permissions</h2>
            <p className="mt-2 text-sm text-slate-400">A read-only catalogue of the platform capabilities available to each role.</p>
          </div>
          <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-400">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search permissions" className="bg-transparent outline-none" />
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(loading ? Array.from({ length: 6 }) : filtered).map((permission, index) => (
          <div key={permission.id ?? `${permission.codename}-${index}`} className="rounded-[24px] border border-slate-800 bg-[#1A2332] p-5 shadow-xl shadow-slate-950/20">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-800/80" />
                <div className="h-3 w-full animate-pulse rounded-full bg-slate-800/70" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-800/70" />
              </div>
            ) : (
              <>
                <div className="mb-3 inline-flex rounded-2xl bg-teal-500/10 p-2 text-teal-300">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-lg font-semibold text-white">{permission.codename}</p>
                <p className="mt-2 text-sm text-slate-400">{permission.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Permissions;