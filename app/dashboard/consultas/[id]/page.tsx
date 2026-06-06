import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, ExternalLink, Shield, Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChannelBadge } from "@/components/channel-badge";
import { RiskBadge } from "@/components/risk-badge";
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
        <Link href="/dashboard/consultas" className="mt-4 inline-block text-sm font-semibold text-rose-600">
          Voltar ao histórico
        </Link>
      </Card>
    );
  }

  const findings: SourceFinding[] = consultation.report
    ? JSON.parse(consultation.report.findings)
    : [];
  const sources = consultation.report ? JSON.parse(consultation.report.sources) : [];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/consultas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-rose-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao histórico
      </Link>

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
              {format(consultation.createdAt, "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ChannelBadge channel={consultation.channel} />
            {consultation.report && (
              <RiskBadge level={consultation.report.riskLevel} size="md" />
            )}
          </div>
        </div>
      </div>

      {consultation.report ? (
        <>
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
                    <div
                      key={i}
                      className={`rounded-xl border p-5 ${s.card}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-bold text-slate-900">{f.title}</p>
                            <span className="text-xs font-semibold text-slate-400">
                              {f.source}
                            </span>
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

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-400" />
              <h2 className="font-bold text-slate-900">Fontes consultadas</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {sources.map(
                (s: { name: string; status: string; message?: string }, i: number) => (
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
