import type { PublicDataSource, SearchInput, SourceResult } from "./types";

/**
 * JusBrasil — API comercial de dados jurídicos
 *
 * API paga que permite consulta processual por CPF, CNPJ, nome ou número CNJ.
 * Docs: https://api.jusbrasil.com.br/docs/index.html
 * Planos: https://insight.jusbrasil.com.br/ (comercial)
 *
 * Endpoints da API real:
 *   - Consulta criminal por CPF: POST /background-check/lawsuits/criminal
 *     Headers: { apikey: "..." }
 *     Body: { documentNumber: "CPF", pagination: { cursor: "", size: 1000 } }
 *
 * ⚠️ Requer contratação de plano comercial. Sem JUSBRASIL_API_KEY,
 *    a fonte retorna indisponível com orientações.
 */

const JUSBRASIL_API_KEY = process.env.JUSBRASIL_API_KEY ?? "";

const JUSBRASIL_BASE = process.env.JUSBRASIL_API_URL ?? "https://api.jusbrasil.com.br";

export const jusbrasilSource: PublicDataSource = {
  id: "jusbrasil",
  name: "JusBrasil",
  description: "Dados processuais e publicações em diários oficiais (API comercial)",

  async search(input: SearchInput): Promise<SourceResult> {
    if (!JUSBRASIL_API_KEY) {
      return {
        source: "JusBrasil",
        status: "unavailable",
        findings: [],
        message:
          "Consulta ao JusBrasil requer API Key comercial. " +
          "Contrate um plano em insight.jusbrasil.com.br e configure JUSBRASIL_API_KEY.",
      };
    }

    // Exemplo de implementação para quando a chave for configurada:
    //
    // const result = await httpFetch(`${JUSBRASIL_BASE}/background-check/lawsuits/criminal`, {
    //   method: 'POST',
    //   headers: { apikey: JUSBRASIL_API_KEY },
    //   body: { documentNumber: input.subjectCpf?.replace(/\D/g, ''), pagination: { cursor: '', size: 100 } },
    //   timeout: 10_000,
    // });
    //
    // if (result.ok && result.data) { ... processa resultados ... }

    // Enquanto não há implementação real:
    return {
      source: "JusBrasil",
      status: "unavailable",
      findings: [],
      message:
        "A API JusBrasil está configurada, mas a integração ainda não foi implementada. " +
        "Ela estará disponível em breve.",
    };
  },
};