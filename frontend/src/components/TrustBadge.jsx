import { ShieldCheck, Zap } from "lucide-react";

export default function TrustBadge({ score = 92, badge = "Trusted Seller" }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-sm font-bold text-ink shadow-soft backdrop-blur dark:bg-white/10 dark:text-white">
      <ShieldCheck size={18} className="text-brand" />
      <span>{score}</span>
      <span className="h-4 w-px bg-slate-200 dark:bg-white/20" />
      <Zap size={16} className="text-accent" />
      <span>{badge}</span>
    </div>
  );
}
