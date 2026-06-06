import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "warning" | "danger";
};

const variants = {
  default: {
    icon: "bg-violet-100 text-violet-600",
    value: "text-slate-900",
  },
  success: {
    icon: "bg-emerald-100 text-emerald-600",
    value: "text-emerald-700",
  },
  warning: {
    icon: "bg-amber-100 text-amber-600",
    value: "text-amber-700",
  },
  danger: {
    icon: "bg-red-100 text-red-600",
    value: "text-red-600",
  },
};

export function StatCard({ label, value, icon: Icon, trend, variant = "default" }: Props) {
  const v = variants[variant];
  return (
    <div className="glass-strong group rounded-2xl p-5 transition hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-105",
            v.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold tracking-tight", v.value)}>{value}</p>
    </div>
  );
}
