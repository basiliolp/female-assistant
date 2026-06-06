import { RiskLevel } from "@prisma/client";
import { publicDataSources, type SearchInput, type SourceFinding } from "./sources";

export type AggregatedReport = {
  summary: string;
  riskLevel: RiskLevel;
  findings: SourceFinding[];
  sources: { id: string; name: string; status: string; message?: string }[];
};

function calculateRiskLevel(findings: SourceFinding[]): RiskLevel {
  if (findings.some((f) => f.severity === "critical")) return RiskLevel.HIGH;
  if (findings.some((f) => f.severity === "warning")) return RiskLevel.MEDIUM;
  if (findings.length === 0) return RiskLevel.LOW;
  return RiskLevel.UNKNOWN;
}

function buildSummary(findings: SourceFinding[], name: string): string {
  if (findings.some((f) => f.severity === "critical")) {
    return `Foram encontrados registros de alto risco para ${name}. Recomendamos extrema cautela e, se necessário, busque apoio (190, 180 ou rede de confiança).`;
  }
  if (findings.some((f) => f.severity === "warning")) {
    return `Foram identificados registros que merecem atenção para ${name}. Analise os detalhes antes de prosseguir.`;
  }
  return `Nenhum registro público relevante foi encontrado para ${name} nas fontes consultadas. Isso não garante ausência total de histórico — use como apoio à sua decisão.`;
}

export async function generateReport(input: SearchInput): Promise<AggregatedReport> {
  const results = await Promise.all(
    publicDataSources.map((source) => source.search(input)),
  );

  const findings = results.flatMap((r) => r.findings);
  const riskLevel = calculateRiskLevel(findings);

  return {
    summary: buildSummary(findings, input.subjectName),
    riskLevel,
    findings,
    sources: results.map((r) => ({
      id: r.source,
      name: r.source,
      status: r.status,
      message: r.message,
    })),
  };
}
