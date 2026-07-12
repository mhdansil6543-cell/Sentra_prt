import clsx from "clsx";

function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "border border-slate-700 bg-slate-800/80 text-slate-200",
    success: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    warning: "border border-amber-500/40 bg-amber-500/10 text-amber-300",
    accent: "border border-teal-500/40 bg-teal-500/10 text-teal-300",
    danger: "border border-rose-500/40 bg-rose-500/10 text-rose-300",
  };

  return <span className={clsx("inline-flex rounded-full px-3 py-1 text-xs font-semibold", variants[variant], className)}>{children}</span>;
}

export default Badge;
