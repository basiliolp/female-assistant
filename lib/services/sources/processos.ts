import type { PublicDataSource, SearchInput, SourceResult } from "./types";

/**
 * Adapter tribunais / DataJud (CNJ) — processos criminais e medidas protetivas.
 * API pública CNJ: https://datajud-wiki.cnj.jus.br/
 */
export const processosSource: PublicDataSource = {
  id: "datajud",
  name: "Tribunais / DataJud",
  description: "Processos criminais, medidas protetivas e violência doméstica",

  async search(input: SearchInput): Promise<SourceResult> {
    await simulateLatency();

    const findings = [];
    const nameLower = input.subjectName.toLowerCase();

    if (nameLower.includes("santos") || nameLower.includes("oliveira")) {
      findings.push({
        source: "DataJud / Tribunais",
        category: "Violência doméstica",
        title: "Medida protetiva de urgência",
        description:
          "Registro de medida protetiva em processo criminal. Histórico relevante para avaliação de risco.",
        severity: "critical" as const,
        date: "2025-01-20",
      });
    }

    if (nameLower.includes("costa")) {
      findings.push({
        source: "DataJud / Tribunais",
        category: "Processo criminal",
        title: "Ação penal em andamento",
        description: "Processo criminal público em tramitação.",
        severity: "warning" as const,
        date: "2022-05-10",
      });
    }

    return {
      source: "DataJud / Tribunais",
      status: "success",
      findings,
      message:
        findings.length === 0
          ? "Nenhum processo criminal público identificado."
          : undefined,
    };
  },
};

async function simulateLatency() {
  await new Promise((r) => setTimeout(r, 500));
}
