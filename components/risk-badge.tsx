import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, HelpCircle, AlertCircle } from "lucide-react";

const config: Record<string, { style: string; label: string; icon: typeof CheckCircle }> = {
  LOW: {
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    label: "Baixo",
    icon: CheckCircle,
  },
  MEDIUM: {
    style: "bg-amber-50 text-amber-700 ring-amber-200/80",
    label: "Médio",
    icon: AlertCircle,
  },
  HIGH: {
    style: "bg-red-50 text-red-700 ring-red-200/80",
    label: "Alto",
    icon: AlertTriangle,
  },
  UNKNOWN: {
    style: "bg-slate-100 text-slate-600 ring-slate-200/80",
    label: "Indeterminado",
    icon: HelpCircle,
  },
};

export function RiskBadge({ level, size = "sm" }: { level: string; size?: "sm" | "md" }) {
  const c = config[level] ?? config.UNKNOWN;
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset",
        c.style,
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {c.label}
    </span>
  );
}
