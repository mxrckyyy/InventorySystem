import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Boxes, Eye, KeyRound, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { ADMIN_ROLE, VIEWER_ROLE, useAuth } from '../../context/AuthContext.jsx';

const inputClass =
  'w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20';

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="relative">
        {Icon ? (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        ) : null}
        {children}
      </div>
    </label>
  );
}

export default function AuthGate() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ADMIN_ROLE);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => emailRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [mode]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);

    if (mode === 'login') {
      const result = await login(email.trim(), password);
      setSubmitting(false);
      if (!result.success) setError(result.error);
      return;
    }

    if (password.length < 6) {
      setSubmitting(false);
      setError('Password must be at least 6 characters.');
      return;
    }

    const result = await signup(email.trim(), password, role);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.needsConfirmation) {
      setInfo(`Confirmation link sent to ${result.email}. Confirm it, then sign in.`);
      setMode('login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.14),transparent_55%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.35)]">
            <Boxes size={28} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            Inventory Management System
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to access the neon dashboard
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-[0_0_60px_rgba(34,211,238,0.12)] backdrop-blur">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-slate-950/60 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === 'login'
                  ? 'bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === 'signup'
                  ? 'bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field label="Email" icon={Mail}>
              <input
                ref={emailRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={`${inputClass} pl-9`}
              />
            </Field>

            <Field label="Password" icon={Lock}>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pl-9`}
              />
            </Field>

            {mode === 'signup' ? (
              <div>
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Access Role
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole(ADMIN_ROLE)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                      role === ADMIN_ROLE
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    <span className="text-sm font-semibold">Admin</span>
                    <span className="text-[11px] leading-snug opacity-70">
                      Full read + write access
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(VIEWER_ROLE)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                      role === VIEWER_ROLE
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Eye size={16} />
                    <span className="text-sm font-semibold">Viewer</span>
                    <span className="text-[11px] leading-snug opacity-70">
                      Read-only, actions disabled
                    </span>
                  </button>
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            ) : null}

            {info ? (
              <p className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300">
                {info}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/25 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                'Please wait...'
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-cyan-400" />
            <span>
              Roles are stored in Supabase <code className="text-cyan-400">user_metadata.role</code>.
              Sign up as <strong className="text-slate-300">Admin</strong> to unlock Add / Edit /
              Delete and stock controls.
            </span>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
            <KeyRound size={12} />
            Secured by Supabase Auth
          </div>
        </div>
      </div>
    </div>
  );
}
