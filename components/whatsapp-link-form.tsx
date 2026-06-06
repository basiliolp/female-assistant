"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  currentPhone?: string | null;
  isLinked?: boolean;
};

export function WhatsAppLinkForm({ currentPhone, isLinked }: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState(currentPhone || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/whatsapp/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "Erro ao vincular" });
      return;
    }

    setMessage({ type: "success", text: "WhatsApp conectado com sucesso!" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        id="whatsapp-phone"
        label="Seu número de WhatsApp"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="5511999999999"
        hint="Inclua o código do país (55 para Brasil) sem espaços ou símbolos"
        required
      />

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button type="submit" disabled={loading} className="gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            {isLinked ? "Atualizar número" : "Conectar WhatsApp"}
          </>
        )}
      </Button>
    </form>
  );
}
