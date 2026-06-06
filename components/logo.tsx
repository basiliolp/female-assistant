import { Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
};

export function Logo({ className, href = "/", size = "md", variant = "dark" }: Props) {
  const sizes = {
    sm: { icon: "h-8 w-8", iconInner: "h-4 w-4", text: "text-base" },
    md: { icon: "h-10 w-10", iconInner: "h-5 w-5", text: "text-xl" },
    lg: { icon: "h-12 w-12", iconInner: "h-6 w-6", text: "text-2xl" },
  };
  const s = sizes[size];

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl gradient-btn text-white",
          s.icon,
        )}
      >
        <Shield className={s.iconInner} />
      </div>
      <div>
        <p
          className={cn(
            "font-bold tracking-tight",
            s.text,
            variant === "light" ? "text-white" : "text-slate-900",
          )}
        >
          Verifica<span className="text-rose-500">+</span>
        </p>
        {size !== "sm" && (
          <p
            className={cn(
              "text-xs font-medium",
              variant === "light" ? "text-white/60" : "text-slate-500",
            )}
          >
            Sua rede de proteção
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
