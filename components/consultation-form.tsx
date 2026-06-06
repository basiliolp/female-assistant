"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCpf } from "@/lib/utils";

export function ConsultationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    subjectName: "",
    subjectCpf: "",
    birthDate: "",
    motherName: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erro ao consultar");
      return;
    }

    router.push(`/dashboard/consultas/${data.consultation.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        id="subjectName"
        label="Nome completo"
        value={form.subjectName}
        onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
        required
        placeholder="Ex: João da Silva Santos"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="subjectCpf"
          label="CPF"
          value={form.subjectCpf}
          onChange={(e) =>
            setForm({ ...form, subjectCpf: formatCpf(e.target.value) })
          }
          placeholder="000.000.000-00"
          hint="Opcional — melhora a precisão"
        />
        <Input
          id="birthDate"
          label="Data de nascimento"
          type="date"
          value={form.birthDate}
          onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          hint="Opcional"
        />
      </div>

      <Input
        id="motherName"
        label="Nome da mãe"
        value={form.motherName}
        onChange={(e) => setForm({ ...form, motherName: e.target.value })}
        placeholder="Opcional"
        hint="Ajuda a identificar homônimos"
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full gap-2" size="lg">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Gerando relatório...
          </>
        ) : (
          <>
            <FileSearch className="h-4 w-4" />
            Gerar relatório
          </>
        )}
      </Button>
    </form>
  );
}
