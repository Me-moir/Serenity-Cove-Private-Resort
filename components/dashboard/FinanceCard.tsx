export default function FinanceCard() {
  return (
    <div className="rounded-3xl bg-card-dark p-6 text-text-on-dark">
      <div className="text-xs uppercase tracking-[0.3em] text-text-on-dark/70">
        Finance Chart
      </div>
      <div className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-sm text-text-on-dark/70">
        Finance Chart — connect to Supabase
      </div>
    </div>
  );
}
