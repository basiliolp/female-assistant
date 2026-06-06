import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "strong" | "flat";
};

export function Card({ className, variant = "default", ...props }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        variant === "default" && "glass",
        variant === "strong" && "glass-strong",
        variant === "flat" && "border border-slate-200/60 bg-white",
        className,
      )}
      {...props}
    />
  );
}
