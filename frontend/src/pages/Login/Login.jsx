import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock } from "lucide-react";

import useAuth from "../../auth/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(data) {
    try {
      setLoading(true);
      await login(data);
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0E1420_100%)]">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-[#111827]/95 dark:shadow-slate-950/50">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-lg font-semibold text-white">S</div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Sentra</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Professional access platform</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to manage users, roles, permissions, and audit activity.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Email</span>
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
              placeholder="you@company.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email ? <span className="mt-2 block text-sm text-rose-500">{errors.email.message}</span> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                placeholder="••••••••"
                {...register("password", { required: "Password is required" })}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password ? <span className="mt-2 block text-sm text-rose-500">{errors.password.message}</span> : null}
          </label>

          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900" />
              Remember me
            </label>
            <button type="button" className="text-teal-500 transition hover:text-teal-400 dark:text-teal-400 dark:hover:text-teal-300">Forgot password?</button>
          </div>

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70">
            <Lock size={16} />
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Need an account?</span>
          <button onClick={() => navigate("/register")} className="font-semibold text-teal-500 transition hover:text-teal-400 dark:text-teal-400 dark:hover:text-teal-300">Create account</button>
        </div>
      </div>
    </div>
  );
}

export default Login;