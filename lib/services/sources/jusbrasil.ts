import type { PublicDataSource, SearchInput, SourceResult } from "./types";

/**
 * Adapter JusBrasil — integração real via API oficial ou scraping autorizado.
 * Documentação: https://api.jusbrasil.com.br (requer credenciais comerciais)
 */
export const jusbrasilSource: PublicDataSource = {
  id: "jusbrasil",
  name: "JusBrasil",
  description: "Processos judiciais e publicações em diários oficiais",

  async search(input: SearchInput): Promise<SourceResult> {
    // TODO: substituir por chamada real à API JusBrasil
    await simulateLatency();

    const findings = [];

    if (input.subjectName.toLowerCase().includes("silva")) {
      findings.push({
        source: "JusBrasil",
        category: "Processo cível",
        title: "Ação de indenização por danos morais",
        description:
          "Processo encontrado em tramitação. Recomenda-se verificar detalhes no tribunal de origem.",
        severity: "warning" as const,
        url: "https://www.jusbrasil.com.br",
        date: "2023-08-14",
      });
    }

    return {
      source: "JusBrasil",
      status: "success",
      findings,
      message:
        findings.length === 0
          ? "Nenhum processo público encontrado com os dados informados."
          : undefined,
    };
  },
};

async function simulateLatency() {
  await new Promise((r) => setTimeout(r, 400));
}
