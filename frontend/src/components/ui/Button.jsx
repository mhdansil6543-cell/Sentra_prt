import clsx from "clsx";

function Button({ variant = "primary", className = "", children, ...props }) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/40 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary: "bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-500",
    secondary: "border border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white",
    danger: "bg-rose-500/90 text-white hover:bg-rose-400",
  };

  return (
    <button className={clsx(baseClasses, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export default Button;
