"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileSearch, Search, Fingerprint, Hash, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCpf, cn } from "@/lib/utils";

type ConfidenceLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH";

const confidenceConfig: Record<ConfidenceLevel, { label: string; icon: typeof Search; style: string; description: string }> = {
  NONE: {
    label: "Muito Baixa",
    icon: HelpCircle,
    style: "border-red-200 bg-red-50/60 text-red-700",
    description: "Apenas o nome informado. Risco de homônimos.",
  },
  LOW: {
    label: "Baixa",
    icon: AlertTriangle,
    style: "border-amber-200 bg-amber-50/60 text-amber-700",
    description: "Nome + nome da mãe. Ainda pode haver homônimos.",
  },
  MEDIUM: {
    label: "Média",
    icon: Hash,
    style: "border-blue-200 bg-blue-50/60 text-blue-700",
    description: "CPF presente. Boa correspondência.",
  },
  HIGH: {
    label: "Alta",
    icon: Fingerprint,
    style: "border-emerald-200 bg-emerald-50/60 text-emerald-700",
    description: "CPF + data de nascimento. Máxima precisão.",
  },
};

function estimateConfidence(form: {
  subjectName: string;
  subjectCpf: string;
  birthDate: string;
  motherName: string;
}): ConfidenceLevel {
  if (form.subjectCpf.replace(/\D/g, "").length === 11 && form.birthDate) return "HIGH";
  if (form.subjectCpf.replace(/\D/g, "").length === 11 && form.motherName) return "MEDIUM";
  if (form.subjectCpf.replace(/\D/g, "").length === 11) return "MEDIUM";
  if (form.motherName) return "LOW";
  return "NONE";
}

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

  const confidence = useMemo(() => estimateConfidence(form), [form]);
  const confidenceInfo = confidenceConfig[confidence];

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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
        onChange={(e) => updateField("subjectName", e.target.value)}
        required
        placeholder="Ex: João da Silva Santos"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="subjectCpf"
          label="CPF"
          value={form.subjectCpf}
          onChange={(e) => updateField("subjectCpf", formatCpf(e.target.value))}
          placeholder="000.000.000-00"
          hint="Opcional — melhora a precisão"
        />
        <Input
          id="birthDate"
          label="Data de nascimento"
          type="date"
          value={form.birthDate}
          onChange={(e) => updateField("birthDate", e.target.value)}
          hint="Opcional"
        />
      </div>

      <Input
        id="motherName"
        label="Nome da mãe"
        value={form.motherName}
        onChange={(e) => updateField("motherName", e.target.value)}
        placeholder="Opcional"
        hint="Ajuda a identificar homônimos"
      />

      {/* Feedback de acurácia em tempo real */}
      {form.subjectName.length >= 3 && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4",
            confidenceInfo.style,
          )}
        >
          <confidenceInfo.icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">
              Precisão da identificação: {confidenceInfo.label}
            </p>
            <p className="mt-0.5 text-sm opacity-80">
              {confidenceInfo.description}
            </p>
            {confidence !== "HIGH" && (
              <p className="mt-1.5 text-xs font-medium opacity-75">
                {!form.subjectCpf && !form.birthDate
                  ? "Informe CPF e data de nascimento para maximizar a precisão."
                  : form.subjectCpf && !form.birthDate
                    ? "Adicione a data de nascimento para atingir precisão máxima."
                    : form.birthDate && !form.subjectCpf
                      ? "Adicione o CPF para aumentar significativamente a precisão."
                      : "Adicione mais dados para melhorar a precisão."}
              </p>
            )}
          </div>
        </div>
      )}

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