const TONES = {
  cyan: {
    icon: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    bar: 'bg-amber-400'
  },
  emerald: {
    icon: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    bar: 'bg-amber-500'
  },
  amber: {
    icon: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    bar: 'bg-yellow-500'
  },
  rose: {
    icon: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    bar: 'bg-yellow-400'
  }
};

export default function StatCard({ title, value, icon: Icon, tone = 'cyan', hint }) {
  const palette = TONES[tone] || TONES.cyan;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900 p-6 transition-shadow hover:border-amber-500/40">
      <div className={`absolute inset-x-0 top-0 h-[2px] ${palette.bar}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-2 truncate text-3xl font-bold text-slate-50">{value}</p>
          {hint ? <p className="mt-1 truncate text-sm text-slate-400">{hint}</p> : null}
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
