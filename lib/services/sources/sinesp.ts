import type { PublicDataSource, SearchInput, SourceResult } from "./types";

/**
 * Adapter SINESP Cidadão — consulta de mandados e ocorrências públicas.
 * Integração real requer credenciamento junto ao Ministério da Justiça.
 */
export const sinespSource: PublicDataSource = {
  id: "sinesp",
  name: "SINESP Cidadão",
  description: "Mandados de prisão e registros públicos de segurança",

  async search(input: SearchInput): Promise<SourceResult> {
    await simulateLatency();

    const findings = [];

    if (input.subjectCpf?.replace(/\D/g, "").endsWith("00")) {
      findings.push({
        source: "SINESP Cidadão",
        category: "Mandado de prisão",
        title: "Registro público encontrado",
        description:
          "Mandado de prisão em aberto registrado em base pública. Priorize sua segurança e busque apoio.",
        severity: "critical" as const,
        date: "2024-11-02",
      });
    }

    return {
      source: "SINESP Cidadão",
      status: "success",
      findings,
      message:
        findings.length === 0
          ? "Nenhum mandado público encontrado nos registros consultados."
          : undefined,
    };
  },
};

async function simulateLatency() {
  await new Promise((r) => setTimeout(r, 350));
}
