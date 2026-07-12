import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#e2e8f0_100%)] px-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0E1420_100%)]">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white/95 p-10 text-center shadow-2xl shadow-slate-200/60 dark:border-slate-800 dark:bg-[#111827] dark:shadow-slate-950/30">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-500 dark:text-teal-400">404</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">The page you’re looking for doesn’t exist or was moved.</p>
        <Link to="/" className="mt-6 inline-flex rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500">Back to dashboard</Link>
      </div>
    </div>
  );
}

export default NotFound;
