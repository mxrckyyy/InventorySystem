const TONES = {
  cyan: {
    icon: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    bar: 'bg-sky-400',
    glow: 'shadow-[0_1px_10px_rgba(56,189,248,0.12)]'
  },
  emerald: {
    icon: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    bar: 'bg-emerald-400',
    glow: 'shadow-[0_1px_10px_rgba(52,211,153,0.12)]'
  },
  amber: {
    icon: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    bar: 'bg-amber-400',
    glow: 'shadow-[0_1px_10px_rgba(251,191,36,0.12)]'
  },
  rose: {
    icon: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    bar: 'bg-rose-400',
    glow: 'shadow-[0_1px_10px_rgba(251,113,133,0.12)]'
  }
};

export default function StatCard({ title, value, icon: Icon, tone = 'cyan', hint }) {
  const palette = TONES[tone] || TONES.cyan;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur transition-shadow hover:border-slate-700 ${palette.glow}`}
    >
      <div className={`absolute inset-x-0 top-0 h-[2px] ${palette.bar}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-300">
            {title}
          </p>
          <p className="mt-2 truncate text-3xl font-bold text-slate-50">{value}</p>
          {hint ? (
            <p className="mt-1 truncate text-sm text-slate-400">{hint}</p>
          ) : null}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${palette.icon}`}
        >
          {Icon ? <Icon size={20} strokeWidth={2} /> : null}
        </div>
      </div>
    </div>
  );
}
