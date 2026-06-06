import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, ExternalLink, Shield, Database, Search, Fingerprint, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChannelBadge } from "@/components/channel-badge";
import { RiskBadge } from "@/components/risk-badge";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { MatchBadge } from "@/components/match-badge";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskCpf } from "@/lib/utils";
import type { SourceFinding } from "@/lib/services/sources";

type Params = { params: Promise<{ id: string }> };

const severityConfig: Record<string, { card: string; dot: string }> = {
  info: { card: "border-slate-200/80 bg-slate-50/80", dot: "bg-slate-400" },
  warning: { card: "border-amber-200/80 bg-amber-50/60", dot: "bg-amber-500" },
  critical: { card: "border-red-200/80 bg-red-50/60", dot: "bg-red-500" },
};

export default async function ConsultaDetalhePage({ params }: Params) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const consultation = await prisma.consultation.findFirst({
    where: { id, userId: session.userId },
    include: { report: true },
  });

  if (!consultation) {
    return (
      <Card className="text-center">
        <p className="text-slate-600">Consulta não encontrada.</p>
        <Link
          href="/dashboard/consultas"
          className="mt-4 inline-block text-sm font-semibold text-rose-600"
        >
          Voltar ao histórico
        </Link>
      </Card>
    );
  }

  const findings: SourceFinding[] = consultation.report
    ? JSON.parse(consultation.report.findings)
    : [];
  const rawSources = consultation.report ? JSON.parse(consultation.report.sources) : [];

  // Extrai dados de confiança das fontes (entrada especial __confidence__)
  const confidenceEntry = rawSources.find((s: { id: string }) => s.id === "__confidence__");
  const confidenceInfo = confidenceEntry
    ? { level: confidenceEntry.status, ...JSON.parse(confidenceEntry.message) }
    : null;

  // Filtra a entrada de confiança das fontes regulares
  const sources = rawSources.filter(
    (s: { id: string }) => s.id !== "__confidence__",
  );

  // Dados informados na consulta
  const fieldsProvided = [
    "nome",
    ...(consultation.subjectCpf ? ["CPF"] : []),
    ...(consultation.birthDate ? ["data de nascimento"] : []),
    ...(consultation.motherName ? ["nome da mãe"] : []),
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/consultas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-rose-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao histórico
      </Link>

      {/* Header */}
      <div className="glass-strong rounded-2xl p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
              {consultation.subjectName}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              CPF {maskCpf(consultation.subjectCpf)}
              {consultation.birthDate && ` · Nasc. ${consultation.birthDate}`}
              {" · "}
              {format(consultation.createdAt, "dd MMM yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChannelBadge channel={consultation.channel} />
            {consultation.report && (
              <RiskBadge level={consultation.report.riskLevel} size="md" />
            )}
          </div>
        </div>

        {/* Dados fornecidos */}
        <div className="mt-4 flex flex-wrap gap-2">
          {fieldsProvided.map((field) => (
            <span
              key={field}
              className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              <Search className="mr-1 h-3 w-3" />
              {field}
            </span>
          ))}
        </div>
      </div>

      {consultation.report ? (
        <>
          {/* Resumo do relatório */}
          <Card
            variant="strong"
            className={
              consultation.report.riskLevel === "HIGH"
                ? "border-red-200/60 bg-gradient-to-br from-red-50/80 to-rose-50/40"
                : consultation.report.riskLevel === "MEDIUM"
                  ? "border-amber-200/60 bg-gradient-to-br from-amber-50/60 to-orange-50/30"
                  : "border-emerald-200/60 bg-gradient-to-br from-emerald-50/60 to-teal-50/30"
            }
          >
            <div className="flex gap-3">
              <Shield className="h-5 w-5 shrink-0 text-slate-600" />
              <div>
                <h2 className="font-bold text-slate-900">Resumo do relatório</h2>
                <p className="mt-2 leading-relaxed text-slate-700">
                  {consultation.report.summary}
                </p>
              </div>
            </div>
          </Card>

          {/* Nível de confiança na identificação */}
          {confidenceInfo && (
            <Card
              variant="strong"
              className={
                confidenceInfo.level === "NONE"
                  ? "border-red-200/60 bg-gradient-to-br from-red-50/60 to-rose-50/30"
                  : confidenceInfo.level === "LOW"
                    ? "border-amber-200/60 bg-gradient-to-br from-amber-50/60 to-orange-50/30"
                    : "border-slate-200/60 bg-gradient-to-br from-slate-50/60 to-blue-50/30"
              }
            >
              <div className="flex gap-3">
                <Search className="h-5 w-5 shrink-0 text-slate-600" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-slate-900">
                      Precisão da identificação
                    </h2>
                    <ConfidenceBadge
                      level={confidenceInfo.level}
                      size="md"
                    />
                  </div>
                  <p className="mt-2 leading-relaxed text-slate-700">
                    {confidenceInfo.description}
                  </p>

                  {/* Estatísticas de matching por finding */}
                  {findings.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {(() => {
                        const confirmed = findings.filter(
                          (f: SourceFinding) => f.matchConfidence === "confirmed",
                        ).length;
                        const strong = findings.filter(
                          (f: SourceFinding) => f.matchConfidence === "strong",
                        ).length;
                        const weak = findings.filter(
                          (f: SourceFinding) =>
                            f.matchConfidence === "weak" || f.matchConfidence === "unknown",
                        ).length;
                        return (
                          <>
                            {confirmed > 0 && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
                                <Fingerprint className="h-3 w-3" />
                                {confirmed} confirmado(s)
                              </span>
                            )}
                            {strong > 0 && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200/80">
                                <Shield className="h-3 w-3" />
                                {strong} forte(s)
                              </span>
                            )}
                            {weak > 0 && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200/80">
                                <XCircle className="h-3 w-3" />
                                {weak} fraco(s)
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {confidenceInfo.fieldsMissing?.length > 0 && (
                    <div className="mt-3 rounded-xl border border-amber-200/60 bg-amber-50/40 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                        Dados que aumentariam a precisão
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {confidenceInfo.fieldsMissing.map(
                          (field: string) => (
                            <span
                              key={field}
                              className="inline-flex items-center rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                            >
                              {field === "CPF"
                                ? "CPF"
                                : field === "data de nascimento"
                                  ? "Data de nascimento"
                                  : field === "nome da mãe"
                                    ? "Nome da mãe"
                                    : field}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Registros encontrados */}
          <Card variant="strong">
            <h2 className="mb-5 text-lg font-bold text-slate-900">
              Registros encontrados
              <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-600">
                {findings.length}
              </span>
            </h2>
            {findings.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhum registro público relevante nas fontes consultadas.
              </p>
            ) : (
              <div className="space-y-3">
                {findings.map((f, i) => {
                  const s = severityConfig[f.severity] ?? severityConfig.info;
                  return (
                    <div key={i} className={`rounded-xl border p-5 ${s.card}`}>
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-bold text-slate-900">{f.title}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              {(f as SourceFinding).matchConfidence && (
                                <MatchBadge
                                  confidence={(f as SourceFinding).matchConfidence!}
                                  score={(f as SourceFinding).matchScore}
                                />
                              )}
                              <span className="text-xs font-semibold text-slate-400">
                                {f.source}
                              </span>
                            </div>
                          </div>
                          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                            {f.category}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            {f.description}
                          </p>
                          {f.url && (
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                            >
                              Ver fonte original
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Fontes consultadas */}
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-400" />
              <h2 className="font-bold text-slate-900">Fontes consultadas</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {sources.map(
                (
                  s: { name: string; status: string; message?: string },
                  i: number,
                ) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-700">{s.name}</span>
                    <span
                      className={
                        s.status === "success"
                          ? "text-emerald-600"
                          : s.status === "error"
                            ? "text-red-500"
                            : "text-slate-400"
                      }
                    >
                      {s.status === "success"
                        ? "OK"
                        : s.status === "unavailable"
                          ? "Indisponível"
                          : s.status}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <p className="text-slate-600">
            Status: {consultation.status}
            {consultation.errorMsg && ` — ${consultation.errorMsg}`}
          </p>
        </Card>
      )}
    </div>
  );
}