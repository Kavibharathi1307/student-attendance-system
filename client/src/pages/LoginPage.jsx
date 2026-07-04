import { useMemo, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Faculty', value: 'faculty' },
  { label: 'Student', value: 'student' }
];

function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  }

  function validate() {
    const nextErrors = {};

    if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
    }

    if (!form.role) {
      nextErrors.role = 'Select a role.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      const user = await login({
        email: form.email,
        password: form.password,
        role: form.role
      });
      const fallbackPath = `/${user.role}/dashboard`;
      const from = location.state?.from?.pathname || fallbackPath;
      navigate(from, { replace: true });
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Unable to sign in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.25),_transparent_30%),linear-gradient(135deg,_#08111f_0%,_#111c31_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[32px] border border-white/10 bg-white/10 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.35),_transparent_40%),linear-gradient(135deg,_rgba(6,182,212,0.12),_transparent_50%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-100">
              <Sparkles size={16} />
              Student Attendance OS
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight xl:text-5xl">
              Modern monitoring for every classroom operation.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
              Admins, faculty, and students can move from attendance capture to insight in one calm, intelligent experience.
            </p>
          </div>

          <div className="relative z-10 grid gap-3 sm:grid-cols-3">
            {['Admin', 'Faculty', 'Student'].map((role) => (
              <div key={role} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200 backdrop-blur">
                <div className="mb-2 inline-flex rounded-full bg-white/10 p-2">
                  <ShieldCheck size={16} />
                </div>
                <div className="font-semibold">{role}</div>
                <div className="mt-1 text-xs text-slate-400">Dedicated workspace</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center bg-slate-50/95 px-5 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Welcome back</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">Sign in</h2>
              </div>
              <div className="rounded-2xl bg-teal-50 p-3 text-teal-600">
                <ShieldCheck size={18} />
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                  Email
                </label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-100">
                  <Mail size={16} className="mr-2 text-slate-400" />
                  <input
                    autoComplete="email"
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    id="email"
                    name="email"
                    onChange={updateField}
                    placeholder="admin@student.com"
                    type="email"
                    value={form.email}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-rose-700">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-100">
                  <Lock size={16} className="mr-2 text-slate-400" />
                  <input
                    autoComplete="current-password"
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    id="password"
                    name="password"
                    onChange={updateField}
                    placeholder="Enter password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                  />
                  <button
                    className="ml-2 rounded-full p-1 text-slate-500 hover:bg-slate-200"
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-rose-700">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="role">
                  Role
                </label>
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  id="role"
                  name="role"
                  onChange={updateField}
                  value={form.role}
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-2 text-sm text-rose-700">{errors.role}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                  <span>Remember me</span>
                </label>
                <a className="font-medium text-teal-700 hover:text-teal-800" href="#">Forgot password?</a>
              </div>

              {serverError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {serverError}
                </div>
              )}

              <button
                className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
