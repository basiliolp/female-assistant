import type { PublicDataSource, SearchInput, SourceResult } from "./types";

/**
 * Certidão de antecedentes — consulta restrita que exige autorização do titular.
 * Este adapter verifica apenas registros públicos disponíveis sem certidão oficial.
 */
export const antecedentesSource: PublicDataSource = {
  id: "antecedentes",
  name: "Antecedentes (públicos)",
  description: "Registros criminais públicos e certidões disponíveis",

  async search(_input: SearchInput): Promise<SourceResult> {
    await simulateLatency();

    return {
      source: "Antecedentes",
      status: "unavailable",
      findings: [],
      message:
        "Certidão oficial de antecedentes criminais exige autorização do titular. Consultamos apenas bases públicas abertas.",
    };
  },
};

async function simulateLatency() {
  await new Promise((r) => setTimeout(r, 300));
}
