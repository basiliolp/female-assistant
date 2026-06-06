import { cn } from "@/lib/utils";
import { CheckCircle2, ShieldCheck, AlertTriangle, HelpCircle, XCircle } from "lucide-react";

const config: Record<
  string,
  { style: string; label: string; icon: typeof CheckCircle2 }
> = {
  confirmed: {
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    label: "Confirmado",
    icon: CheckCircle2,
  },
  strong: {
    style: "bg-blue-50 text-blue-700 ring-blue-200/80",
    label: "Forte",
    icon: ShieldCheck,
  },
  medium: {
    style: "bg-amber-50 text-amber-700 ring-amber-200/80",
    label: "Moderada",
    icon: AlertTriangle,
  },
  weak: {
    style: "bg-orange-50 text-orange-700 ring-orange-200/80",
    label: "Fraca",
    icon: XCircle,
  },
  unknown: {
    style: "bg-slate-100 text-slate-600 ring-slate-200/80",
    label: "Indeterminada",
    icon: HelpCircle,
  },
};

export function MatchBadge({
  confidence,
  score,
}: {
  confidence: string;
  score?: number;
}) {
  const c = config[confidence] ?? config.unknown;
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
        c.style,
      )}
      title={`Score: ${score ?? "—"}%`}
    >
      <Icon className="h-2.5 w-2.5" />
      {score !== undefined ? `${c.label} (${score}%)` : c.label}
    </span>
  );
}