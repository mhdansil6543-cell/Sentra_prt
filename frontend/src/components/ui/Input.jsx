import clsx from "clsx";

function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block w-full">
      {label ? <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span> : null}
      <input
        className={clsx(
          "w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
          error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "",
          className
        )}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-rose-400">{error}</span> : null}
    </label>
  );
}

export default Input;
