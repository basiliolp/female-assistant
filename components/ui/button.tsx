import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "gradient-btn text-white",
        variant === "secondary" &&
          "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/80 hover:bg-slate-50 hover:ring-slate-300",
        variant === "outline" &&
          "border border-slate-200 bg-transparent text-slate-700 hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-700",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        variant === "danger" && "bg-red-600 text-white shadow-sm hover:bg-red-700",
        size === "sm" && "gap-1.5 px-3.5 py-2 text-sm",
        size === "md" && "gap-2 px-5 py-2.5 text-sm",
        size === "lg" && "gap-2 px-7 py-3.5 text-base",
        className,
      )}
      {...props}
    />
  );
}
