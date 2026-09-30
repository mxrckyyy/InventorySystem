const TONES = {
  cyan: {
    icon: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    bar: 'bg-[#00D06C]'
  },
  emerald: {
    icon: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    bar: 'bg-[#00D06C]'
  },
  amber: {
    icon: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    bar: 'bg-amber-500'
  },
  rose: {
    icon: 'bg-red-500/15 text-red-400 border-red-500/40',
    bar: 'bg-red-500'
  }
};

export default function StatCard({ title, value, icon: Icon, tone = 'cyan', hint }) {
  const palette = TONES[tone] || TONES.cyan;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#222E3A] bg-[#151D24] p-6 transition-shadow hover:border-emerald-500/40">
      <div className={`absolute inset-x-0 top-0 h-[2px] ${palette.bar}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-300">
            {title}
          </p>
          <p className="mt-2 truncate text-3xl font-bold text-white">{value}</p>
          {hint ? <p className="mt-1 truncate text-sm text-slate-300">{hint}</p> : null}
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
