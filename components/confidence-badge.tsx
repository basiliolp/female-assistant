import { cn } from "@/lib/utils";
import { Fingerprint, Hash, AlertTriangle, HelpCircle } from "lucide-react";

const config: Record<string, { style: string; label: string; icon: typeof Fingerprint }> = {
  HIGH: {
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    label: "Alta",
    icon: Fingerprint,
  },
  MEDIUM: {
    style: "bg-blue-50 text-blue-700 ring-blue-200/80",
    label: "Média",
    icon: Hash,
  },
  LOW: {
    style: "bg-amber-50 text-amber-700 ring-amber-200/80",
    label: "Baixa",
    icon: AlertTriangle,
  },
  NONE: {
    style: "bg-red-50 text-red-700 ring-red-200/80",
    label: "Muito Baixa",
    icon: HelpCircle,
  },
};

export function ConfidenceBadge({
  level,
  size = "sm",
}: {
  level: string;
  size?: "sm" | "md";
}) {
  const c = config[level] ?? config.NONE;
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