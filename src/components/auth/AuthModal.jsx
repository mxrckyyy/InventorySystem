import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Boxes, Eye, KeyRound, Lock, Mail, ShieldCheck, Sparkles, X } from 'lucide-react';
import { ADMIN_ROLE, VIEWER_ROLE, useAuth } from '../../context/AuthContext.jsx';

const inputClass =
  'w-full min-h-[44px] rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 placeholder-slate-400 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/40';

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <div className="relative">
        {Icon ? (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        ) : null}
        {children}
      </div>
    </label>
  );
}

export default function AuthModal({ isOpen = true, onClose, title, subtitle }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ADMIN_ROLE);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);

  const canClose = typeof onClose === 'function';

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => emailRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen || !canClose) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canClose, onClose]);

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/90 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (canClose && event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.10),transparent_60%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 text-amber-300">
            <Boxes size={28} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            {title || 'Inventory Management System'}
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            {subtitle || 'Sign in to access the inventory dashboard'}
          </p>
        </div>

        <div className="relative rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
          {canClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close auth modal"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 text-slate-300 transition hover:border-rose-400/60 hover:text-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <X size={18} />
            </button>
          ) : null}

          <div
            role="tablist"
            aria-label="Authentication mode"
            className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-slate-700 bg-slate-950/60 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => switchMode('login')}
              className={`min-h-[44px] rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => switchMode('signup')}
              className={`min-h-[44px] rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                mode === 'signup'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
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
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                className={`${inputClass} pl-9`}
              />
            </Field>

            {mode === 'signup' ? (
              <fieldset>
                <legend className="mb-1.5 block text-sm font-medium text-slate-300">
                  Access Role
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole(ADMIN_ROLE)}
                    aria-pressed={role === ADMIN_ROLE}
                    className={`flex min-h-[44px] flex-col items-start gap-1 rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                      role === ADMIN_ROLE
                        ? 'border-amber-400/60 bg-amber-500/15 text-amber-100'
                        : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    <span className="text-sm font-semibold">Admin</span>
                    <span className="text-sm leading-snug text-slate-400">
                      Full read + write access
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(VIEWER_ROLE)}
                    aria-pressed={role === VIEWER_ROLE}
                    className={`flex min-h-[44px] flex-col items-start gap-1 rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                      role === VIEWER_ROLE
                        ? 'border-amber-400/60 bg-amber-500/15 text-amber-100'
                        : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <Eye size={16} />
                    <span className="text-sm font-semibold">Viewer</span>
                    <span className="text-sm leading-snug text-slate-400">
                      Read-only, actions disabled
                    </span>
                  </button>
                </div>
              </fieldset>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded-lg border border-rose-400/50 bg-rose-500/15 px-3 py-2.5 text-sm text-rose-100"
              >
                {error}
              </p>
            ) : null}

            {info ? (
              <p
                role="status"
                className="rounded-lg border border-amber-400/50 bg-amber-500/15 px-3 py-2.5 text-sm text-amber-100"
              >
                {info}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-amber-500 bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 hover:shadow-[0_0_18px_rgba(251,191,36,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm leading-relaxed text-slate-300">
            <Sparkles size={15} className="mt-0.5 shrink-0 text-amber-400" />
            <span>
              Roles are stored in Supabase <code className="text-amber-300">user_metadata.role</code>.
              Sign up as <strong className="text-slate-100">Admin</strong> to unlock Add / Edit /
              Delete and stock controls.
            </span>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-400">
            <KeyRound size={14} />
            Secured by Supabase Auth
          </div>
        </div>
      </div>
    </div>
  );
}
