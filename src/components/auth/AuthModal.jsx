import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Box, Eye, KeyRound, Lock, Mail, ShieldCheck, Sparkles, X } from 'lucide-react';
import { ADMIN_ROLE, VIEWER_ROLE, useAuth } from '../../context/AuthContext.jsx';

const inputClass =
  'w-full min-h-[44px] rounded-lg border border-[#273544] bg-[#0F161E] px-3 py-2 text-sm text-white placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';

function Field({ label, icon: Icon, error, children }) {
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
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
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
  const [fieldErrors, setFieldErrors] = useState({});
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
    setFieldErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = 'Email is required';
    if (!password) nextErrors.password = 'Password is required';

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setFieldErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    if (mode === 'login') {
      const result = await login(email.trim(), password);
      setSubmitting(false);
      if (!result.success) setError(result.error);
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B1015]/90 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (canClose && event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,208,108,0.08),transparent_60%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/15 text-[#00D06C]">
            <Box size={28} strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {title || 'Inventory System'}
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            {subtitle || 'Sign in to access the inventory dashboard'}
          </p>
        </div>

        <div className="relative rounded-2xl border border-[#222E3A] bg-[#151D24] p-6 shadow-2xl">
          {canClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close auth modal"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg border border-[#273544] text-slate-300 transition hover:border-red-500/60 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <X size={18} />
            </button>
          ) : null}

          <div
            role="tablist"
            aria-label="Authentication mode"
            className="mb-5 grid grid-cols-2 gap-1 rounded-lg border border-[#273544] bg-[#0F161E] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => switchMode('login')}
              className={`min-h-[44px] rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                mode === 'login'
                  ? 'bg-[#00D06C] text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => switchMode('signup')}
              className={`min-h-[44px] rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                mode === 'signup'
                  ? 'bg-[#00D06C] text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field label="Email" icon={Mail} error={fieldErrors.email}>
              <input
                ref={emailRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldErrors((prev) => {
                    if (!prev.email) return prev;
                    const next = { ...prev };
                    delete next.email;
                    return next;
                  });
                }}
                placeholder="you@example.com"
                aria-invalid={Boolean(fieldErrors.email)}
                className={`${inputClass} pl-9 ${
                  fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
            </Field>

            <Field label="Password" icon={Lock} error={fieldErrors.password}>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setFieldErrors((prev) => {
                    if (!prev.password) return prev;
                    const next = { ...prev };
                    delete next.password;
                    return next;
                  });
                }}
                placeholder="••••••••"
                aria-invalid={Boolean(fieldErrors.password)}
                className={`${inputClass} pl-9 ${
                  fieldErrors.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                }`}
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
                    className={`flex min-h-[44px] flex-col items-start gap-1 rounded-lg border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      role === ADMIN_ROLE
                        ? 'border-emerald-500/60 bg-emerald-500/15 text-white'
                        : 'border-[#273544] bg-[#0F161E] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span className="text-sm font-semibold">Admin</span>
                    <span className="text-sm leading-snug text-slate-300">
                      Full read + write access
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(VIEWER_ROLE)}
                    aria-pressed={role === VIEWER_ROLE}
                    className={`flex min-h-[44px] flex-col items-start gap-1 rounded-lg border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      role === VIEWER_ROLE
                        ? 'border-emerald-500/60 bg-emerald-500/15 text-white'
                        : 'border-[#273544] bg-[#0F161E] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <Eye size={16} className="text-emerald-400" />
                    <span className="text-sm font-semibold">Viewer</span>
                    <span className="text-sm leading-snug text-slate-300">
                      Read-only, actions disabled
                    </span>
                  </button>
                </div>
              </fieldset>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-400"
              >
                {error}
              </p>
            ) : null}

            {info ? (
              <p
                role="status"
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400"
              >
                {info}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#00D06C] px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#151D24] disabled:cursor-not-allowed disabled:bg-[#1E293B] disabled:text-slate-500 disabled:brightness-100"
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

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-[#273544] bg-[#0F161E] px-3 py-2.5 text-sm leading-relaxed text-slate-300">
            <Sparkles size={15} className="mt-0.5 shrink-0 text-emerald-400" />
            <span>
              Roles are stored in Supabase{' '}
              <code className="text-emerald-400">user_metadata.role</code>. Sign up as{' '}
              <strong className="text-white">Admin</strong> to unlock Add / Edit / Delete and
              stock controls.
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
