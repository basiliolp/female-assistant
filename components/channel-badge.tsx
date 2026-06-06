import { MessageCircle, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChannelBadge({ channel }: { channel: string }) {
  const isWhatsapp = channel === "WHATSAPP";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        isWhatsapp
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80"
          : "bg-violet-50 text-violet-700 ring-violet-200/80",
      )}
    >
      {isWhatsapp ? <MessageCircle className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
      {isWhatsapp ? "WhatsApp" : "Web"}
    </span>
  );
}
