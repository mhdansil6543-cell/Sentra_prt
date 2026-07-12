import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff, UserPlus } from "lucide-react";

import { registerUser } from "../../api/auth";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password") || "";
  const strength = useMemo(() => {
    if (password.length >= 12 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return { label: "Strong", color: "text-emerald-500 dark:text-emerald-300" };
    }
    if (password.length >= 8) {
      return { label: "Medium", color: "text-amber-500 dark:text-amber-300" };
    }
    if (password.length > 0) {
      return { label: "Weak", color: "text-rose-500 dark:text-rose-300" };
    }
    return { label: "Enter a password", color: "text-slate-500 dark:text-slate-400" };
  }, [password]);

  async function onSubmit(data) {
    try {
      setLoading(true);
      await registerUser(data);
      toast.success("Account created successfully. Please sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Create account failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0E1420_100%)]">
      <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-[#111827]/95 dark:shadow-slate-950/50">
        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-lg font-semibold text-white">S</div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Create account</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start with a secure profile and receive the viewer role by default.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Full name</span>
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" placeholder="Jane Cooper" {...register("full_name", { required: "Full name is required" })} />
            {errors.full_name ? <span className="mt-2 block text-sm text-rose-500">{errors.full_name.message}</span> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Email</span>
            <input type="email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" placeholder="you@company.com" {...register("email", { required: "Email is required" })} />
            {errors.email ? <span className="mt-2 block text-sm text-rose-500">{errors.email.message}</span> : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Password</span>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" placeholder="Min 8 chars" {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? <span className="mt-2 block text-sm text-rose-500">{errors.password.message}</span> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Confirm password</span>
              <input type={showPassword ? "text" : "password"} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" placeholder="Repeat it" {...register("password_confirmation", { required: "Confirmation is required" })} />
              {errors.password_confirmation ? <span className="mt-2 block text-sm text-rose-500">{errors.password_confirmation.message}</span> : null}
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-900/70">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Password strength</span>
              <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className={`h-full rounded-full ${password.length >= 8 ? "bg-teal-500" : "bg-slate-400"}`} style={{ width: password.length >= 12 ? "100%" : password.length >= 8 ? "70%" : password.length > 0 ? "35%" : "0%" }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70">
            <UserPlus size={16} />
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Already have an account?</span>
          <button onClick={() => navigate("/login")} className="font-semibold text-teal-500 transition hover:text-teal-400 dark:text-teal-400 dark:hover:text-teal-300">Login</button>
        </div>
      </div>
    </div>
  );
}

export default Register;
